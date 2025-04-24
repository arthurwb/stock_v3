package main

import (
	"fmt"
	"log"
	"os"
	"os/signal"
	"runtime/debug"
	"strconv"
	"syscall"
	"time"

	"exchange.com/m/v3/pkg/database"
	"exchange.com/m/v3/pkg/entropy"
	"github.com/joho/godotenv"
)

func main() {
    // load environment variables
    if os.Getenv("RAILWAY_ENVIRONMENT") == "" {
		godotenv.Load(".env") // Only for local
	}
    
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
    
    // Add a cancellation mechanism
    quit := make(chan os.Signal, 1)
    signal.Notify(quit, os.Interrupt, syscall.SIGTERM)
    
    ticker := time.NewTicker(time.Duration(rate) * time.Second)

	defer func() {
        if r := recover(); r != nil {
            log.Printf("PANIC RECOVERED: %v", r)
            // You can also print the stack trace if needed
            debug.PrintStack()
        }
    }()

    defer ticker.Stop()
    
    for {
        select {
        case <-ticker.C:
			if err := db.Ping(); err != nil {
				log.Printf("Database connection check failed: %v", err)
				// Attempt to reconnect
				newDb, reconnectErr := database.DatabaseConnect()
				if reconnectErr != nil {
					log.Printf("Failed to reconnect to database: %v", reconnectErr)
				} else {
					// Close old connection and replace with new one
					if db != nil {
						db.Close()
					}
					db = newDb
					log.Println("Successfully reconnected to database")
				}
			}
            if err := database.CheckUserQueue(db); err != nil {
                log.Printf("Error checking user queue: %v", err)
            }
            if err := database.CheckEventQueue(db); err != nil {
                log.Printf("Error checking event queue: %v", err)
            }
            if err := entropy.Entropy(db); err != nil {
                log.Printf("Error in entropy: %v", err)
            }
            fmt.Println("Snooze...")
        case <-quit:
            log.Println("Shutting down server...")
            return
        }
    }
}