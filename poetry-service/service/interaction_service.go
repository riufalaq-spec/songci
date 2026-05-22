package service

import (
	"poetry-service/common"
	"poetry-service/model"
)

func ToggleLike(userID, poemID int, poemSource string) (bool, error) {
	var count int
	common.DB.QueryRow(
		"SELECT COUNT(*) FROM likes WHERE user_id = ? AND poem_id = ? AND poem_source = ?",
		userID, poemID, poemSource,
	).Scan(&count)

	if count > 0 {
		_, err := common.DB.Exec(
			"DELETE FROM likes WHERE user_id = ? AND poem_id = ? AND poem_source = ?",
			userID, poemID, poemSource,
		)
		return false, err
	}

	_, err := common.DB.Exec(
		"INSERT INTO likes (user_id, poem_id, poem_source) VALUES (?, ?, ?)",
		userID, poemID, poemSource,
	)
	return true, err
}

func ToggleFavorite(userID, poemID int, poemSource string) (bool, error) {
	var count int
	common.DB.QueryRow(
		"SELECT COUNT(*) FROM favorites WHERE user_id = ? AND poem_id = ? AND poem_source = ?",
		userID, poemID, poemSource,
	).Scan(&count)

	if count > 0 {
		_, err := common.DB.Exec(
			"DELETE FROM favorites WHERE user_id = ? AND poem_id = ? AND poem_source = ?",
			userID, poemID, poemSource,
		)
		return false, err
	}

	_, err := common.DB.Exec(
		"INSERT INTO favorites (user_id, poem_id, poem_source) VALUES (?, ?, ?)",
		userID, poemID, poemSource,
	)
	return true, err
}

func GetFavorites(userID int) ([]model.Poem, error) {
	rows, err := common.DB.Query(`
		SELECT f.poem_id, f.poem_source,
			CASE f.poem_source
				WHEN 'three_hundred_poems' THEN (SELECT author FROM three_hundred_poems WHERE id = f.poem_id)
				ELSE (SELECT author FROM poems WHERE id = f.poem_id)
			END as author,
			CASE f.poem_source
				WHEN 'three_hundred_poems' THEN (SELECT rhythmic FROM three_hundred_poems WHERE id = f.poem_id)
				ELSE (SELECT rhythmic FROM poems WHERE id = f.poem_id)
			END as rhythmic,
			CASE f.poem_source
				WHEN 'three_hundred_poems' THEN (SELECT paragraphs FROM three_hundred_poems WHERE id = f.poem_id)
				ELSE (SELECT paragraphs FROM poems WHERE id = f.poem_id)
			END as paragraphs
		FROM favorites f WHERE f.user_id = ? ORDER BY f.created_at DESC`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var poems []model.Poem
	for rows.Next() {
		var p model.Poem
		rows.Scan(&p.ID, &p.Source, &p.Author, &p.Rhythmic, &p.Paragraphs)
		poems = append(poems, p)
	}
	return poems, nil
}

func GetLikes(userID int) ([]model.Poem, error) {
	rows, err := common.DB.Query(`
		SELECT l.poem_id, l.poem_source,
			CASE l.poem_source
				WHEN 'three_hundred_poems' THEN (SELECT author FROM three_hundred_poems WHERE id = l.poem_id)
				ELSE (SELECT author FROM poems WHERE id = l.poem_id)
			END as author,
			CASE l.poem_source
				WHEN 'three_hundred_poems' THEN (SELECT rhythmic FROM three_hundred_poems WHERE id = l.poem_id)
				ELSE (SELECT rhythmic FROM poems WHERE id = l.poem_id)
			END as rhythmic,
			CASE l.poem_source
				WHEN 'three_hundred_poems' THEN (SELECT paragraphs FROM three_hundred_poems WHERE id = l.poem_id)
				ELSE (SELECT paragraphs FROM poems WHERE id = l.poem_id)
			END as paragraphs
		FROM likes l WHERE l.user_id = ? ORDER BY l.created_at DESC`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var poems []model.Poem
	for rows.Next() {
		var p model.Poem
		rows.Scan(&p.ID, &p.Source, &p.Author, &p.Rhythmic, &p.Paragraphs)
		poems = append(poems, p)
	}
	return poems, nil
}

func AddBrowseHistory(userID, poemID int, poemSource string) error {
	_, err := common.DB.Exec(
		"INSERT INTO browse_history (user_id, poem_id, poem_source) VALUES (?, ?, ?)",
		userID, poemID, poemSource,
	)
	return err
}

func GetBrowseHistory(userID int) ([]model.Poem, error) {
	rows, err := common.DB.Query(`
		SELECT h.poem_id, h.poem_source,
			CASE h.poem_source
				WHEN 'three_hundred_poems' THEN (SELECT author FROM three_hundred_poems WHERE id = h.poem_id)
				ELSE (SELECT author FROM poems WHERE id = h.poem_id)
			END as author,
			CASE h.poem_source
				WHEN 'three_hundred_poems' THEN (SELECT rhythmic FROM three_hundred_poems WHERE id = h.poem_id)
				ELSE (SELECT rhythmic FROM poems WHERE id = h.poem_id)
			END as rhythmic,
			CASE h.poem_source
				WHEN 'three_hundred_poems' THEN (SELECT paragraphs FROM three_hundred_poems WHERE id = h.poem_id)
				ELSE (SELECT paragraphs FROM poems WHERE id = h.poem_id)
			END as paragraphs
		FROM browse_history h WHERE h.user_id = ? ORDER BY h.viewed_at DESC LIMIT 100`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var poems []model.Poem
	for rows.Next() {
		var p model.Poem
		rows.Scan(&p.ID, &p.Source, &p.Author, &p.Rhythmic, &p.Paragraphs)
		poems = append(poems, p)
	}
	return poems, nil
}
