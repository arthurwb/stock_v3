package database

import (
	"database/sql"
	"fmt"
	"log"
)

func CheckEventQueue(db *sql.DB) (error) {
	query := `SELECT eq.id, eq.eqType, o.id AS effectedOptionId, eq.eqEffects, eq.eqStartDate, eq.eqCreationDate, eq.eqComplete 
				FROM tEventQueue eq 
				LEFT JOIN _tEventQueue_eqEfectedOptionIds m 
				ON eq.id = m.A 
				LEFT JOIN tOptions o 
				ON o.id = m.B 
				WHERE eq.eqComplete = FALSE 
				ORDER BY eq.eqStartDate ASC;`

	rows, err := db.Query(query)
	if err != nil {
		return fmt.Errorf("error querying event queue: %v", err)
	}
	defer rows.Close()

	tx, err := db.Begin()
	if err != nil {
		return fmt.Errorf("error starting database: %v", err)
	}

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

		complete := false
		switch eqType {
		case "market": complete = MarketChange(tx, eqEffects, eqStartDate)
		default: 
			log.Printf("Unknown queue type for item %s: %s", id, eqType)
			continue
		}

		if !complete {
			continue
		}

		completeEventQuery := `UPDATE tEventQueue
								SET eqComplete = true
								WHERE id = ?`
		_, err = tx.Exec(completeEventQuery, id)
		if err != nil {
			log.Printf("Error in completing event: %e", err)
		}
	}

	tx.Commit()

	return nil
}