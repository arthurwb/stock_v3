package database

import (
	"database/sql"
	"fmt"
	"log"
	// "os"
)

func CheckEventQueue(db *sql.DB) (error) {
	log.Println("Starting event queue")
	query := `SELECT eq.id, eq.eqType, o.id AS effectedOptionId, eq.eqEffects, eq.eqStartDate, eq.eqCreationData, eq.eqComplete 
				FROM tEventQueue eq 
				LEFT JOIN _tEventQueue_eqEfectedOptionIds m 
				ON eq.id = m.A 
				LEFT JOIN tOptions o 
				ON o.id = m.B 
				WHERE eq.eqComplete = FALSE 
				ORDER BY eq.eqStartDate ASC;`

	rows, err := db.Query(query)
	if err != nil {
		return fmt.Errorf("Error querying event queue: %v", err)
	}
	defer rows.Close()

	tx, err := db.Begin()

	for rows.Next() {
		var id, eqType, eqEffects string
		var effectedOptionId sql.NullString
		var eqStartDate, eqCreationData string
		var eqComplete bool

		err := rows.Scan(&id, &eqType, &effectedOptionId, &eqEffects, &eqStartDate, &eqCreationData, &eqComplete)
		if err != nil {
			log.Printf("Error scanning event queue row: %v", err)
			continue
		}

		if eqComplete {
			continue
		}

		// event := map[string]interface{}{
		// 	"id":               id,
		// 	"eqType":           eqType,
		// 	"effectedOptionId": effectedOptionId,
		// 	"eqEffects":        eqEffects,
		// 	"eqStartDate":      eqStartDate,
		// 	"eqCreationData":   eqCreationData,
		// 	"eqComplete":       eqComplete,
		// }

		switch eqType {
		case "bull": updateMarket(tx, "bull")
		case "bear": updateMarket(tx, "bear")
		case "squirrel": updateMarket(tx, "squirrel")
		case "dragon": updateMarket(tx, "dragon")
		default: 
			log.Printf("Unknown queue type for item %s: %s", id, eqType)
			continue
		}

		completeEventQuery := `UPDATE tEventQueue
								SET eqComplete = true
								WHERE id = ?`
		_, err = tx.Exec(completeEventQuery, id)
		if err != nil {
			log.Printf("Error in completing event: %e", err)
		}
		tx.Commit()
	}

	log.Println("Finished event queue")
	return nil
}

func updateMarket(tx *sql.Tx, marketType string) {
	marketQuery := `UPDATE tMarket
					SET mType = ?`
	_, err := tx.Exec(marketQuery, marketType)
	if err != nil {
		log.Println("Unable to update market type:", err)
		return
	}
	log.Printf("Market has become a %s market!", marketType)
}