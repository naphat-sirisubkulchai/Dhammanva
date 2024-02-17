package handlers

import (
	"data-management/messages"
	"log"

	"github.com/gin-gonic/gin"
)

// GetRequest is a handler function for the GET /request endpoint.
// It retrieves requests based on the provided query parameters: status, username, requestID, index, and approvedBy.
// If a query parameter is an empty string, it will not be included in the filter.
// The function responds with a JSON object that includes the matching requests.
// If an error occurs during the operation, the function responds with a JSON object that includes the error message and status code.
//
//	error status codes
//
// - 400 (Bad Request) and
// - 500 (Internal Server Error).
func (r *requestHandler) GetRequest(c *gin.Context) {
	status := c.Query("status")
	username := c.Query("username")
	requestID := c.Query("requestID")
	index := c.Query("index")
	approvedBy := c.Query("approvedBy")
	modelsRequest, err := r.requestUsecase.GetRequest(status, username, requestID, index, approvedBy)
	if err != nil {
		responseJSON(c, err.StatusCode, err.Error(), nil)
		return
	}

	responseJSON(c, 200, messages.SUCCESS_GET_REQUEST, modelsRequest)
}

// GetLastestRequestOfRecord is a handler function for the GET /request/latest endpoint.
// Query Parameters:
//   - index: The index of the record.
//
// It retrieves the latest request of a record based on the provided index query parameter.
// The function responds with a JSON object that includes the latest request.
// If an error occurs during the operation, the function responds with a JSON object that includes the error message and status code.
//
// Possible error status codes are
//
//	400 (Bad Request) and
//	500 (Internal Server Error).
func (r *requestHandler) GetLastestRequestOfRecord(c *gin.Context) {
	log.Println("GetLastestRequestOfRecord handler : starting handler .....")
	index := c.Query("index")
	if index == "" {
		log.Println("Error validate index", index)
		responseJSON(c, 400, messages.BAD_REQUEST, nil)
		return
	}
	modelsRequest, err := r.requestUsecase.GetLastestRequestOfRecord(index)
	if err != nil {
		responseJSON(c, err.StatusCode, err.Error(), nil)
		return
	}

	responseJSON(c, 200, messages.SUCCESS_GET_REQUEST, modelsRequest)
}
