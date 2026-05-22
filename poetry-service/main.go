package main

import (
	"log"

	"github.com/gin-gonic/gin"
	"poetry-service/common"
	"poetry-service/config"
	"poetry-service/handler"
	"poetry-service/middleware"
)

func main() {
	cfg := config.Load()

	common.InitDB(&cfg.MySQL)
	common.InitRedis(&cfg.Redis)
	middleware.InitJWTSecret(&cfg.JWT)

	r := gin.Default()

	// CORS middleware
	r.Use(func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Content-Type, Authorization")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	})

	v1 := r.Group("/api/v1")

	// Auth routes
	auth := v1.Group("/auth")
	{
		auth.POST("/register", handler.Register)
		auth.POST("/login", handler.Login)
		auth.POST("/forgot-password", handler.ForgotPassword)
		auth.POST("/send-code", handler.SendVerificationCode)
	}

	// User routes (auth required)
	user := v1.Group("/user")
	user.Use(middleware.AuthRequired())
	{
		user.GET("/profile", handler.GetProfile)
	}

	// Poetry routes
	poetry := v1.Group("/poetry")
	{
		poetry.GET("/search", handler.SearchPoetry)
		poetry.GET("/three-hundred", handler.GetThreeHundred)
		poetry.GET("/daily-quote", handler.GetDailyQuote)
		poetry.GET("/:id", handler.GetPoemDetail)
	}

	// Poet routes
	poets := v1.Group("/poets")
	{
		poets.GET("", handler.GetPoetList)
		poets.GET("/:id", handler.GetPoetDetail)
	}

	// Interaction routes (auth required)
	interaction := v1.Group("/interaction")
	interaction.Use(middleware.AuthRequired())
	{
		interaction.POST("/like", handler.ToggleLike)
		interaction.DELETE("/like", handler.ToggleLike)
		interaction.POST("/favorite", handler.ToggleFavorite)
		interaction.DELETE("/favorite", handler.ToggleFavorite)
		interaction.GET("/favorites", handler.GetFavorites)
		interaction.GET("/likes", handler.GetLikes)
		interaction.POST("/history", handler.AddHistory)
		interaction.GET("/history", handler.GetHistory)
	}

	log.Println("Server starting on :8080")
	if err := r.Run(":8080"); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
