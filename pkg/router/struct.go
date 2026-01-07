package router

import (
	"teleskopio/pkg/config"
	webSocket "teleskopio/pkg/socket"

	w "k8s.io/apimachinery/pkg/watch"
)

type Cluster struct {
	Server string `json:"server"`
}

type Payload struct {
	Server string `json:"server"`
}

type creds struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

// TODO move types and refactor
type APIResourceInfo struct {
	Group      string `json:"group"`
	Version    string `json:"version"`
	Kind       string `json:"kind"`
	Namespaced bool   `json:"namespaced"`
}

type ListRequest struct {
	UID      string `json:"uid"`
	Continue string `json:"continue"`
	Limit    int64  `json:"limit"`
	Server   string `json:"server"`
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
	UID      string `json:"uid"`
	Server   string `json:"server"`
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

type PodLogRequest struct {
	Server    string `json:"server"`
	Name      string `json:"name"`
	Namespace string `json:"namespace"`
	Container string `json:"container"`
	TailLines *int64 `json:"tail_lines"`
}

type DeleteRequest struct {
	Server    string `json:"server"`
	Resource  string `json:"resource"`
	Resources []struct {
		Name      string `json:"name"`
		Namespace string `json:"namespace"`
	} `json:"resources"`
	Request struct {
		Name            string `json:"name"`
		Group           string `json:"group"`
		Version         string `json:"version"`
		Kind            string `json:"kind"`
		Namespaced      bool   `json:"namespaced"`
		ResourceVersion string `json:"resource_version"`
	} `json:"request"`
}

type CreateRequest struct {
	Server    string `json:"server"`
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
	Resource     string `json:"resource"`
	Cordon       bool   `json:"cordon"`
}

type NodeDrain struct {
	ResourceName        string `json:"resourceName"`
	ResourceUID         string `json:"resourceUid"`
	Server              string `json:"server"`
	DrainForce          bool   `json:"drainForce"`
	IgnoreAllDaemonSets bool   `json:"IgnoreAllDaemonSets"`
	DeleteEmptyDirData  bool   `json:"DeleteEmptyDirData"`
	DrainTimeout        int64  `json:"drainTimeout"`
}

type HelmChart struct {
	Name      string `json:"name,omitempty"`
	Namespace string `json:"namespace,omitempty"`
	Server    string `json:"server,omitempty"`
}

type TriggerCronjob struct {
	Group        string `json:"group"`
	Version      string `json:"version"`
	Kind         string `json:"kind"`
	Namespaced   bool   `json:"namespaced"`
	Namespace    string `json:"namespace"`
	ResourceName string `json:"resourceName"`
	Server       string `json:"server"`
	Resource     string
}

type ResourceOperation struct {
	Request struct {
		Name            string `json:"name"`
		Namespace       string `json:"namespace"`
		Group           string `json:"group"`
		Version         string `json:"version"`
		Kind            string `json:"kind"`
		Namespaced      bool   `json:"namespaced"`
		ResourceVersion string `json:"resource_version"`
	} `json:"request"`
	Server   string `json:"server"`
	Resource string `json:"resource"`
	Replicas int64  `json:"replicas"`
}

type Route struct {
	cfg      *config.Config
	clusters []*config.Cluster
	users    *config.Users
	hub      *webSocket.Hub
	// TODO
	// Add mutex
	watchers        map[string]w.Interface
	podLogsWatchers map[string]chan (bool)
}
