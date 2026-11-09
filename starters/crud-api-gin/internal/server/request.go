package server

import (
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
)

// parseItem reads {"name", "description"} from the body, or returns an error message.
func parseItem(c *gin.Context) (string, *string, string) {
	var body struct {
		Name        any `json:"name"`
		Description any `json:"description"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		return "", nil, "Send a JSON object"
	}
	name, _ := body.Name.(string)
	name = strings.TrimSpace(name)
	if n := len([]rune(name)); n < 1 || n > 200 {
		return "", nil, "name is required and must be 1 to 200 characters"
	}
	if body.Description == nil {
		return name, nil, ""
	}
	description, ok := body.Description.(string)
	if !ok {
		return "", nil, "description must be a string"
	}
	return name, &description, ""
}

// intQuery reads a whole number in [min, max], the fallback when absent, or ok=false.
func intQuery(c *gin.Context, key string, fallback, min, max int64) (int64, bool) {
	raw, present := c.GetQuery(key)
	if !present {
		return fallback, true
	}
	n, err := strconv.ParseInt(raw, 10, 64)
	return n, err == nil && n >= min && n <= max
}

// itemID is false for ids that cannot exist (the id column is a 32-bit SERIAL).
func itemID(c *gin.Context) (int64, bool) {
	n, err := strconv.ParseInt(c.Param("id"), 10, 32)
	return n, err == nil && n >= 1
}
