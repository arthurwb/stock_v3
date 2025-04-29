package database

import (
	"database/sql"
	"log"
)

func GetMarketDetails(db *sql.DB) map[string]string {
	log.Println("starting market details")
	query := "SELECT id, mName, mType FROM tMarket WHERE mName = 'current'"
	rows, err := db.Query(query)
	if err != nil {
		log.Println("Query error:", err)
		return nil
	}
	log.Println("after market query")
	if err != nil {
		log.Printf("Failed get market: %v", err)
	}
	var id, mName, mType string
    for rows.Next() {
		log.Println("scanning market")
		err := rows.Scan(&id, &mName, &mType)
		if err != nil {
			log.Println("Error in getting market details")
		}
	}
	defer rows.Close()
	log.Println("end market details")
	return map[string]string {
		"id": id,
		"mName": mName,
		"mType": mType,
	}
}