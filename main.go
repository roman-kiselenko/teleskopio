package main

import (
	"flag"
	"fmt"
	"log"
	"os"
	"os/signal"
	"syscall"

	"teleskopio/cmd"
	"teleskopio/pkg/config"
)

var (
	version    = "dev"
	configPath = flag.String("config", "./config.yaml", "path to config")
)

func main() {
	flag.Parse()

	command := os.Args[1:]
	if len(command) > 0 && command[0] == "config" {
		cfg, err := config.GenerateConfig()
		if err != nil {
			log.Fatalf("failed to generate config: %s", err)
		}
		fmt.Print(string(cfg))
		os.Exit(0)
	}
	sigchnl := make(chan os.Signal, 1)
	signal.Notify(sigchnl, syscall.SIGHUP, syscall.SIGINT, syscall.SIGTERM)
	exitchnl := make(chan os.Signal)
	app, err := cmd.New(version, configPath, exitchnl, sigchnl)
	if err != nil {
		log.Fatalf("failed to init app: %s", err)
	}
	if err := app.Run(); err != nil {
		log.Fatalf("failed to start app: %s", err)
	}
	<-exitchnl
}

// package main

// import (
// 	"net/http"

// 	"github.com/gin-gonic/gin"
// )

// //  // Api Resources
// //         k8s::client::list_apiresources,
// //         k8s::client::list_crd_resources,
// //         k8s::client::list_dynamic_resource,
// //         k8s::client::search_dynamic_resource,
// //         k8s::client::get_dynamic_resource,
// //         k8s::client::delete_dynamic_resource,
// //         k8s::client::watch_dynamic_resource,
// //         k8s::client::lookup_configs,
// //         k8s::client::get_version,
// //         k8s::client::update_kube_object,
// //         k8s::client::create_kube_object,
// //         // Common
// //         k8s::client::events_dynamic_resource,
// //         k8s::client::list_events_dynamic_resource,
// //         k8s::client::watch_events_dynamic_resource,
// //         k8s::client::stop_watch_events,
// //         k8s::client::heartbeat,
// //         // Pod
// //         k8s::client::get_pod_logs,
// //         k8s::client::stream_pod_logs,
// //         k8s::client::stop_pod_log_stream,
// //         // Node
// //         k8s::client::drain_node,
// //         k8s::client::cordon_node,
// //         k8s::client::uncordon_node,
// //         // Settings
// //         get_logs,

// type Cluster struct {
// 	Name           string
// 	Path           string
// 	CurrentContext string
// 	Server         string
// }

// func main() {
// 	r := gin.Default()

// 	r.Use(func(c *gin.Context) {
// 		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
// 		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
// 		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
// 		if c.Request.Method == "OPTIONS" {
// 			c.AbortWithStatus(204)
// 			return
// 		}
// 		c.Next()
// 	})

// 	// lookup_configs
// 	r.GET("/api/lookup_configs", func(c *gin.Context) {
// 		c.JSON(http.StatusOK, []Cluster{{}, {}})
// 	})

// 	r.Run(":8080")
// }
