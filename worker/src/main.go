package main

import (
	"fmt"
	"log"
	"os"
	"os/signal"
	"strconv"
	"syscall"
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
    
    // Defer panic recovery
    defer func() {
        if r := recover(); r != nil {
            log.Printf("PANIC RECOVERED: %v", r)
        }
    }()
    
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
    
    log.Println("Worker initialized successfully, entering main loop")
    
    // Use a simple loop that keeps running even if signals are received
    running := true
    lastCheck := time.Now()
    
    // Start a goroutine to handle signals differently in development
    if inDevelopment {
        go func() {
            sig := <-quit
            log.Printf("Received signal %v in development mode - shutting down", sig)
            running = false
        }()
    }
    
    for running {
        // Check if it's time to run our tasks
        if time.Since(lastCheck) >= time.Duration(rate)*time.Second {
            // Tasks execution code stays the same...
            
            // Run our tasks
            if err := database.CheckUserQueue(db); err != nil {
                log.Printf("Error checking user queue: %v", err)
            }
            
            if err := database.CheckEventQueue(db); err != nil {
                log.Printf("Error checking event queue: %v", err)
            }
            
            if err := entropy.Entropy(db); err != nil {
                log.Printf("Error in entropy: %v", err)
            }
            
            log.Println("Tasks completed successfully")
            fmt.Println("Snooze...")
            
            lastCheck = time.Now()
        }
        
        // In production, check for quit signal but don't exit immediately
        if !inDevelopment {
            select {
            case <-quit:
                log.Println("Shutdown signal received in production, but continuing to run...")
                // We acknowledge the signal but don't exit
            default:
                // Continue running
            }
        }
        
        // Short sleep to prevent CPU spinning
        time.Sleep(100 * time.Millisecond)
    }
    
    log.Println("Worker exiting...")
}