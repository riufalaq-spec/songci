package model

type Author struct {
	ID              int    `json:"id"`
	Name            string `json:"name"`
	Description     string `json:"description"`
	ShortDescription string `json:"short_description"`
	PoemCount       int    `json:"poem_count,omitempty"`
}
