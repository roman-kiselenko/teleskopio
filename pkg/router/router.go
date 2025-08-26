package router

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log/slog"
	"net/http"
	"strings"

	"teleskopio/pkg/config"

	"github.com/gin-gonic/gin"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/apis/meta/v1/unstructured"
	"k8s.io/apimachinery/pkg/runtime/schema"
	"k8s.io/apimachinery/pkg/types"
	k8sYAML "k8s.io/apimachinery/pkg/util/yaml"
	w "k8s.io/apimachinery/pkg/watch"
	"k8s.io/client-go/dynamic"

	webSocket "teleskopio/pkg/socket"
)

type Cluster struct {
	CurrentContext string `json:"current_context"`
	Server         string `json:"server"`
}

type Payload struct {
	Context string `json:"context"`
	Server  string `json:"server"`
}

type ApiResourceInfo struct {
	Group      string `json:"group"`
	Version    string `json:"version"`
	Kind       string `json:"kind"`
	Namespaced bool   `json:"namespaced"`
}

type ListRequest struct {
	Continue string `json:"continue"`
	Limit    int64  `json:"limit"`
	Server   string `json:"server"`
	Context  string `json:"context"`
	Resource string `json:"resource"`
	Request  struct {
		Namespace  string `json:"namespace"`
		Group      string `json:"group"`
		Version    string `json:"version"`
		Kind       string `json:"kind"`
		Namespaced bool   `json:"namespaced"`
	} `json:"request"`
}

type WatchRequest struct {
	Server   string `json:"server"`
	Context  string `json:"context"`
	Resource string `json:"resource"`
	Request  struct {
		Namespace       string `json:"namespace"`
		Group           string `json:"group"`
		Version         string `json:"version"`
		Kind            string `json:"kind"`
		Namespaced      bool   `json:"namespaced"`
		ResourceVersion string `json:"resource_version"`
	} `json:"request"`
}

type GetRequest struct {
	Server   string `json:"server"`
	Context  string `json:"context"`
	Resource string `json:"resource"`
	Request  struct {
		Name       string `json:"name"`
		Namespace  string `json:"namespace"`
		Group      string `json:"group"`
		Version    string `json:"version"`
		Kind       string `json:"kind"`
		Namespaced bool   `json:"namespaced"`
	} `json:"request"`
}

type DeleteRequest struct {
	Server   string `json:"server"`
	Context  string `json:"context"`
	Resource string `json:"resource"`
	Request  struct {
		Name            string `json:"name"`
		Namespace       string `json:"namespace"`
		Group           string `json:"group"`
		Version         string `json:"version"`
		Kind            string `json:"kind"`
		Namespaced      bool   `json:"namespaced"`
		ResourceVersion string `json:"resource_version"`
	} `json:"request"`
}

type CreateRequest struct {
	Server    string `json:"server"`
	Context   string `json:"context"`
	Namespace string `json:"namespace"`
	Yaml      string `json:"yaml"`
}

type NodeOperation struct {
	Name         string `json:"name"`
	Group        string `json:"group"`
	Version      string `json:"version"`
	Kind         string `json:"kind"`
	Namespaced   bool   `json:"namespaced"`
	ResourceName string `json:"resourceName"`
	Server       string `json:"server"`
	Context      string `json:"context"`
	Resource     string `json:"resource"`
	Cordon       bool   `json:"cordon"`
}

type Route struct {
	cfg     *config.Config
	clients *config.Clients
	hub     *webSocket.Hub
}

func New(hub *webSocket.Hub, ginEngine *gin.Engine, cfg *config.Config, clients *config.Clients) (Route, error) {
	r := Route{
		cfg:     cfg,
		clients: clients,
		hub:     hub,
	}
	return r, nil
}

