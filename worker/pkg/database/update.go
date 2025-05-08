package database

import (
	"database/sql"
	_ "github.com/go-sql-driver/mysql"
	"github.com/google/uuid"
	"log"
)

func UpdatePrice(tx *sql.Tx, Id string, optionPrice string) {
	query := "UPDATE tOptions SET optionPrice = ? WHERE Id = ?"
	_, err := tx.Exec(query, optionPrice, Id)
	if err != nil {
		tx.Rollback()
		log.Printf("Error updating option ID %d: %v", Id, err)
		return
	}

	if err := UpdateHistoricalPrices(tx, Id, optionPrice); err != nil {
		tx.Rollback()
		return
	}
}

func UpdateHistoricalPrices(tx *sql.Tx, optionId string, optionPrice string) error {
	var rowCount int
	countQuery := "SELECT COUNT(*) FROM tHistoricalPrices"
	err := tx.QueryRow(countQuery).Scan(&rowCount)
	if err != nil {
		log.Printf("Error checking row count in tHistoricalPrices: %v", err)
		return err
	}

	if rowCount >= 1000 {
		deleteQuery := `
			DELETE t1
			FROM tHistoricalPrices t1
			JOIN (
				SELECT MIN(historicalPriceStamp) AS minStamp
				FROM tHistoricalPrices
			) t2 ON t1.historicalPriceStamp = t2.minStamp`
		_, err := tx.Exec(deleteQuery)
		if err != nil {
			log.Printf("Error deleting oldest historical price record: %v", err)
			return err
		}
	}

	newId := uuid.New().String()

	insertQuery := "INSERT INTO tHistoricalPrices (id, optionId, historicalPrice, historicalPriceStamp) VALUES (?, ?, ?, NOW())"
	_, err = tx.Exec(insertQuery, newId, optionId, optionPrice)
	if err != nil {
		log.Printf("Error inserting historical price for option ID %d: %v", optionId, err)
		return err
	}

	return nil
}

func UpdateMarket(tx *sql.Tx, marketType string) {
	marketQuery := `UPDATE tMarket
					SET mType = ?`
	_, err := tx.Exec(marketQuery, marketType)
	if err != nil {
		log.Println("Unable to update market type:", err)
		return
	}
	log.Printf("Market has become a %s market!", marketType)
}