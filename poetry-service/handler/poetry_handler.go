package handler

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"poetry-service/common"
	"poetry-service/service"
)

func SearchPoetry(c *gin.Context) {
	q := c.Query("q")
	if q == "" {
		common.Error(c, http.StatusBadRequest, "搜索关键词不能为空")
		return
	}

	userID, _ := c.Get("user_id")
	uid := 0
	if userID != nil {
		uid = userID.(int)
	}

	result, err := service.SearchPoetry(q, uid)
	if err != nil {
		common.Error(c, http.StatusInternalServerError, "搜索失败")
		return
	}

	common.Success(c, result)
}

func GetThreeHundred(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "20"))
	author := c.Query("author")

	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 20
	}

	poems, total, err := service.GetThreeHundredPoems(page, pageSize, author)
	if err != nil {
		common.Error(c, http.StatusInternalServerError, "获取数据失败")
		return
	}

	common.Success(c, gin.H{
		"poems": poems,
		"total": total,
		"page":  page,
		"page_size": pageSize,
	})
}

func GetPoetList(c *gin.Context) {
	search := c.Query("search")

	authors, err := service.GetPoetList(search)
	if err != nil {
		common.Error(c, http.StatusInternalServerError, "获取诗人列表失败")
		return
	}

	common.Success(c, authors)
}

func GetPoetDetail(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		common.Error(c, http.StatusBadRequest, "无效的ID")
		return
	}

	author, poems, err := service.GetPoetDetail(id)
	if err != nil {
		common.Error(c, http.StatusNotFound, "诗人不存在")
		return
	}

	common.Success(c, gin.H{
		"author": author,
		"poems":  poems,
	})
}

func GetDailyQuote(c *gin.Context) {
	quote, err := service.GetDailyQuote()
	if err != nil {
		common.Error(c, http.StatusInternalServerError, "获取每日诗词失败")
		return
	}
	common.Success(c, quote)
}

func GetPoemDetail(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		common.Error(c, http.StatusBadRequest, "无效的ID")
		return
	}

	source := c.DefaultQuery("source", "poems")
	userID, _ := c.Get("user_id")
	uid := 0
	if userID != nil {
		uid = userID.(int)
	}

	poem, err := service.GetPoemDetail(id, source, uid)
	if err != nil {
		common.Error(c, http.StatusNotFound, "词作不存在")
		return
	}

	common.Success(c, poem)
}
