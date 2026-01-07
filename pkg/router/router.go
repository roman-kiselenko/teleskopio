package router

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log/slog"
	"net/http"
	"os"
	"strings"
	"time"

	"teleskopio/pkg/config"
	"teleskopio/pkg/model"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"helm.sh/helm/v3/pkg/action"

	"golang.org/x/crypto/bcrypt"
	batchv1 "k8s.io/api/batch/v1"
	v1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/apis/meta/v1/unstructured"

	"k8s.io/apimachinery/pkg/runtime/schema"
	"k8s.io/apimachinery/pkg/types"
	k8sYAML "k8s.io/apimachinery/pkg/util/yaml"
	w "k8s.io/apimachinery/pkg/watch"
	"k8s.io/client-go/dynamic"
	"k8s.io/kubectl/pkg/drain"

	webSocket "teleskopio/pkg/socket"
)

func New(hub *webSocket.Hub, _ *gin.Engine, cfg *config.Config, clusters []*config.Cluster, users *config.Users) (Route, error) {
	r := Route{
		cfg:             cfg,
		clusters:        clusters,
		users:           users,
		hub:             hub,
		watchers:        make(map[string]w.Interface),
		podLogsWatchers: make(map[string]chan bool),
	}
	return r, nil
}

func (r *Route) LookupConfigs(c *gin.Context) {
	configs := []Cluster{}
	for _, k := range r.clusters {
		configs = append(configs, Cluster{Server: k.Address})
	}
	c.JSON(http.StatusOK, configs)
}

func (r *Route) GetCluster(server string) *config.Cluster {
	for _, c := range r.clusters {
		if c.Address == server {
			return c
		}
	}
	return nil
}

func (r *Route) GetVersion(c *gin.Context) {
	var req Payload
	if err := c.ShouldBindJSON(&req); err != nil {
		slog.Error("parsing", "err", err.Error())
		c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}
	ver, err := r.GetCluster(req.Server).Typed.Discovery().ServerVersion()
	if err != nil {
		slog.Error("client", "err", err.Error(), "req", req)
		c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}
	c.JSON(http.StatusOK, ver)
}

func (r *Route) ListCustomResourceDefinitions(c *gin.Context) {
	var req Payload
	if err := c.ShouldBindJSON(&req); err != nil {
		slog.Error("parsing", "err", err.Error())
		c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}

	crdList, err := r.GetCluster(req.Server).APIExtension.ApiextensionsV1().CustomResourceDefinitions().List(context.TODO(), metav1.ListOptions{})
	if err != nil {
		slog.Error("api extension", "err", err.Error(), "req", req)
		c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, []interface{}{crdList.Items, crdList.Continue, crdList.ResourceVersion})
}

