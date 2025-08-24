package router

import (
	"context"
	"fmt"
	"net/http"
	"strings"

	"teleskopio/pkg/config"

	"github.com/gin-gonic/gin"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/runtime/schema"
	"k8s.io/client-go/dynamic"
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

type Route struct {
	cfg     *config.Config
	clients *config.Clients
}

func New(ginEngine *gin.Engine, cfg *config.Config, clients *config.Clients) (Route, error) {
	r := Route{
		cfg:     cfg,
		clients: clients,
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
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}
	ver, err := r.clients.Typed[req.Context].Discovery().ServerVersion()
	if err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, ver)
}

func (r *Route) ListResources(c *gin.Context) {
	var req Payload
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}
	discoveryClient := r.clients.Typed[req.Context].Discovery()

	apiGroupResources, err := discoveryClient.ServerPreferredResources()
	if err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	result := []ApiResourceInfo{}
	for _, list := range apiGroupResources {
		gv, err := schema.ParseGroupVersion(list.GroupVersion)
		if err != nil {
			c.JSON(400, gin.H{"error": err.Error()})
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
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}
	apiResourceList, err := r.clients.Typed[req.Context].ServerResourcesForGroupVersion(schema.GroupVersion{
		Group:   req.Request.Group,
		Version: req.Request.Version,
	}.String())
	if err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
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
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	for i := range list.Items {
		list.Items[i].SetAPIVersion(fmt.Sprintf("%s", req.Request.Version))
		if req.Request.Group != "" {
			list.Items[i].SetAPIVersion(fmt.Sprintf("%s/%s", req.Request.Group, req.Request.Version))
		}
		list.Items[i].SetKind(req.Request.Kind)
	}
	resourceVersion := list.Object["metadata"].(map[string]interface{})["resourceVersion"]

	c.JSON(http.StatusOK, []interface{}{list.Items, resourceVersion})
}

func (r *Route) WatchDynamicResource(c *gin.Context) {
	c.JSON(200, gin.H{"success": ""})
}

func (r *Route) GetDynamicResource(c *gin.Context) {
	var req GetRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}
	apiResourceList, err := r.clients.Typed[req.Context].ServerResourcesForGroupVersion(schema.GroupVersion{
		Group:   req.Request.Group,
		Version: req.Request.Version,
	}.String())
	if err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
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
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}
	c.YAML(http.StatusOK, res.Object)
}
