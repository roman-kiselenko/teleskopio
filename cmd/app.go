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

var (
	logOutput = os.Stdout
	cfg       config.Config
)

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
	initLogger()
	return app, nil
}

func (a *App) Run() error {
	slog.Default().Info("version", "version", a.Config.Version)
	if err := a.initServer(); err != nil {
		slog.Default().Error("cant init server", "error", err)
	}
	go func() {
		code := <-a.signchnl
		slog.Default().Info("os signal received", "signal", code)
		a.exitSig <- code
	}()
	return nil
}

func initLogger() {
	level := new(slog.LevelVar)
	handler := &slog.HandlerOptions{
		Level: level,
	}
	var logger *slog.Logger
	logger = slog.New(slog.NewTextHandler(logOutput, handler))
	if cfg.LogJSON {
		logger = slog.New(slog.NewJSONHandler(logOutput, handler))
	} else {
		if cfg.LogColor {
			logger = slog.New(tint.NewHandler(logOutput, &tint.Options{
				Level:      level,
				TimeFormat: time.Kitchen,
			}))
		}
	}

	slog.SetDefault(logger)
	if err := level.UnmarshalText([]byte(cfg.LogLevel)); err != nil {
		level.Set(slog.LevelDebug)
	}
	slog.Default().Info("set loglevel", "level", level)
}

func (a *App) initServer() error {
	slog.Default().Info("initialize web server", "addr", a.Config.ServerHttp)
	gin.SetMode(gin.ReleaseMode)
	router := gin.New()
	router.Use(middleware.Logger())
	router.Use(gin.Recovery())
	r, err := httpRouter.New(router, a.Config, a.Clients)
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
	router.POST("/api/watch_dynamic_resource", r.WatchDynamicResource)
	router.POST("/api/get_dynamic_resource", r.GetDynamicResource)

	webSocket.SetupWebsocket(router)
	go func() {
		addr := a.Config.ServerHttp
		if err := router.Run(addr); err != nil {
			slog.Default().Error("cant run server", "error", err)
		}
	}()
	return nil
}
