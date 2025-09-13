package middleware

import (
	"log/slog"
	"net/http"
	"time"

	"teleskopio/pkg/config"
	"teleskopio/pkg/model"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

const viewerRole = "viewer"

type Middleware struct {
	cfg *config.Config
}

func New(cfg *config.Config) Middleware {
	return Middleware{cfg}
}

func (m Middleware) Logger() gin.HandlerFunc {
	return func(c *gin.Context) {
		t := time.Now()
		c.Next()
		if c.Request.RequestURI == "/api/ping" || c.Request.RequestURI == "/api/lookup_configs" {
			return
		}
		latency := time.Since(t)
		status := c.Writer.Status()
		slog.Default().Debug("incoming request", "route", c.Request.RequestURI, "status", status, "latency", latency)
	}
}

func (m Middleware) CheckRole() gin.HandlerFunc {
	return func(c *gin.Context) {
		if m.cfg.AuthDisabled {
			c.Next()
			return
		}
		userRole := c.GetString("role")
		if userRole == viewerRole || userRole == "" {
			c.Abort()
			c.JSON(http.StatusUnauthorized, gin.H{"message": "read only access"})
			return
		}
		c.Next()
	}
}

func (m Middleware) Auth() gin.HandlerFunc {
	return func(c *gin.Context) {
		if m.cfg.AuthDisabled {
			c.Next()
			return
		}
		tokenStr := c.GetHeader("Authorization")
		if tokenStr == "" {
			c.Abort()
			c.JSON(http.StatusUnauthorized, gin.H{"message": "invalid credentials"})
			return
		}
		claim := &model.Claims{}
		token, err := jwt.ParseWithClaims(tokenStr, claim, func(_ *jwt.Token) (interface{}, error) {
			return []byte(m.cfg.JWTKey), nil
		})
		if err != nil || !token.Valid {
			c.Abort()
			c.JSON(http.StatusUnauthorized, gin.H{"message": "invalid credentials"})
			return
		}
		c.Set("role", claim.Role)
		c.Next()
	}
}
