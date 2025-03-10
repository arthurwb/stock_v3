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

	query := "SELECT Id, optionName, optionPrice FROM tOptions"
	rows, err := db.Query(query)
	if err != nil {
		log.Fatalf("Failed to execute query: %v", err)
	}
	defer rows.Close()

	for rows.Next() {
		var Id string
		var optionName string
		var optionPrice float64

		err := rows.Scan(&Id, &optionName, &optionPrice)
		if err != nil {
			log.Printf("Failed to scan row: %v", err)
			continue
		}

		// Calculate the new price
		lowerLimit := 10.0
		upperLimit := 20.0

		newPrice := strconv.FormatFloat(optionPrice + (func(lower, upper float64) float64 { 
			if rand.Intn(2) == 0 { 
				return -upper + rand.Float64()*(upper-lower) 
			} 
			return lower + rand.Float64()*(upper-lower) 
		}(lowerLimit, upperLimit)), 'f', 2, 64)		

		// Update the price in the database
		database.UpdatePrice(db, Id, newPrice)
	}

	// Check for errors after iteration
	if err := rows.Err(); err != nil { 
		log.Fatalf("Error during row iteration: %v", err)
	}
}
