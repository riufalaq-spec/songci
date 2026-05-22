package common

import (
	"context"
	"fmt"
	"log"

	"github.com/redis/go-redis/v9"
	"poetry-service/config"
)

var RDB *redis.Client

func InitRedis(cfg *config.RedisConfig) {
	RDB = redis.NewClient(&redis.Options{
		Addr:     fmt.Sprintf("%s:%s", cfg.Host, cfg.Port),
		Password: cfg.Password,
		DB:       0,
	})

	if err := RDB.Ping(context.Background()).Err(); err != nil {
		log.Fatalf("Failed to connect to Redis: %v", err)
	}

	log.Println("Redis connected successfully")
}
