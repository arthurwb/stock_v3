package mutations

import (
	"database/sql"
	"log"
)

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