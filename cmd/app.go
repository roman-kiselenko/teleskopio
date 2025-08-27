package cmd

import (
	"log/slog"
	"net/http"
	"os"
	"time"

	"teleskopio/pkg/config"
	"teleskopio/pkg/middleware"
	httpRouter "teleskopio/pkg/router"
	webSocket "teleskopio/pkg/socket"

	"github.com/gin-gonic/gin"

	"github.com/lmittmann/tint"
)

var logOutput = os.Stdout

type App struct {
	Config   *config.Config
	Clients  *config.Clients
	signchnl chan (os.Signal)
	exitSig  chan (os.Signal)
}

func New(version string, configPath *string, exitchnl, signchnl chan (os.Signal)) (*App, error) {
	app := &App{exitSig: exitchnl, signchnl: signchnl}
	cfg, clients, err := config.ParseConfig(*configPath)
	if err != nil {
		return app, err
	}
	app.Clients = &clients
	app.Config = &cfg
	initLogger(&cfg)
	return app, nil
}

func (a *App) Run() error {
	slog.Info("version", "version", a.Config.Version)
	if err := a.initServer(); err != nil {
		slog.Error("cant init server", "error", err)
	}
	go func() {
		code := <-a.signchnl
		slog.Info("os signal received", "signal", code)
		a.exitSig <- code
	}()
	return nil
}

func initLogger(cfg *config.Config) {
	level := new(slog.LevelVar)
	handler := &slog.HandlerOptions{
		Level: level,
	}
	var logger *slog.Logger
	logger = slog.New(slog.NewTextHandler(logOutput, handler))
	if cfg.LogJSON {
		logger = slog.New(slog.NewJSONHandler(logOutput, handler))
	}
	if cfg.LogColor {
		logger = slog.New(tint.NewHandler(logOutput, &tint.Options{
			Level:      level,
			TimeFormat: time.Kitchen,
		}))
	}

	if err := level.UnmarshalText([]byte(cfg.LogLevel)); err != nil {
		level.Set(slog.LevelDebug)
	}
	slog.SetDefault(logger)
	slog.Info("set loglevel", "level", level)
}

func (a *App) initServer() error {
	slog.Info("initialize web server", "addr", a.Config.ServerHttp)
	gin.SetMode(gin.ReleaseMode)
	router := gin.New()
	router.Use(middleware.Logger())
	router.Use(gin.Recovery())
	hub := webSocket.NewHub()
	go hub.Run()
	r, err := httpRouter.New(hub, router, a.Config, a.Clients)
	if err != nil {
		return err
	}
	router.GET("/api/ping", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"message": "pong",
		})
	})
	router.GET("/api/lookup_configs", r.LookupConfigs)
	router.POST("/api/get_version", r.GetVersion)
	router.POST("/api/list_apiresources", r.ListResources)
	router.POST("/api/list_dynamic_resource", r.ListDynamicResource)
	router.POST("/api/list_events_dynamic_resource", r.ListEventsDynamicResource)
	router.POST("/api/watch_events_dynamic_resource", r.WatchEventsDynamicResource)
	router.POST("/api/watch_dynamic_resource", r.WatchDynamicResource)
	router.POST("/api/get_dynamic_resource", r.GetDynamicResource)
	router.POST("/api/get_pod_logs", r.GetPodLogs)
	router.POST("/api/stop_pod_log_stream", r.StopStreamPodLogs)
	router.POST("/api/stream_pod_logs", r.StreamPodLogs)
	router.POST("/api/delete_dynamic_resource", r.DeleteDynamicResource)
	router.POST("/api/create_kube_resource", r.CreateKubeResource)
	router.POST("/api/cordon_node", r.NodeOperation)
	router.POST("/api/uncordon_node", r.NodeOperation)

	webSocket.SetupWebsocket(hub, router)
	go func() {
		addr := a.Config.ServerHttp
		if err := router.Run(addr); err != nil {
			slog.Error("cant run server", "error", err)
		}
	}()
	return nil
}