func (r *Route) LookupConfigs(c *gin.Context) {
	configs := []Cluster{}
	for _, c := range r.cfg.Kube.Configs {
		context := c["current-context"].(string)
		for _, cluster := range c["clusters"].([]interface{}) {
			// name := cluster.(map[string]interface{})["cluster"]
			entry := cluster.(map[string]interface{})["cluster"]
			address := entry.(map[string]interface{})["server"].(string)
			// server := cluster.(map[string]interface{})["server"]
			// slog.Default().Debug("config", "name", name, "context", context)
			configs = append(configs, Cluster{Server: address, CurrentContext: context})
		}
	}
	c.JSON(http.StatusOK, configs)
}

func (r *Route) GetVersion(c *gin.Context) {
	var req Payload
	if err := c.ShouldBindJSON(&req); err != nil {
		slog.Error("parsing", "err", err.Error())
		c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}
	ver, err := r.clients.Typed[req.Context].Discovery().ServerVersion()
	if err != nil {
		slog.Error("client", "err", err.Error(), "req", req)
		c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}
	c.JSON(http.StatusOK, ver)
}

func (r *Route) ListResources(c *gin.Context) {
	var req Payload
	if err := c.ShouldBindJSON(&req); err != nil {
		slog.Error("parsing", "err", err.Error())
		c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}
	discoveryClient := r.clients.Typed[req.Context].Discovery()

	apiGroupResources, err := discoveryClient.ServerPreferredResources()
	if err != nil {
		slog.Error("discovery", "err", err.Error(), "req", req)
		c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}

	result := []ApiResourceInfo{}
	for _, list := range apiGroupResources {
		gv, err := schema.ParseGroupVersion(list.GroupVersion)
		if err != nil {
			slog.Error("parsing group version", "err", err.Error(), "req", req)
			c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
			return
		}
		for _, res := range list.APIResources {
			result = append(result, ApiResourceInfo{
				Group:      gv.Group,
				Version:    gv.Version,
				Kind:       res.Kind,
				Namespaced: res.Namespaced,
			})
		}
	}
	c.JSON(http.StatusOK, result)
}

func (r *Route) ListDynamicResource(c *gin.Context) {
	var req ListRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		slog.Error("parsing", "err", err.Error())
		c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}
	apiResourceList, err := r.clients.Typed[req.Context].ServerResourcesForGroupVersion(schema.GroupVersion{
		Group:   req.Request.Group,
		Version: req.Request.Version,
	}.String())
	if err != nil {
		slog.Error("api list", "err", err.Error(), "req", req)
		c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}

	for _, r := range apiResourceList.APIResources {
		if r.Kind == req.Request.Kind && r.SingularName == strings.ToLower(req.Request.Kind) {
			req.Resource = r.Name
		}
	}
	gvr := schema.GroupVersionResource{
		Group:    req.Request.Group,
		Version:  req.Request.Version,
		Resource: req.Resource,
	}
	var ri dynamic.ResourceInterface
	if req.Request.Namespace != "" {
		ri = r.clients.Dynamic[req.Context].Resource(gvr).Namespace(req.Request.Namespace)
	} else {
		ri = r.clients.Dynamic[req.Context].Resource(gvr)
	}

	list, err := ri.List(context.TODO(), metav1.ListOptions{
		Limit:    req.Limit,
		Continue: req.Continue,
	})
	if err != nil {
		slog.Error("list", "err", err.Error(), "req", req)
		c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}

	for i := range list.Items {
		list.Items[i].SetAPIVersion(fmt.Sprintf("%s", req.Request.Version))
		if req.Request.Group != "" {
			list.Items[i].SetAPIVersion(fmt.Sprintf("%s/%s", req.Request.Group, req.Request.Version))
		}
		list.Items[i].SetKind(req.Request.Kind)
	}
	continueToken, resourceVersion := "", ""
	metadata := list.Object["metadata"].(map[string]interface{})
	if v, ok := metadata["resourceVersion"].(string); ok {
		resourceVersion = v
	}
	if v, ok := metadata["continue_"].(string); ok {
		continueToken = v
	}
	c.JSON(http.StatusOK, []interface{}{list.Items, continueToken, resourceVersion})
}

