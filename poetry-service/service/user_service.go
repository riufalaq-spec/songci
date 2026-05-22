package service

import (
	"crypto/rand"
	"database/sql"
	"fmt"
	"math/big"
	"time"

	"golang.org/x/crypto/bcrypt"
	"poetry-service/common"
	"poetry-service/model"
)

func CreateUser(email, password string) error {
	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}
	_, err = common.DB.Exec("INSERT INTO users (email, password_hash) VALUES (?, ?)", email, string(hash))
	return err
}

func GetUserByEmail(email string) (*model.User, error) {
	u := &model.User{}
	err := common.DB.QueryRow(
		"SELECT id, email, password_hash, nickname, avatar_url, created_at, updated_at FROM users WHERE email = ?",
		email,
	).Scan(&u.ID, &u.Email, &u.PasswordHash, &u.Nickname, &u.AvatarURL, &u.CreatedAt, &u.UpdatedAt)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	return u, err
}

func GetUserByID(id int) (*model.User, error) {
	u := &model.User{}
	err := common.DB.QueryRow(
		"SELECT id, email, password_hash, nickname, avatar_url, created_at, updated_at FROM users WHERE id = ?",
		id,
	).Scan(&u.ID, &u.Email, &u.PasswordHash, &u.Nickname, &u.AvatarURL, &u.CreatedAt, &u.UpdatedAt)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	return u, err
}

func CheckPassword(hashed, password string) bool {
	return bcrypt.CompareHashAndPassword([]byte(hashed), []byte(password)) == nil
}

func GenerateVerificationCode() string {
	n, _ := rand.Int(rand.Reader, big.NewInt(900000))
	return fmt.Sprintf("%06d", n.Int64()+100000)
}

func SaveVerificationCode(email, code, purpose string) error {
	expires := time.Now().Add(15 * time.Minute)
	_, err := common.DB.Exec(
		"INSERT INTO verification_codes (email, code, purpose, expires_at) VALUES (?, ?, ?, ?)",
		email, code, purpose, expires,
	)
	return err
}

func VerifyCode(email, code, purpose string) bool {
	var count int
	err := common.DB.QueryRow(
		"SELECT COUNT(*) FROM verification_codes WHERE email = ? AND code = ? AND purpose = ? AND used = 0 AND expires_at > NOW()",
		email, code, purpose,
	).Scan(&count)
	return err == nil && count > 0
}

func MarkCodeUsed(email, purpose string) {
	common.DB.Exec(
		"UPDATE verification_codes SET used = 1 WHERE email = ? AND purpose = ? AND used = 0",
		email, purpose,
	)
}

func UpdatePassword(email, password string) error {
	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}
	_, err = common.DB.Exec("UPDATE users SET password_hash = ? WHERE email = ?", string(hash), email)
	return err
}
