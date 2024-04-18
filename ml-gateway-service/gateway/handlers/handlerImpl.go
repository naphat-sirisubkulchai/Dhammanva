package handlers

import (
	"ml-gateway-service/gateway/usecases"
	"ml-gateway-service/messages"

	"github.com/gin-gonic/gin"
)

type gatewayHandler struct {
	usecase usecases.Usecase
}

func NewGatewayHandler(usecase *usecases.Usecase) Handler {
	return &gatewayHandler{
		usecase: *usecase,
	}
}

func (h *gatewayHandler) Text2Vec(c *gin.Context) {
	handlerOpts := NewHandlerOpts(c)
	text := c.Query("text")

	res, err := h.usecase.Text2Vec(text)
	if err != nil {
		h.errorResponse(c, handlerOpts, 500, messages.INTERNAL_SERVER_ERROR)
		return
	}

	h.successResponse(c, handlerOpts, 200, ResponseOptions{
		Response: res,
	})
}
