package model

type Poem struct {
	ID            int    `json:"id"`
	Author        string `json:"author"`
	Rhythmic      string `json:"rhythmic"`
	Paragraphs    string `json:"paragraphs"`
	ParagraphsRaw string `json:"paragraphs_raw,omitempty"`
	Source        string `json:"source,omitempty"`
	LikeCount     int    `json:"like_count,omitempty"`
	IsLiked       bool   `json:"is_liked,omitempty"`
	IsFavorited   bool   `json:"is_favorited,omitempty"`
}
