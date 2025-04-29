package main

import (
	"fmt"
	"log"
	"os"
	"strconv"
	"time"

	"exchange.com/m/v3/pkg/database"
	"exchange.com/m/v3/pkg/entropy"
	"github.com/joho/godotenv"
)

func main() {
	// load environment variables
	inDevelopment := os.Getenv("RAILWAY_ENVIRONMENT") == ""
	if inDevelopment {
		godotenv.Load(".env") // Only for local
	}
	
	log.Println("Worker starting up...")
	
	// Open a connection to the database
	db, err := database.DatabaseConnect()
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close()

	rate, err := strconv.Atoi(os.Getenv("RATE"))
 
    if err != nil {
		log.Printf("Invalid RATE environment variable, using default of 5 seconds")
		rate = 5
    }
	
	log.Println("Worker initialized successfully, entering main loop")

	// Main loop
	for {
		log.Println("Starting scheduled tasks...")
		
		if err := database.CheckUserQueue(db); err != nil {
			log.Printf("Error checking user queue: %v", err)
		}
		
		if err := database.CheckEventQueue(db); err != nil {
			log.Printf("Error checking event queue: %v", err)
		}
		
		if err := entropy.Entropy(db); err != nil {
			log.Printf("Error in entropy: %v", err)
		}
		
		fmt.Printf("Snooze for %d seconds...", rate)
		time.Sleep(time.Duration(rate) * time.Second)
	}
}