package entities

import (
	"time"
)

type (
	Request struct {
		ID string `bson:"_id,omitempty" json:"id,omitempty"`
		RequestID  string    `bson:"request_id"`
		Index      string    `bson:"index"`
		YoutubeURL string    `bson:"youtubeURL"`
		Question   string    `bson:"question"`
		Answer     string    `bson:"answer"`
		StartTime  string    `bson:"startTime"`
		EndTime    string    `bson:"endTime"`
		CreatedAt  time.Time `bson:"created_at"`
		UpdatedAt  time.Time `bson:"updated_at"`
		Status     string    `bson:"status"` // "pending", "approved", "rejected"
		By         string    `bson:"by"`
		ApprovedBy string    `bson:"approved_by"`
	}
)

func (r *Request) MockData() {
	r.Index = "asdads-3"
	r.YoutubeURL = "https://www.youtube.com/watch?v=JGwWNGJdvx8"
	r.Question = "What is the name of the main character?"
	r.Answer = "Harry Potter"
	r.StartTime = "00:00:00"
	r.EndTime = "00:00:10"
	r.CreatedAt = time.Now()
	r.UpdatedAt = time.Now()
	r.Status = "pending"
	r.By = "user1"
}