package main

import (
	"context"
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
		log.Println("Worker exiting...")
	}()
	
	// Create a cancellable context
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()
	
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
	
	// Setup signal handling (same for both dev and prod)
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, os.Interrupt, syscall.SIGTERM, syscall.SIGINT)
	
	// Start a goroutine to handle signals
	go func() {
		sig := <-quit
		log.Printf("Received signal %v - initiating graceful shutdown", sig)
		cancel() // Cancel the context to signal shutdown
		
		// Set a timeout for graceful shutdown
		time.Sleep(10 * time.Second)
		log.Println("Shutdown timeout reached, forcing exit")
		os.Exit(1)
	}()
	
	log.Println("Worker initialized successfully, entering main loop")
	
	// Use a ticker for consistent timing
	ticker := time.NewTicker(time.Duration(rate) * time.Second)
	defer ticker.Stop()
	
	// Add a heartbeat ticker
	heartbeat := time.NewTicker(30 * time.Second)
	defer heartbeat.Stop()
	
	// Track last successful task execution
	lastSuccessful := time.Now()
	
	// Main loop
	for {
		select {
		case <-ctx.Done():
			log.Println("Context cancelled, exiting main loop")
			return
			
		case <-heartbeat.C:
			timeSinceSuccess := time.Since(lastSuccessful)
			log.Printf("HEARTBEAT: Worker still running. Last successful tasks: %v ago", timeSinceSuccess)
			
			// If it's been too long since successful task execution, log a warning
			if timeSinceSuccess > time.Duration(rate*3)*time.Second {
				log.Printf("WARNING: No successful task execution in %v", timeSinceSuccess)
			}
			
		case <-ticker.C:
			log.Println("Starting scheduled tasks...")
			
			// Track start time
			startTime := time.Now()
			
			// Execute tasks with error handling for each
			tasksSuccessful := true
			
			if err := database.CheckUserQueue(db); err != nil {
				log.Printf("Error checking user queue: %v", err)
				tasksSuccessful = false
			}
			
			if err := database.CheckEventQueue(db); err != nil {
				log.Printf("Error checking event queue: %v", err)
				tasksSuccessful = false
			}
			
			if err := entropy.Entropy(db); err != nil {
				log.Printf("Error in entropy: %v", err)
				tasksSuccessful = false
			}
			
			if tasksSuccessful {
				lastSuccessful = time.Now()
				log.Printf("Tasks completed successfully in %v", time.Since(startTime))
			} else {
				log.Printf("Some tasks failed (took %v)", time.Since(startTime))
			}
			
			fmt.Println("Snooze...")
		}
	}
}