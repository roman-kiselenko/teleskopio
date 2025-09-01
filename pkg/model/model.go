package model

import "github.com/golang-jwt/jwt/v5"

type Claims struct {
	Username string   `json:"username"`
	Roles    []string `json:"roles"`
	jwt.RegisteredClaims
}
