package database

import (
	"database/sql"
	"log"
)

func DeleteAllOptionCarrots(tx *sql.Tx, optionId string) {
	query := `DELETE FROM tCarrots
				WHERE optionId = ?`
	_, err := tx.Exec(query, optionId)
	if err != nil {
        log.Printf("Error deleting all option carrots: %v", err)
		return
    }
}