func (r *Route) WatchDynamicResource(c *gin.Context) {
	var req WatchRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		slog.Error("parsing", "err", err.Error())
		c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}
	apiResourceList, err := r.clients.Typed[req.Context].ServerResourcesForGroupVersion(schema.GroupVersion{
		Group:   req.Request.Group,
		Version: req.Request.Version,
	}.String())
	if err != nil {
		slog.Error("api list", "err", err.Error(), "req", req)
		c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}

	for _, r := range apiResourceList.APIResources {
		if r.Kind == req.Request.Kind && r.SingularName == strings.ToLower(req.Request.Kind) {
			req.Resource = r.Name
		}
	}
	gvr := schema.GroupVersionResource{
		Group:    req.Request.Group,
		Version:  req.Request.Version,
		Resource: req.Resource,
	}
	var ri dynamic.ResourceInterface
	if req.Request.Namespace != "" {
		ri = r.clients.Dynamic[req.Context].Resource(gvr).Namespace(req.Request.Namespace)
	} else {
		ri = r.clients.Dynamic[req.Context].Resource(gvr)
	}
	watch, err := ri.Watch(context.TODO(), metav1.ListOptions{ResourceVersion: req.Request.ResourceVersion})
	ch := watch.ResultChan()

	slog.Info("Watching ...", "gvr", gvr.String())
	go func() {
		for event := range ch {
			switch event.Type {
			case w.Added, w.Modified:
				slog.Debug("message received", "gvr", gvr.String(), "type", event.Type)
				payload, _ := json.Marshal(map[string]interface{}{
					"event":   fmt.Sprintf("%s-%s-%s-updated", req.Request.Kind, req.Context, req.Server),
					"payload": event.Object,
				})
				r.hub.Broadcast(payload)
			case w.Deleted:
				slog.Debug("message received", "gvr", gvr.String(), "type", event.Type)
				payload, _ := json.Marshal(map[string]interface{}{
					"event":   fmt.Sprintf("%s-%s-%s-deleted", req.Request.Kind, req.Context, req.Server),
					"payload": event.Object,
				})
				r.hub.Broadcast(payload)
			case w.Error:
				slog.Error("watching error", "gvr", gvr.String(), "error", event.Object.DeepCopyObject().GetObjectKind())
			}
		}
	}()

	c.JSON(http.StatusOK, gin.H{"success": ""})
}

func (r *Route) GetDynamicResource(c *gin.Context) {
	var req GetRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		slog.Error("parsing", "err", err.Error())
		c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}
	apiResourceList, err := r.clients.Typed[req.Context].ServerResourcesForGroupVersion(schema.GroupVersion{
		Group:   req.Request.Group,
		Version: req.Request.Version,
	}.String())
	if err != nil {
		slog.Error("api list", "err", err.Error(), "req", req)
		c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}

	for _, r := range apiResourceList.APIResources {
		if r.Kind == req.Request.Kind && r.SingularName == strings.ToLower(req.Request.Kind) {
			req.Resource = r.Name
		}
	}
	gvr := schema.GroupVersionResource{
		Group:    req.Request.Group,
		Version:  req.Request.Version,
		Resource: req.Resource,
	}
	var ri dynamic.ResourceInterface
	if req.Request.Namespace != "" {
		ri = r.clients.Dynamic[req.Context].Resource(gvr).Namespace(req.Request.Namespace)
	} else {
		ri = r.clients.Dynamic[req.Context].Resource(gvr)
	}

	res, err := ri.Get(context.TODO(), req.Request.Name, metav1.GetOptions{})
	if err != nil {
		slog.Error("get", "err", err.Error(), "req", req)
		c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}
	c.YAML(http.StatusOK, res.Object)
}

