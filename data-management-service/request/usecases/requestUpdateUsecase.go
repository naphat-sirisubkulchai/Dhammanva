package usecases

import (
	"data-management/errors"
	"data-management/messages"
	"data-management/request/helper"
	"data-management/request/models"
	"log"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
)

// UpdateRequest updates a request in the MongoDB collection.
//
// Return
// - Success : no error (nil)
// - 400 : Bad request (validation error)
// - 500 : internal server error
//
// The function takes a pointer to a models.Request object as input. The Request object is first validated
// and then converted to an entity using the helper.ModelsToEntity function. The UpdatedAt field of the entity
// is set to the current time.
//
// The function then calls the UpdateRequest method of the requestRepositories to update the document in the
// MongoDB collection. If the update operation fails, the function returns an error. If the update operation
// is successful, the function returns nil.
//
// The function also checks if the record index of the request is valid by calling the ValidateRecordIndex
// method of the requestRepositories. If the record index is not valid, the function returns an error.
//
// Example:
//
//	request := &models.Request{
//	    ID: "60d5ecf7c88f9a200f9e2c5a",
//	    Question: "Updated question",
//	    ... other fields ...
//	}
//	err := r.UpdateRequest(request)
//	if err != nil {
//	    log.Fatal(err)
//	}
func (r *requestUsecase) UpdateRequest(request *models.Request) *errors.RequestError {
	log.Println("Update request; Request: ", request)
	// validate the request
	if err := r.validator.Validate(request); err != nil {
		log.Println("Error validate request; Request: ", request, "Error: ", err)
		return errors.CreateError(400, messages.BAD_REQUEST)
	}

	// check valid record index
	result,err := r.requestRepositories.ValidateRecordIndex(request.Index); 
	if err != nil || result == false {
		log.Println("Error validate record index; Request: ", request, "Error: ", err)
		return errors.CreateError(400, messages.BAD_REQUEST)
	}

	// check valid by
	result,err = r.requestRepositories.ValidateUsername(request.By); 
	if err != nil || result == false {
		log.Println("Error validate username; Request: ", request, "Error: ", err)
		return errors.CreateError(400, messages.BAD_REQUEST)
	}

	// check valid approved by
	result,err = r.requestRepositories.ValidateUsername(request.ApprovedBy); 
	if err != nil || result == false {
		log.Println("Error validate approved by; Request: ", request, "Error: ", err)
		return errors.CreateError(400, messages.BAD_REQUEST)
	}

	requestEntitiy := helper.ModelsToEntity(request)
	requestEntitiy.UpdatedAt = time.Now()
	if err := r.requestRepositories.UpdateRequest(requestEntitiy); err != nil {
		log.Println("Error update request; Request: ", request, "Error: ", err)
		if err == mongo.ErrNoDocuments {
			return errors.CreateError(400, messages.BAD_REQUEST)
		}
		return errors.CreateError(500, messages.INTERNAL_SERVER_ERROR)
	}

	log.Println("Update request success")
	return nil
}
