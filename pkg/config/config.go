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

type Config struct {
	LogColor   bool   `yaml:"log_color,omitempty"`
	LogJSON    bool   `yaml:"log_json,omitempty"`
	LogLevel   string `yaml:"log_level,omitempty"`
	ServerHttp string `yaml:"server_http,omitempty"`
	Kube       struct {
		Configs []map[string]any `yaml:"configs"`
	} `yaml:"kube"`
	Version string
}

type Clients struct {
	Typed   map[string]*kubernetes.Clientset
	Dynamic map[string]dynamic.Interface
}

func ParseConfig(configPath string) (Config, Clients, error) {
	var cfg Config

	clients := Clients{
		Typed:   make(map[string]*kubernetes.Clientset),
		Dynamic: make(map[string]dynamic.Interface),
	}

	data, err := os.ReadFile(configPath)
	if err != nil {
		return cfg, clients, err
	}

	if err := yaml.Unmarshal(data, &cfg); err != nil {
		return cfg, clients, err
	}

	for _, raw := range cfg.Kube.Configs {
		b, err := yaml.Marshal(raw)
		if err != nil {
			return cfg, clients, err
		}

		kubeCfg, err := clientcmd.Load(b)
		if err != nil {
			return cfg, clients, err
		}

		restCfg, err := clientcmd.
			NewNonInteractiveClientConfig(*kubeCfg, kubeCfg.CurrentContext, &clientcmd.ConfigOverrides{}, nil).
			ClientConfig()
		if err != nil {
			return cfg, clients, err
		}

		clientset, err := kubernetes.NewForConfig(restCfg)
		if err != nil {
			return cfg, clients, err
		}
		dyn, err := dynamic.NewForConfig(restCfg)
		if err != nil {
			return cfg, clients, err
		}
		clients.Dynamic[kubeCfg.CurrentContext] = dyn
		clients.Typed[kubeCfg.CurrentContext] = clientset
	}

	return cfg, clients, nil
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
