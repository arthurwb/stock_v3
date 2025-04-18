package main

import (
	"log"
	"time"

	"exchange.com/m/v3/pkg/database"
	"exchange.com/m/v3/pkg/entropy"
	"github.com/joho/godotenv"
)

func main() {
	// load environment variables
	godotenv.Load("./.env")

	// Open a connection to the database
	db := database.DatabaseConnect()
	defer db.Close()

	for 1 > 0 {
		database.CheckUserQueue(db)
		entropy.Entropy(db)
		time.Sleep(2 * time.Second)
	}
}