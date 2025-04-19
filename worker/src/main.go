package main

import (
	"os"
	"strconv"
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

	rate, _ := strconv.Atoi(os.Getenv("RATE"))

	for 1 > 0 {
		database.CheckUserQueue(db)
		database.CheckEventQueue(db)
		entropy.Entropy(db)
		time.Sleep(time.Duration(rate) * time.Second)
	}
}