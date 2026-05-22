package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"poetry-service/common"
	"poetry-service/service"
)

type ToggleReq struct {
	PoemID     int    `json:"poem_id" binding:"required"`
	PoemSource string `json:"poem_source" binding:"required"`
}

func ToggleLike(c *gin.Context) {
	var req ToggleReq
	if err := c.ShouldBindJSON(&req); err != nil {
		common.Error(c, http.StatusBadRequest, "参数错误")
		return
	}

	userID := c.GetInt("user_id")
	liked, err := service.ToggleLike(userID, req.PoemID, req.PoemSource)
	if err != nil {
		common.Error(c, http.StatusInternalServerError, "操作失败")
		return
	}

	common.Success(c, gin.H{"liked": liked})
}

func ToggleFavorite(c *gin.Context) {
	var req ToggleReq
	if err := c.ShouldBindJSON(&req); err != nil {
		common.Error(c, http.StatusBadRequest, "参数错误")
		return
	}

	userID := c.GetInt("user_id")
	favorited, err := service.ToggleFavorite(userID, req.PoemID, req.PoemSource)
	if err != nil {
		common.Error(c, http.StatusInternalServerError, "操作失败")
		return
	}

	common.Success(c, gin.H{"favorited": favorited})
}

func GetFavorites(c *gin.Context) {
	userID := c.GetInt("user_id")
	poems, err := service.GetFavorites(userID)
	if err != nil {
		common.Error(c, http.StatusInternalServerError, "获取收藏列表失败")
		return
	}
	common.Success(c, poems)
}

func GetLikes(c *gin.Context) {
	userID := c.GetInt("user_id")
	poems, err := service.GetLikes(userID)
	if err != nil {
		common.Error(c, http.StatusInternalServerError, "获取点赞列表失败")
		return
	}
	common.Success(c, poems)
}

func AddHistory(c *gin.Context) {
	var req ToggleReq
	if err := c.ShouldBindJSON(&req); err != nil {
		common.Error(c, http.StatusBadRequest, "参数错误")
		return
	}

	userID := c.GetInt("user_id")
	if err := service.AddBrowseHistory(userID, req.PoemID, req.PoemSource); err != nil {
		common.Error(c, http.StatusInternalServerError, "记录浏览历史失败")
		return
	}

	common.Success(c, nil)
}

func GetHistory(c *gin.Context) {
	userID := c.GetInt("user_id")
	poems, err := service.GetBrowseHistory(userID)
	if err != nil {
		common.Error(c, http.StatusInternalServerError, "获取浏览历史失败")
		return
	}
	common.Success(c, poems)
}
