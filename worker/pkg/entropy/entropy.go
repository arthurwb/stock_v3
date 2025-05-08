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

func Entropy(db *sql.DB) (error) {
	if db == nil {
		return fmt.Errorf("Database connection is nil. Please check your connection.")
	}

	tx, err := db.Begin()

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

		if (optionPrice == 0) {
			database.Buyout(tx, Id)
			continue
		}

		lowerLimit, _ := strconv.ParseFloat(os.Getenv("ENTROPY_LOWER"), 64)
		upperLimit, _ := strconv.ParseFloat(os.Getenv("ENTROPY_UPPER"), 64)

		newPrice := strconv.FormatFloat(optionPrice + (func(lower, upper float64) float64 { 
			if (market["mType"] == "bear") {
				if rand.Intn(4) <= 3 { 
					return -(rand.Float64() * upperLimit)
				} 
				return rand.Float64() * upperLimit
			} else if (market["mType"] == "bull") {
				if rand.Intn(4) >= 3 { 
					return -(rand.Float64() * upperLimit)
				} 
				return rand.Float64() * upperLimit
			} else if (market["mType"] == "dragon") {
				if rand.Intn(2) == 0 { 
					return -(rand.Float64() * (upperLimit * 3))
				} 
				return rand.Float64() * (upperLimit * 3)
			} else {
				if rand.Intn(2) == 0 { 
					return -(rand.Float64() * upperLimit)
				} 
				return rand.Float64() * upperLimit
			}
		}(lowerLimit, upperLimit)), 'f', 2, 64)

		floatNewPrice, _ := strconv.ParseFloat(newPrice, 64)
		
		if (floatNewPrice < 0) {
			database.Bankruptcy(tx, Id)
		} else {
			database.UpdatePrice(tx, Id, newPrice)
		}
	}

	err = tx.Commit()
	if err != nil {
		log.Printf("Error running entropy: %v", err)
		return err
	}

	if err := rows.Err(); err != nil { 
		return fmt.Errorf("Error during row iteration: %v", err)
	}

	return nil
}