func (r *Route) CreateKubeResource(c *gin.Context) {
	var req CreateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		slog.Error("parsing", "err", err.Error())
		c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}

	decoder := k8sYAML.NewYAMLOrJSONDecoder(bytes.NewReader([]byte(req.Yaml)), 1024)
	obj := &unstructured.Unstructured{}
	if err := decoder.Decode(obj); err != nil && err != io.EOF {
		slog.Error("cant parse yaml", "err", err.Error())
		c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}

	gvk := obj.GroupVersionKind()

	apiResList, err := r.clients.Typed[req.Context].ServerResourcesForGroupVersion(schema.GroupVersion{
		Group:   gvk.Group,
		Version: gvk.Version,
	}.String())
	if err != nil {
		slog.Error("api list", "err", err.Error(), "req", req)
		c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}

	var plural string
	for _, res := range apiResList.APIResources {
		if res.Kind == gvk.Kind {
			plural = res.Name
			break
		}
	}
	if plural == "" {
		err := fmt.Errorf("resource kind %s not found in API group %s/%s", gvk.Kind, gvk.Group, gvk.Version)
		slog.Error("resource not found", "err", err.Error(), "req", req)
		c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}

	gvr := schema.GroupVersionResource{
		Group:    gvk.Group,
		Version:  gvk.Version,
		Resource: plural,
	}

	ns := obj.GetNamespace()
	var ri dynamic.ResourceInterface
	if ns != "" {
		ri = r.clients.Dynamic[req.Context].Resource(gvr).Namespace(ns)
	} else {
		ri = r.clients.Dynamic[req.Context].Resource(gvr)
	}

	created, err := ri.Create(context.TODO(), obj, metav1.CreateOptions{})
	if err != nil {
		slog.Error("cant create object", "err", err.Error(), "obj", obj)
		c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}

	c.YAML(http.StatusOK, created)
}

func (r *Route) DeleteDynamicResource(c *gin.Context) {
	var req DeleteRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		slog.Error("parsing", "err", err.Error())
		c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}
	apiResourceList, err := r.clients.Typed[req.Context].ServerResourcesForGroupVersion(schema.GroupVersion{
		Group:   req.Request.Group,
		Version: req.Request.Version,
	}.String())
	if err != nil {
		slog.Error("api list", "err", err.Error(), "req", req)
		c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}

	for _, r := range apiResourceList.APIResources {
		if r.Kind == req.Request.Kind && r.SingularName == strings.ToLower(req.Request.Kind) {
			req.Resource = r.Name
		}
	}
	gvr := schema.GroupVersionResource{
		Group:    req.Request.Group,
		Version:  req.Request.Version,
		Resource: req.Resource,
	}
	var ri dynamic.ResourceInterface
	if req.Request.Namespace != "" {
		ri = r.clients.Dynamic[req.Context].Resource(gvr).Namespace(req.Request.Namespace)
	} else {
		ri = r.clients.Dynamic[req.Context].Resource(gvr)
	}

	if err := ri.Delete(context.TODO(), req.Request.Name, metav1.DeleteOptions{}); err != nil {
		slog.Error("delete", "err", err.Error(), "req", req)
		c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": ""})
}

func (r *Route) NodeOperation(c *gin.Context) {
	var req NodeOperation
	if err := c.ShouldBindJSON(&req); err != nil {
		slog.Error("parsing", "err", err.Error())
		c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}
	apiResourceList, err := r.clients.Typed[req.Context].ServerResourcesForGroupVersion(schema.GroupVersion{
		Group:   req.Group,
		Version: req.Version,
	}.String())
	if err != nil {
		slog.Error("api list", "err", err.Error(), "req", req)
		c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}

	for _, r := range apiResourceList.APIResources {
		if r.Kind == req.Kind && r.SingularName == strings.ToLower(req.Kind) {
			req.Resource = r.Name
		}
	}
	gvr := schema.GroupVersionResource{
		Group:    req.Group,
		Version:  req.Version,
		Resource: req.Resource,
	}
	ri := r.clients.Dynamic[req.Context].Resource(gvr)

	payload := []struct {
		Op    string `json:"op"`
		Path  string `json:"path"`
		Value bool   `json:"value"`
	}{{
		Op:    "replace",
		Path:  "/spec/unschedulable",
		Value: req.Cordon,
	}}
	payloadBytes, _ := json.Marshal(payload)

	if _, err := ri.Patch(context.TODO(), req.Name, types.JSONPatchType, payloadBytes, metav1.PatchOptions{}); err != nil {
		slog.Error("patch", "err", err.Error(), "req", req)
		c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": ""})
}
