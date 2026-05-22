package service

import (
	"context"
	"encoding/json"
	"fmt"
	"strings"
	"time"

	"poetry-service/common"
	"poetry-service/model"
)

type SearchResult struct {
	Poets    []model.Author `json:"poets"`
	Poems    []model.Poem   `json:"poems"`
	Rhythmic []string       `json:"rhythmic"`
}

func SearchPoetry(query string, userID int) (*SearchResult, error) {
	result := &SearchResult{
		Poets:    []model.Author{},
		Poems:    []model.Poem{},
		Rhythmic: []string{},
	}

	like := "%" + query + "%"

	// Search poets
	rows, err := common.DB.Query(
		"SELECT id, name, short_description FROM authors WHERE name LIKE ? LIMIT 5", like)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	for rows.Next() {
		var a model.Author
		rows.Scan(&a.ID, &a.Name, &a.ShortDescription)
		result.Poets = append(result.Poets, a)
	}

	// Search rhythmic names
	rRows, err := common.DB.Query(
		"SELECT DISTINCT rhythmic FROM poems WHERE rhythmic LIKE ? LIMIT 5", like)
	if err != nil {
		return nil, err
	}
	defer rRows.Close()
	for rRows.Next() {
		var r string
		rRows.Scan(&r)
		result.Rhythmic = append(result.Rhythmic, r)
	}

	// Search poem content
	pRows, err := common.DB.Query(
		"SELECT id, author, rhythmic, paragraphs, 'poems' as source FROM poems WHERE paragraphs LIKE ? OR author LIKE ? LIMIT 10",
		like, like)
	if err != nil {
		return nil, err
	}
	defer pRows.Close()
	for pRows.Next() {
		var p model.Poem
		pRows.Scan(&p.ID, &p.Author, &p.Rhythmic, &p.Paragraphs, &p.Source)
		result.Poems = append(result.Poems, p)
	}

	return result, nil
}

func GetThreeHundredPoems(page, pageSize int, author string) ([]model.Poem, int, error) {
	where := "1=1"
	args := []interface{}{}
	if author != "" {
		where += " AND author = ?"
		args = append(args, author)
	}

	var total int
	countSQL := fmt.Sprintf("SELECT COUNT(*) FROM three_hundred_poems WHERE %s", where)
	common.DB.QueryRow(countSQL, args...).Scan(&total)

	offset := (page - 1) * pageSize
	args = append(args, pageSize, offset)
	querySQL := fmt.Sprintf(
		"SELECT id, author, rhythmic, paragraphs, 'three_hundred_poems' as source FROM three_hundred_poems WHERE %s ORDER BY id LIMIT ? OFFSET ?", where)
	rows, err := common.DB.Query(querySQL, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var poems []model.Poem
	for rows.Next() {
		var p model.Poem
		rows.Scan(&p.ID, &p.Author, &p.Rhythmic, &p.Paragraphs, &p.Source)
		poems = append(poems, p)
	}
	return poems, total, nil
}

func GetPoetList(search string) ([]model.Author, error) {
	query := "SELECT id, name, description, short_description FROM authors"
	args := []interface{}{}
	if search != "" {
		query += " WHERE name LIKE ?"
		args = append(args, "%"+search+"%")
	}
	query += " ORDER BY id LIMIT 100"

	rows, err := common.DB.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var authors []model.Author
	for rows.Next() {
		var a model.Author
		rows.Scan(&a.ID, &a.Name, &a.Description, &a.ShortDescription)
		authors = append(authors, a)
	}
	return authors, nil
}

func GetPoetDetail(id int) (*model.Author, []model.Poem, error) {
	a := &model.Author{}
	err := common.DB.QueryRow(
		"SELECT id, name, description, short_description FROM authors WHERE id = ?", id,
	).Scan(&a.ID, &a.Name, &a.Description, &a.ShortDescription)
	if err != nil {
		return nil, nil, err
	}

	rows, err := common.DB.Query(
		"SELECT id, author, rhythmic, paragraphs, 'poems' as source FROM poems WHERE author = ? ORDER BY id", a.Name)
	if err != nil {
		return nil, nil, err
	}
	defer rows.Close()

	var poems []model.Poem
	for rows.Next() {
		var p model.Poem
		rows.Scan(&p.ID, &p.Author, &p.Rhythmic, &p.Paragraphs, &p.Source)
		poems = append(poems, p)
	}
	return a, poems, nil
}

func GetPoemDetail(id int, source string, userID int) (*model.Poem, error) {
	table := "poems"
	if source == "three_hundred_poems" {
		table = "three_hundred_poems"
	}

	p := &model.Poem{}
	query := fmt.Sprintf("SELECT id, author, rhythmic, paragraphs, '%s' as source FROM %s WHERE id = ?", table, table)
	err := common.DB.QueryRow(query, id).Scan(&p.ID, &p.Author, &p.Rhythmic, &p.Paragraphs, &p.Source)
	if err != nil {
		return nil, err
	}

	// Get like count
	common.DB.QueryRow(
		"SELECT COUNT(*) FROM likes WHERE poem_id = ? AND poem_source = ?", id, table,
	).Scan(&p.LikeCount)

	if userID > 0 {
		var cnt int
		common.DB.QueryRow(
			"SELECT COUNT(*) FROM likes WHERE user_id = ? AND poem_id = ? AND poem_source = ?",
			userID, id, table,
		).Scan(&cnt)
		p.IsLiked = cnt > 0

		common.DB.QueryRow(
			"SELECT COUNT(*) FROM favorites WHERE user_id = ? AND poem_id = ? AND poem_source = ?",
			userID, id, table,
		).Scan(&cnt)
		p.IsFavorited = cnt > 0
	}

	return p, nil
}

type DailyQuote struct {
	Quote  string `json:"quote"`
	Author string `json:"author"`
	Rhythmic string `json:"rhythmic"`
}

func GetDailyQuote() (*DailyQuote, error) {
	ctx := context.Background()
	today := time.Now().Format("2006-01-02")
	key := "daily_quote:" + today

	// Try Redis first
	cached, err := common.RDB.Get(ctx, key).Result()
	if err == nil && cached != "" {
		var q DailyQuote
		if json.Unmarshal([]byte(cached), &q) == nil {
			return &q, nil
		}
	}

	// Pick a random poem from the database
	var id int
	var author, rhythmic, paragraphs string
	err = common.DB.QueryRow(
		"SELECT id, author, rhythmic, paragraphs FROM poems ORDER BY RAND() LIMIT 1",
	).Scan(&id, &author, &rhythmic, &paragraphs)
	if err != nil {
		// Fallback to default
		return &DailyQuote{
			Quote:  "明月几时有？把酒问青天。",
			Author: "苏轼",
			Rhythmic: "水调歌头",
		}, nil
	}

	// Parse paragraphs and pick the first meaningful line
	lines := strings.Split(paragraphs, "\n")
	quote := ""
	for _, line := range lines {
		line = strings.TrimSpace(line)
		if len([]rune(line)) >= 4 {
			quote = line
			break
		}
	}
	if quote == "" && len(lines) > 0 {
		quote = lines[0]
	}

	q := &DailyQuote{
		Quote:    quote,
		Author:   author,
		Rhythmic: rhythmic,
	}

	// Cache in Redis for 2 days
	data, _ := json.Marshal(q)
	common.RDB.Set(ctx, key, string(data), 48*time.Hour)

	return q, nil
}
