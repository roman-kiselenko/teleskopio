package middleware

import (
	"log/slog"
	"time"

	"github.com/gin-gonic/gin"
)

func Logger() gin.HandlerFunc {
	return func(c *gin.Context) {
		t := time.Now()
		c.Next()
		if c.Request.RequestURI != "/api/ping" {
			latency := time.Since(t)
			status := c.Writer.Status()
			slog.Debug("incoming request", "route", c.Request.RequestURI, "status", status, "latency", latency)
		}
	}
}
