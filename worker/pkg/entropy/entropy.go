package entropy

import (
	"database/sql"
	"fmt"
	"log"
	"math/rand"
	"os"
	"strconv"

	_ "github.com/go-sql-driver/mysql"

	"exchange.com/m/v3/pkg/database"
)

// Entropy updates option prices in the tOptions table
func Entropy(db *sql.DB) (error) {
	if db == nil {
		return fmt.Errorf("Database connection is nil. Please check your connection.")
	}

	query := "SELECT Id, optionName, optionPrice FROM tOptions"
	rows, err := db.Query(query)
	if err != nil {
		return fmt.Errorf("Failed to execute query: %v", err)
	}
	defer rows.Close()

	market := database.GetMarketDetails(db)

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
		lowerLimit, _ := strconv.ParseFloat(os.Getenv("ENTROPY_LOWER"), 64)
		upperLimit, _ := strconv.ParseFloat(os.Getenv("ENTROPY_UPPER"), 64)

		newPrice := strconv.FormatFloat(optionPrice + (func(lower, upper float64) float64 { 
			if (market["mType"] == "bear") {
				if rand.Intn(4) <= 3 { 
					return -(lower + rand.Float64()*(upper-lower))
				} 
				return lower + rand.Float64()*(upper-lower) 
			} else if (market["mType"] == "bull") {
				if rand.Intn(4) >= 3 { 
					return -(lower + rand.Float64()*(upper-lower))
				} 
				return lower + rand.Float64()*(upper-lower) 
			} else if (market["mType"] == "dragon") {
				if rand.Intn(2) == 0 { 
					return -(lower + rand.Float64()*(upper-lower))
				} 
				return (lower + rand.Float64()*(upper-lower)) * 3
			} else {
				if rand.Intn(2) == 0 { 
					return -(lower + rand.Float64()*(upper-lower))
				} 
				return lower + rand.Float64()*(upper-lower) 
			}
		}(lowerLimit, upperLimit)), 'f', 2, 64)

		// Update the price in the database
		database.UpdatePrice(db, Id, newPrice)
	}

	// Check for errors after iteration
	if err := rows.Err(); err != nil { 
		return fmt.Errorf("Error during row iteration: %v", err)
	}

	return nil
}
