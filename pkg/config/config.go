package config

import (
	"bytes"
	_ "embed"
	"html/template"
	"os"

	"gopkg.in/yaml.v3"
	"k8s.io/client-go/dynamic"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/tools/clientcmd"
)

type User struct {
	Username string   `yaml:"username"`
	Password string   `yaml:"password"`
	Roles    []string `yaml:"roles"`
}

type Config struct {
	LogColor   bool   `yaml:"log_color,omitempty"`
	LogJSON    bool   `yaml:"log_json,omitempty"`
	LogLevel   string `yaml:"log_level,omitempty"`
	ServerHttp string `yaml:"server_http,omitempty"`
	JWTKey     string `yaml:"jwt_key"`
	Users      []User `yaml:"users"`
	Kube       struct {
		Configs []map[string]any `yaml:"configs"`
	} `yaml:"kube"`
	Version string
}

type Clients struct {
	Typed   map[string]*kubernetes.Clientset
	Dynamic map[string]dynamic.Interface
}

type Users struct {
	Users map[string]User
}

func ParseConfig(configPath string) (Config, Clients, Users, error) {
	var cfg Config

	clients := Clients{
		Typed:   make(map[string]*kubernetes.Clientset),
		Dynamic: make(map[string]dynamic.Interface),
	}
	users := Users{
		Users: make(map[string]User),
	}

	data, err := os.ReadFile(configPath)
	if err != nil {
		return cfg, clients, users, err
	}

	if err := yaml.Unmarshal(data, &cfg); err != nil {
		return cfg, clients, users, err
	}

	for _, raw := range cfg.Kube.Configs {
		b, err := yaml.Marshal(raw)
		if err != nil {
			return cfg, clients, users, err
		}

		kubeCfg, err := clientcmd.Load(b)
		if err != nil {
			return cfg, clients, users, err
		}

		restCfg, err := clientcmd.
			NewNonInteractiveClientConfig(*kubeCfg, kubeCfg.CurrentContext, &clientcmd.ConfigOverrides{}, nil).
			ClientConfig()
		if err != nil {
			return cfg, clients, users, err
		}

		clientset, err := kubernetes.NewForConfig(restCfg)
		if err != nil {
			return cfg, clients, users, err
		}
		dyn, err := dynamic.NewForConfig(restCfg)
		if err != nil {
			return cfg, clients, users, err
		}
		clients.Dynamic[kubeCfg.CurrentContext] = dyn
		clients.Typed[kubeCfg.CurrentContext] = clientset
	}

	for _, u := range cfg.Users {
		users.Users[u.Username] = u
	}
	return cfg, clients, users, nil
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
