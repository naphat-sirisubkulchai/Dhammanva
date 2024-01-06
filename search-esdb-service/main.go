package main

import (
	"log"
	"search-esdb-service/config"
	"search-esdb-service/database"
	recordMigrator "search-esdb-service/record/migration"
	"search-esdb-service/server"
)

func main() {
	log.Println("Starting server...")

	log.Println("Initializing config...")
	config.InitializeViper("./")

	cfg := config.GetConfig()
	log.Println("Config initialized:", cfg)

	db := database.NewElasticDatabase(&cfg)
	log.Println("Success connect to database:")

	recordMigrator.RecordMigrate(&cfg, db)
	server.NewGinServer(&cfg, db.GetDB()).Start()
}
