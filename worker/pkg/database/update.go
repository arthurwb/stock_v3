package database

import (
	"database/sql"
	_ "github.com/go-sql-driver/mysql"
	"log"
)

// UpdatePrice updates the current price of an option and records the historical price.
func UpdatePrice(db *sql.DB, optionId int, optionPrice string) {
	tx, err := db.Begin()
	if err != nil {
		log.Printf("Error starting transaction: %v", err)
		return
	}

	// Update the current option price
	query := "UPDATE tOptions SET optionPrice = ? WHERE optionID = ?"
	_, err = tx.Exec(query, optionPrice, optionId)
	if err != nil {
		tx.Rollback()
		log.Printf("Error updating option ID %d: %v", optionId, err)
		return
	}

	// Record the historical price
	if err := UpdateHistoricalPrices(tx, optionId, optionPrice); err != nil {
		tx.Rollback()
		return
	}

	// Commit the transaction
	err = tx.Commit()
	if err != nil {
		log.Printf("Error committing transaction for option ID %d: %v", optionId, err)
		return
	}

	log.Printf("Updated %d %s", optionId, optionPrice)
}

func UpdateHistoricalPrices(tx *sql.Tx, optionId int, optionPrice string) error {
	// Check the total number of rows in tHistoricalPrices
	var rowCount int
	countQuery := "SELECT COUNT(*) FROM tHistoricalPrices"
	err := tx.QueryRow(countQuery).Scan(&rowCount)
	if err != nil {
		log.Printf("Error checking row count in tHistoricalPrices: %v", err)
		return err
	}

	// If more than 1000 rows exist, delete the oldest entry
	if rowCount >= 1000 {
		deleteQuery := "DELETE FROM tHistoricalPrices WHERE historicalPriceStamp = (SELECT MIN(historicalPriceStamp) FROM tHistoricalPrices)"
		_, err := tx.Exec(deleteQuery)
		if err != nil {
			log.Printf("Error deleting oldest historical price record: %v", err)
			return err
		}
		log.Println("Oldest historical price record deleted to maintain table size limit.")
	}

	// Insert the new historical price
	insertQuery := "INSERT INTO tHistoricalPrices (optionId, historicalPrice, historicalPriceStamp) VALUES (?, ?, NOW())"
	_, err = tx.Exec(insertQuery, optionId, optionPrice)
	if err != nil {
		log.Printf("Error inserting historical price for option ID %d: %v", optionId, err)
		return err
	}
	
	return nil
}

