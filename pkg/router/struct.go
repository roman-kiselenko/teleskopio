package router

import (
	"teleskopio/pkg/config"
	webSocket "teleskopio/pkg/socket"

	w "k8s.io/apimachinery/pkg/watch"
	"k8s.io/client-go/informers"
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

type APIResource struct {
	Group           string `json:"group"`
	Version         string `json:"version"`
	Kind            string `json:"kind"`
	Namespaced      bool   `json:"namespaced"`
	Resource        string `json:"resource"`
	ResourceVersion string `json:"resource_version"`
}

type ListRequest struct {
	UID       string `json:"uid"`
	Continue  string `json:"continue"`
	Limit     int64  `json:"limit"`
	Server    string `json:"server"`
	Name      string `json:"name"`
	Namespace string `json:"namespace"`

	APIResource APIResource `json:"apiResource"`
}

type WatchRequest struct {
	UID       string `json:"uid"`
	Server    string `json:"server"`
	Name      string `json:"name"`
	Namespace string `json:"namespace"`

	APIResource APIResource `json:"apiResource"`
}

type GetRequest struct {
	Server    string `json:"server"`
	Name      string `json:"name"`
	Namespace string `json:"namespace"`

	APIResource APIResource `json:"apiResource"`
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
	Name      string `json:"name"`
	Resources []struct {
		Name      string `json:"name"`
		Namespace string `json:"namespace"`
	} `json:"resources"`
	APIResource APIResource `json:"apiResource"`
}

type CreateRequest struct {
	Server    string `json:"server"`
	Namespace string `json:"namespace"`

	Yaml string `json:"yaml"`
}

type NodeOperation struct {
	Server    string `json:"server"`
	Name      string `json:"name"`
	Namespace string `json:"namespace"`

	Cordon      bool        `json:"cordon"`
	APIResource APIResource `json:"apiResource"`
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

type HelmRelease struct {
	Name      string `json:"name,omitempty"`
	Namespace string `json:"namespace,omitempty"`
	Server    string `json:"server,omitempty"`
}

type HelmChart struct {
	Namespaces []string `json:"namespaces,omitempty"`
	Server     string   `json:"server,omitempty"`
}

type TriggerCronjob struct {
	Server    string `json:"server"`
	Name      string `json:"name"`
	Namespace string `json:"namespace"`

	APIResource APIResource `json:"apiResource"`
}

type ResourceOperation struct {
	Server    string `json:"server"`
	Name      string `json:"name"`
	Namespace string `json:"namespace"`
	Replicas  int64  `json:"replicas"`

	APIResource APIResource `json:"apiResource"`
}

type Route struct {
	cfg      *config.Config
	clusters []*config.Cluster
	users    *config.Users
	hub      *webSocket.Hub
	// TODO
	// Add mutex
	watchers        map[string]w.Interface
	helmWathers     map[string]informers.SharedInformerFactory
	podLogsWatchers map[string]chan (bool)
}