func (r *Route) ListResources(c *gin.Context) {
	var req Payload
	if err := c.ShouldBindJSON(&req); err != nil {
		slog.Error("parsing", "err", err.Error())
		c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}
	discoveryClient := r.GetCluster(req.Server).Typed.Discovery()

	apiGroupResources, err := discoveryClient.ServerPreferredResources()
	if err != nil {
		slog.Error("discovery", "err", err.Error(), "req", req)
		c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}

	result := []APIResourceInfo{}
	for _, list := range apiGroupResources {
		gv, err := schema.ParseGroupVersion(list.GroupVersion)
		if err != nil {
			slog.Error("parsing group version", "err", err.Error(), "req", req)
			c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
			return
		}
		for _, res := range list.APIResources {
			result = append(result, APIResourceInfo{
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
	apiResourceList, err := r.GetCluster(req.Server).Typed.ServerResourcesForGroupVersion(schema.GroupVersion{
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
		ri = r.GetCluster(req.Server).Dynamic.Resource(gvr).Namespace(req.Request.Namespace)
	} else {
		ri = r.GetCluster(req.Server).Dynamic.Resource(gvr)
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
		list.Items[i].SetAPIVersion(req.Request.Version)
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
	if v, ok := metadata["continue"].(string); ok {
		continueToken = v
	}
	c.JSON(http.StatusOK, []interface{}{list.Items, continueToken, resourceVersion})
}

func (r *Route) ListEventsDynamicResource(c *gin.Context) {
	var req ListRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		slog.Error("parsing", "err", err.Error())
		c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}
	apiResourceList, err := r.GetCluster(req.Server).Typed.ServerResourcesForGroupVersion(schema.GroupVersion{
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
		ri = r.GetCluster(req.Server).Dynamic.Resource(gvr).Namespace(req.Request.Namespace)
	} else {
		ri = r.GetCluster(req.Server).Dynamic.Resource(gvr)
	}
	fieldSelector := ""
	if req.Request.Group == "" {
		fieldSelector = fmt.Sprintf("involvedObject.uid=%s", req.UID)
	} else {
		fieldSelector = fmt.Sprintf("regarding.uid=%s", req.UID)
	}
	listParams := metav1.ListOptions{
		Limit:         req.Limit,
		Continue:      req.Continue,
		FieldSelector: fieldSelector,
	}

	list, err := ri.List(context.TODO(), listParams)
	if err != nil {
		slog.Error("list", "err", err.Error(), "req", req)
		c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}

	for i := range list.Items {
		list.Items[i].SetAPIVersion("%s")
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

func (r *Route) WatchEventsDynamicResource(c *gin.Context) {
	var req WatchRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		slog.Error("parsing", "err", err.Error())
		c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}
	apiResourceList, err := r.GetCluster(req.Server).Typed.ServerResourcesForGroupVersion(schema.GroupVersion{
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
		ri = r.GetCluster(req.Server).Dynamic.Resource(gvr).Namespace(req.Request.Namespace)
	} else {
		ri = r.GetCluster(req.Server).Dynamic.Resource(gvr)
	}
	watcherKey := fmt.Sprintf("%s-%s-updated", req.UID, req.Server)
	_, ok := r.watchers[watcherKey]
	if ok {
		slog.Info("watcher exist", "gvr", gvr.String(), "key", watcherKey)
		c.JSON(http.StatusOK, gin.H{"success": ""})
		return
	}
	watchOptions := metav1.ListOptions{ResourceVersion: req.Request.ResourceVersion}
	fieldSelector := ""
	if req.Request.Group == "" {
		fieldSelector = fmt.Sprintf("involvedObject.uid=%s", req.UID)
	} else {
		fieldSelector = fmt.Sprintf("regarding.uid=%s", req.UID)
	}
	watchOptions.FieldSelector = fieldSelector
	watch, err := ri.Watch(context.TODO(), watchOptions)
	if err != nil {
		slog.Error("watcher", "err", err.Error())
		c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}
	ch := watch.ResultChan()
	r.watchers[watcherKey] = watch
	slog.Info("Watching ...", "gvr", gvr.String())
	go func() {
		for event := range ch {
			switch event.Type {
			case w.Added, w.Modified:
				slog.Debug("message received", "gvr", gvr.String(), "watchKey", watcherKey, "type", event.Type)
				payload, _ := json.Marshal(map[string]interface{}{
					"event":   watcherKey,
					"payload": event.Object,
				})
				r.hub.Broadcast(payload)
			case w.Error:
				slog.Error("watching error", "gvr", gvr.String(), "watchKey", watcherKey, "error", event.Object.DeepCopyObject().GetObjectKind())
				delete(r.watchers, watcherKey)
			}
		}
	}()

	c.JSON(http.StatusOK, gin.H{"success": ""})
}

func (r *Route) WatchDynamicResource(c *gin.Context) {
	var req WatchRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		slog.Error("parsing", "err", err.Error())
		c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}
	apiResourceList, err := r.GetCluster(req.Server).Typed.ServerResourcesForGroupVersion(schema.GroupVersion{
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
		ri = r.GetCluster(req.Server).Dynamic.Resource(gvr).Namespace(req.Request.Namespace)
	} else {
		ri = r.GetCluster(req.Server).Dynamic.Resource(gvr)
	}
	watcherKey := fmt.Sprintf("%s-%s", req.Request.Kind, req.Server)
	watch, err := ri.Watch(context.TODO(), metav1.ListOptions{ResourceVersion: req.Request.ResourceVersion})
	if err != nil {
		slog.Error("watcher", "err", err.Error())
		c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}
	ch := watch.ResultChan()
	r.watchers[watcherKey] = watch
	slog.Info("Watching ...", "gvr", gvr.String())
	go func() {
		for event := range ch {
			switch event.Type {
			case w.Added, w.Modified:
				slog.Debug("message received", "gvr", gvr.String(), "watchKey", watcherKey, "type", event.Type)
				payload, _ := json.Marshal(map[string]interface{}{
					"event":   fmt.Sprintf("%s-%s-updated", req.Request.Kind, req.Server),
					"payload": event.Object,
				})
				r.hub.Broadcast(payload)
			case w.Deleted:
				slog.Debug("message received", "gvr", gvr.String(), "watchKey", watcherKey, "type", event.Type)
				payload, _ := json.Marshal(map[string]interface{}{
					"event":   fmt.Sprintf("%s-%s-deleted", req.Request.Kind, req.Server),
					"payload": event.Object,
				})
				r.hub.Broadcast(payload)
			case w.Error:
				slog.Error("watching error", "gvr", gvr.String(), "watchKey", watcherKey, "error", event.Object.DeepCopyObject().GetObjectKind())
				delete(r.watchers, watcherKey)
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
	apiResourceList, err := r.GetCluster(req.Server).Typed.ServerResourcesForGroupVersion(schema.GroupVersion{
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
		ri = r.GetCluster(req.Server).Dynamic.Resource(gvr).Namespace(req.Request.Namespace)
	} else {
		ri = r.GetCluster(req.Server).Dynamic.Resource(gvr)
	}

	res, err := ri.Get(context.TODO(), req.Request.Name, metav1.GetOptions{})
	if err != nil {
		slog.Error("get", "err", err.Error(), "req", req)
		c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}
	c.YAML(http.StatusOK, res.Object)
}

//nolint:dupl
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

	apiResList, err := r.GetCluster(req.Server).Typed.ServerResourcesForGroupVersion(schema.GroupVersion{
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
		ri = r.GetCluster(req.Server).Dynamic.Resource(gvr).Namespace(ns)
	} else {
		ri = r.GetCluster(req.Server).Dynamic.Resource(gvr)
	}

	created, err := ri.Create(context.TODO(), obj, metav1.CreateOptions{})
	if err != nil {
		slog.Error("cant create object", "err", err.Error(), "obj", obj)
		c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}

	c.YAML(http.StatusOK, created)
}

//nolint:dupl
func (r *Route) UpdateKubeResource(c *gin.Context) {
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

	apiResList, err := r.GetCluster(req.Server).Typed.ServerResourcesForGroupVersion(schema.GroupVersion{
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
		ri = r.GetCluster(req.Server).Dynamic.Resource(gvr).Namespace(ns)
	} else {
		ri = r.GetCluster(req.Server).Dynamic.Resource(gvr)
	}

	created, err := ri.Update(context.TODO(), obj, metav1.UpdateOptions{})
	if err != nil {
		slog.Error("cant update object", "err", err.Error(), "obj", obj)
		c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}

	c.YAML(http.StatusOK, created)
}

func (r *Route) DeleteDynamicResources(c *gin.Context) {
	var req DeleteRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		slog.Error("parsing", "err", err.Error())
		c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}
	apiResourceList, err := r.GetCluster(req.Server).Typed.ServerResourcesForGroupVersion(schema.GroupVersion{
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
	if req.Request.Namespaced {
		for _, res := range req.Resources {
			if err := r.GetCluster(req.Server).Dynamic.Resource(gvr).Namespace(res.Namespace).Delete(context.TODO(), res.Name, metav1.DeleteOptions{}); err != nil {
				slog.Error("delete", "err", err.Error(), "ns", true, "res", res)
				c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
				return
			}
		}
	} else {
		for _, res := range req.Resources {
			if err := r.GetCluster(req.Server).Dynamic.Resource(gvr).Delete(context.TODO(), res.Name, metav1.DeleteOptions{}); err != nil {
				slog.Error("delete", "err", err.Error(), "ns", false, "res", res)
				c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
				return
			}
		}
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
	apiResourceList, err := r.GetCluster(req.Server).Typed.ServerResourcesForGroupVersion(schema.GroupVersion{
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
	ri := r.GetCluster(req.Server).Dynamic.Resource(gvr)

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

func (r *Route) NodeDrain(c *gin.Context) {
	var req NodeDrain
	if err := c.ShouldBindJSON(&req); err != nil {
		slog.Error("parsing", "err", err.Error())
		c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}

	node, err := r.GetCluster(req.Server).Typed.CoreV1().Nodes().Get(context.TODO(), req.ResourceName, metav1.GetOptions{})
	if err != nil {
		slog.Error("get node", "err", err.Error())
		c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}
	drainer := &drain.Helper{
		Ctx:                 context.TODO(),
		Client:              r.GetCluster(req.Server).Typed,
		Force:               req.DrainForce,
		IgnoreAllDaemonSets: req.IgnoreAllDaemonSets,
		DeleteEmptyDirData:  req.DeleteEmptyDirData,
		Timeout:             time.Duration(req.DrainTimeout) * time.Second,
		Out:                 os.Stdout,
		ErrOut:              os.Stderr,
		OnPodDeletedOrEvicted: func(pod *v1.Pod, usingEviction bool) {
			slog.Debug("Deleted/Evicted pod", "ns", pod.Namespace, "pod", pod.Name, "eviction", usingEviction)
			payload, _ := json.Marshal(map[string]interface{}{
				"event":   fmt.Sprintf("drain_%s_%s", req.ResourceName, req.ResourceUID),
				"payload": map[string]any{"pod": pod.Name, "ns": pod.Namespace, "eviction": usingEviction},
			})
			r.hub.Broadcast(payload)
		},
	}

	if err := drain.RunCordonOrUncordon(drainer, node, true); err != nil {
		slog.Error("run cordon or uncordon", "err", err.Error())
		c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}

	if err := drain.RunNodeDrain(drainer, req.ResourceName); err != nil {
		slog.Error("run eviction", "err", err.Error())
		c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": node})
}

func (r *Route) StreamPodLogs(c *gin.Context) {
	var req PodLogRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		slog.Error("parsing", "err", err.Error())
		c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}

	podLogOptions := &v1.PodLogOptions{
		Follow:    true,
		Container: req.Container,
	}
	timeNow := metav1.NewTime(time.Now())
	podLogOptions.SinceTime = &timeNow
	logsReq := r.GetCluster(req.Server).Typed.CoreV1().Pods(req.Namespace).GetLogs(req.Name, podLogOptions)
	podLogs, err := logsReq.Stream(context.Background())
	if err != nil {
		slog.Error("get stream", "err", err.Error())
		c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}
	podLogsKey := fmt.Sprintf("pod_log_line_%s_%s", req.Name, req.Namespace)
	if _, ok := r.podLogsWatchers[podLogsKey]; ok {
		slog.Info("pod logs exist", "key", podLogsKey)
		c.JSON(http.StatusOK, gin.H{"success": ""})
		return
	}
	r.podLogsWatchers[podLogsKey] = make(chan bool)
	stopAndClean := func() {
		slog.Debug("stop pod logs stream", "pod", podLogsKey)
		delete(r.podLogsWatchers, podLogsKey)
		podLogs.Close()
	}
	cancel := func() bool {
		select {
		case <-r.podLogsWatchers[podLogsKey]:
			return true
		default:
			return false
		}
	}
	go func() {
		defer stopAndClean()
		for cancel() {
			buf := make([]byte, 2000)
			numBytes, err := podLogs.Read(buf)
			if err == io.EOF {
				break
			}
			if numBytes == 0 {
				time.Sleep(time.Second)
				continue
			}
			if err != nil {
				break
			}
			message := string(buf[:numBytes])
			slog.Debug("log line", "line", message, "pod", podLogsKey)
			payload, _ := json.Marshal(map[string]interface{}{
				"event": podLogsKey,
				"payload": map[string]interface{}{
					"container": req.Container,
					"pod":       req.Name,
					"namespace": req.Namespace,
					"line":      message,
				},
			})
			r.hub.Broadcast(payload)
		}
	}()

	c.JSON(http.StatusOK, gin.H{"success": ""})
}

func (r *Route) GetPodLogs(c *gin.Context) {
	var req PodLogRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		slog.Error("parsing", "err", err.Error())
		c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}

	podLogOptions := &v1.PodLogOptions{
		TailLines: req.TailLines,
		Container: req.Container,
	}
	logsReq := r.GetCluster(req.Server).Typed.CoreV1().Pods(req.Namespace).GetLogs(req.Name, podLogOptions)
	podLogs, err := logsReq.Stream(context.Background())
	if err != nil {
		slog.Error("get stream", "err", err.Error())
		c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}
	defer podLogs.Close()

	buf := new(bytes.Buffer)
	_, err = io.Copy(buf, podLogs)
	if err != nil {
		slog.Error("copy stream", "err", err.Error())
		c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}
	lines := []string{}
	for {
		line, err := buf.ReadString('\n')
		if err == io.EOF {
			break
		}
		lines = append(lines, line)
	}

	c.JSON(http.StatusOK, lines)
}

func (r *Route) StopStreamPodLogs(c *gin.Context) {
	var req PodLogRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		slog.Error("parsing", "err", err.Error())
		c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}

	podLogsKey := fmt.Sprintf("pod_log_line_%s_%s", req.Name, req.Namespace)

	r.podLogsWatchers[podLogsKey] <- true

	c.JSON(http.StatusOK, gin.H{"success": ""})
}

func (r *Route) ScaleResource(c *gin.Context) {
	var req ResourceOperation
	if err := c.ShouldBindJSON(&req); err != nil {
		slog.Error("parsing", "err", err.Error())
		c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}
	apiResourceList, err := r.GetCluster(req.Server).Typed.ServerResourcesForGroupVersion(schema.GroupVersion{
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
	resource, err := r.GetCluster(req.Server).Dynamic.Resource(gvr).
		Namespace(req.Request.Namespace).
		Get(context.Background(), req.Request.Name, metav1.GetOptions{})
	if err != nil {
		slog.Error("get", "err", err.Error(), "req", req)
		c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}
	unstr := &unstructured.Unstructured{Object: resource.Object}
	if err := unstructured.SetNestedField(unstr.Object, req.Replicas, "spec", "replicas"); err != nil {
		slog.Error("set replicas", "err", err.Error(), "req", req)
		c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}
	if _, err := r.GetCluster(req.Server).Dynamic.Resource(gvr).
		Namespace(req.Request.Namespace).
		Update(context.Background(), unstr, metav1.UpdateOptions{}); err != nil {
		slog.Error("update", "err", err.Error(), "req", req)
		c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": ""})
}

func (r *Route) TriggerCronjob(c *gin.Context) {
	var req TriggerCronjob
	if err := c.ShouldBindJSON(&req); err != nil {
		slog.Error("parsing", "err", err.Error())
		c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}
	apiResourceList, err := r.GetCluster(req.Server).Typed.ServerResourcesForGroupVersion(schema.GroupVersion{
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
	cronJob, err := r.GetCluster(req.Server).Typed.BatchV1().CronJobs(req.Namespace).Get(context.TODO(), req.ResourceName, metav1.GetOptions{})
	if err != nil {
		slog.Error("get cronjob", "err", err.Error())
		c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}

	jobSpec := cronJob.Spec.JobTemplate.Spec
	jobName := fmt.Sprintf("%s-manual-%d", req.ResourceName, metav1.Now().Unix())

	_, err = r.GetCluster(req.Server).Typed.BatchV1().Jobs(req.Namespace).Create(context.TODO(), &batchv1.Job{
		ObjectMeta: metav1.ObjectMeta{
			Name:      jobName,
			Namespace: req.Namespace,
		},
		Spec: jobSpec,
	}, metav1.CreateOptions{})
	if err != nil {
		slog.Error("create job", "err", err.Error(), "job", jobName)
		c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": jobName})
}

func (r *Route) Login(c *gin.Context) {
	var req creds
	if err := c.ShouldBindJSON(&req); err != nil {
		slog.Error("parsing", "err", err.Error())
		c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}
	u, ok := r.users.Users[req.Username]
	if !ok || bcrypt.CompareHashAndPassword([]byte(u.Password), []byte(req.Password)) != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "invalid credentials"})
		return
	}

	exp := time.Now().Add(1 * time.Hour)
	claims := &model.Claims{
		Username: u.Username,
		Role:     u.Role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(exp),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	t, err := token.SignedString([]byte(r.cfg.JWTKey))
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "invalid credentials"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"token": t})
}

func (r *Route) ListHelmCharts(c *gin.Context) {
	var req HelmChart
	if err := c.ShouldBindJSON(&req); err != nil {
		slog.Error("parsing", "err", err.Error())
		c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}
	client := action.NewList(r.GetCluster(req.Server).Helm)
	client.All = true
	client.SetStateMask()

	releases, err := client.Run()
	if err != nil {
		slog.Error("fetching", "err", err.Error())
		c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"charts": releases})
}
