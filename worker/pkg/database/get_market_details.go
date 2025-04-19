package database

import (
	"database/sql"
	"log"
)

func GetMarketDetails(db *sql.DB) map[string]string {
	query := "SELECT id, mName, mType FROM tMarket WHERE mName = 'current'"
	rows, err := db.Query(query)
	if err != nil {
		log.Fatalf("Failed get market: %v", err)
	}
	defer rows.Close()
	var id, mName, mType string
    for rows.Next() {
		err := rows.Scan(&id, &mName, &mType)
		if err != nil {
			log.Println("Error in getting market details")
		}
	}
	return map[string]string {
		"id": id,
		"mName": mName,
		"mType": mType,
	}
}