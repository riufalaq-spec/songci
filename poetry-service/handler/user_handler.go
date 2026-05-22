package handler

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"poetry-service/common"
	"poetry-service/middleware"
	"poetry-service/service"
)

type RegisterReq struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
}

type LoginReq struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

type ForgotPasswordReq struct {
	Email string `json:"email" binding:"required,email"`
	Code  string `json:"code" binding:"required"`
	NewPassword string `json:"new_password" binding:"required,min=6"`
}

func Register(c *gin.Context) {
	var req RegisterReq
	if err := c.ShouldBindJSON(&req); err != nil {
		common.Error(c, http.StatusBadRequest, "参数错误: "+err.Error())
		return
	}

	existing, _ := service.GetUserByEmail(req.Email)
	if existing != nil {
		common.Error(c, http.StatusConflict, "该邮箱已注册")
		return
	}

	if err := service.CreateUser(req.Email, req.Password); err != nil {
		common.Error(c, http.StatusInternalServerError, "注册失败")
		return
	}

	common.Success(c, gin.H{"message": "注册成功"})
}

func Login(c *gin.Context) {
	var req LoginReq
	if err := c.ShouldBindJSON(&req); err != nil {
		common.Error(c, http.StatusBadRequest, "参数错误: "+err.Error())
		return
	}

	user, err := service.GetUserByEmail(req.Email)
	if err != nil || user == nil {
		common.Error(c, http.StatusUnauthorized, "邮箱或密码错误")
		return
	}

	if !service.CheckPassword(user.PasswordHash, req.Password) {
		common.Error(c, http.StatusUnauthorized, "邮箱或密码错误")
		return
	}

	token, err := middleware.GenerateToken(user.ID, user.Email)
	if err != nil {
		common.Error(c, http.StatusInternalServerError, "生成Token失败")
		return
	}

	common.Success(c, gin.H{
		"token": token,
		"user": gin.H{
			"id":        user.ID,
			"email":     user.Email,
			"nickname":  user.Nickname,
			"avatar_url": user.AvatarURL,
		},
	})
}

func ForgotPassword(c *gin.Context) {
	var req ForgotPasswordReq
	if err := c.ShouldBindJSON(&req); err != nil {
		common.Error(c, http.StatusBadRequest, "参数错误: "+err.Error())
		return
	}

	if !service.VerifyCode(req.Email, req.Code, "reset") {
		common.Error(c, http.StatusBadRequest, "验证码无效或已过期")
		return
	}

	if err := service.UpdatePassword(req.Email, req.NewPassword); err != nil {
		common.Error(c, http.StatusInternalServerError, "重置密码失败")
		return
	}

	service.MarkCodeUsed(req.Email, "reset")
	common.Success(c, gin.H{"message": "密码重置成功"})
}

func GetProfile(c *gin.Context) {
	userID := c.GetInt("user_id")
	user, err := service.GetUserByID(userID)
	if err != nil || user == nil {
		common.Error(c, http.StatusNotFound, "用户不存在")
		return
	}

	common.Success(c, gin.H{
		"id":         user.ID,
		"email":      user.Email,
		"nickname":   user.Nickname,
		"avatar_url": user.AvatarURL,
		"created_at": user.CreatedAt,
	})
}

func SendVerificationCode(c *gin.Context) {
	var req struct {
		Email   string `json:"email" binding:"required,email"`
		Purpose string `json:"purpose" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		common.Error(c, http.StatusBadRequest, "参数错误")
		return
	}

	if !strings.Contains("register reset", req.Purpose) {
		common.Error(c, http.StatusBadRequest, "purpose必须为register或reset")
		return
	}

	code := service.GenerateVerificationCode()
	if err := service.SaveVerificationCode(req.Email, code, req.Purpose); err != nil {
		common.Error(c, http.StatusInternalServerError, "保存验证码失败")
		return
	}

	// TODO: Send email via SMTP in production
	// For development, return the code directly
	common.Success(c, gin.H{
		"message": "验证码已发送",
		"code":    code, // dev only, remove in production
	})
}
