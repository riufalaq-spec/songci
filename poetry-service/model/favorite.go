package model

import "time"

type Favorite struct {
	ID         int       `json:"id"`
	UserID     int       `json:"user_id"`
	PoemID     int       `json:"poem_id"`
	PoemSource string    `json:"poem_source"`
	CreatedAt  time.Time `json:"created_at"`
}
