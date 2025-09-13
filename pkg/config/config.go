package config

import (
	"bytes"
	_ "embed"
	"fmt"
	"html/template"
	"os"

	"gopkg.in/yaml.v3"
	"k8s.io/client-go/dynamic"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/tools/clientcmd"
)

type User struct {
	Username string `yaml:"username"`
	Password string `yaml:"password"`
	Role     string `yaml:"role"`
}

type Config struct {
	LogColor     bool   `yaml:"log_color,omitempty"`
	LogJSON      bool   `yaml:"log_json,omitempty"`
	LogLevel     string `yaml:"log_level,omitempty"`
	ServerHTTP   string `yaml:"server_http,omitempty"`
	AuthDisabled bool   `yaml:"auth_disabled"`
	JWTKey       string `yaml:"jwt_key"`
	Users        []User `yaml:"users"`
	Kube         struct {
		Configs []map[string]any `yaml:"configs"`
	} `yaml:"kube"`
	Version string
}

type Cluster struct {
	Address string
	Typed   *kubernetes.Clientset
	Dynamic dynamic.Interface
}

type Users struct {
	Users map[string]User
}

func ParseConfig(configPath string) (Config, []*Cluster, Users, error) {
	var cfg Config
	clusters := []*Cluster{}

	users := Users{
		Users: make(map[string]User),
	}

	data, err := os.ReadFile(configPath)
	if err != nil {
		return cfg, clusters, users, err
	}

	if err := yaml.Unmarshal(data, &cfg); err != nil {
		return cfg, clusters, users, err
	}
	for _, raw := range cfg.Kube.Configs {
		b, err := yaml.Marshal(raw)
		if err != nil {
			return cfg, clusters, users, err
		}

		kubeCfg, err := clientcmd.Load(b)
		if err != nil {
			return cfg, clusters, users, err
		}

		restCfg, err := clientcmd.
			NewNonInteractiveClientConfig(*kubeCfg, kubeCfg.CurrentContext, &clientcmd.ConfigOverrides{}, nil).
			ClientConfig()
		if err != nil {
			return cfg, clusters, users, err
		}

		clientset, err := kubernetes.NewForConfig(restCfg)
		if err != nil {
			return cfg, clusters, users, err
		}
		dyn, err := dynamic.NewForConfig(restCfg)
		if err != nil {
			return cfg, clusters, users, err
		}
		clusters = append(clusters, &Cluster{Address: restCfg.Host, Typed: clientset, Dynamic: dyn})
	}

	kubeconfig := os.Getenv("KUBECONFIG")
	if kubeconfig != "" {
		kubeCfg, err := clientcmd.LoadFromFile(kubeconfig)
		if err != nil {
			return cfg, clusters, users, fmt.Errorf("cant read KUBECONFIG %s", err)
		}
		restCfg, err := clientcmd.
			NewNonInteractiveClientConfig(*kubeCfg, kubeCfg.CurrentContext, &clientcmd.ConfigOverrides{}, nil).
			ClientConfig()
		if err != nil {
			return cfg, clusters, users, fmt.Errorf("cant read KUBECONFIG %s", err)
		}

		clientset, err := kubernetes.NewForConfig(restCfg)
		if err != nil {
			return cfg, clusters, users, fmt.Errorf("cant read KUBECONFIG %s", err)
		}
		dyn, err := dynamic.NewForConfig(restCfg)
		if err != nil {
			return cfg, clusters, users, fmt.Errorf("cant read KUBECONFIG %s", err)
		}
		clusters = append(clusters, &Cluster{Address: restCfg.Host, Typed: clientset, Dynamic: dyn})
	}

	for _, u := range cfg.Users {
		users.Users[u.Username] = u
	}
	return cfg, clusters, users, nil
}

func (c *Config) Validate() error {
	// TODO
	return nil
}

//go:embed config.TEMPLATE.yaml
var configTemplate string

func GenerateConfig() ([]byte, error) {
	return executeTemplate(configTemplate)
}

func executeTemplate(tmpl string) ([]byte, error) {
	x, err := template.New("").Parse(tmpl)
	if err != nil {
		return nil, err
	}
	var b bytes.Buffer
	if err := x.Execute(&b, map[string]string{}); err != nil {
		return nil, err
	}
	return b.Bytes(), nil
}
