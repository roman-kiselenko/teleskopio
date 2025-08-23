package router

import (
	"net/http"

	"teleskopio/pkg/config"

	"github.com/gin-gonic/gin"
	"k8s.io/apimachinery/pkg/runtime/schema"
)

type Cluster struct {
	CurrentContext string `json:"current_context,omitempty"`
	Server         string `json:"server,omitempty"`
}

type Payload struct {
	Context string `json:"context"`
	Server  string `json:"server"`
}

type ApiResourceInfo struct {
	Group      string
	Version    string
	Kind       string
	Namespaced bool
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
			continue
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
