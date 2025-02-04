package entropy

import (
	"database/sql"
	"log"
	"math/rand"
	"strconv"

	_ "github.com/go-sql-driver/mysql"

	"exchange.com/m/v3/pkg/database"
)

// Entropy updates option prices in the tOptions table
func Entropy(db *sql.DB) {
	if db == nil {
		log.Fatal("Database connection is nil. Please check your connection.")
	}

	query := "SELECT optionId, optionName, optionPrice FROM tOptions"
	rows, err := db.Query(query)
	if err != nil {
		log.Fatalf("Failed to execute query: %v", err)
	}
	defer rows.Close()

	for rows.Next() {
		var optionId int
		var optionName string
		var optionPrice float64

		err := rows.Scan(&optionId, &optionName, &optionPrice)
		if err != nil {
			log.Printf("Failed to scan row: %v", err)
			continue
		}

		// Calculate the new price
		newPrice := strconv.FormatFloat(optionPrice + (rand.Float64() * (10) - 5), 'f', 2, 64)

		// Update the price in the database
		database.UpdatePrice(db, optionId, newPrice)
	}

	// Check for errors after iteration
	if err := rows.Err(); err != nil { 
		log.Fatalf("Error during row iteration: %v", err)
	}
}
