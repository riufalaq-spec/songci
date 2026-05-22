package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	SMTP   SMTPConfig
	MySQL  MySQLConfig
	Redis  RedisConfig
	JWT    JWTConfig
}

type SMTPConfig struct {
	Host     string
	Port     string
	Username string
	Password string
	FromEmail string
	FromName  string
}

type MySQLConfig struct {
	User     string
	Password string
	Host     string
	Port     string
	DB       string
}

type RedisConfig struct {
	Password string
	Host     string
	Port     string
}

type JWTConfig struct {
	Secret string
}

func Load() *Config {
	if err := godotenv.Load(); err != nil {
		log.Println("Warning: .env file not found, using system env")
	}

	return &Config{
		SMTP: SMTPConfig{
			Host:      getEnv("SMTP_HOST", "smtp.163.com"),
			Port:      getEnv("SMTP_PORT", "465"),
			Username:  getEnv("SMTP_USERNAME", ""),
			Password:  getEnv("SMTP_PASSWORD", ""),
			FromEmail: getEnv("SMTP_FROM_EMAIL", ""),
			FromName:  getEnv("SMTP_FROM_NAME", "Poetry App"),
		},
		MySQL: MySQLConfig{
			User:     getEnv("MYSQL_ROOT", "root"),
			Password: getEnv("MYSQL_PASSWORD", ""),
			Host:     getEnv("MYSQL_HOST", "127.0.0.1"),
			Port:     getEnv("MYSQL_PORT", "3306"),
			DB:       getEnv("MYSQL_DB", "poetry-app"),
		},
		Redis: RedisConfig{
			Password: getEnv("REDIS_PASSWORD", ""),
			Host:     getEnv("REDIS_HOST", "127.0.0.1"),
			Port:     getEnv("REDIS_PORT", "6379"),
		},
		JWT: JWTConfig{
			Secret: getEnv("JWT_SECRET", "default-secret"),
		},
	}
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
