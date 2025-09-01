package model

import "github.com/golang-jwt/jwt/v5"

type Claims struct {
	Username string `json:"username"`
	Role     string `json:"role"`
	jwt.RegisteredClaims
}
