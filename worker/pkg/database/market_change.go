package database

import (
	"database/sql"
	"log"
	"time"
)

func MarketChange(tx *sql.Tx, eqEffects string, eqStartDate string) (bool) {
	// Parse eqStartDate - try multiple formats to handle both cases
    var startDate time.Time
    var err error
    
    // Try ISO 8601 format first (with T and Z)
    startDate, err = time.Parse(time.RFC3339, eqStartDate)
    if err != nil {
        // Try space-separated format with milliseconds
        startDate, err = time.Parse("2006-01-02 15:04:05.000", eqStartDate)
        if err != nil {
            log.Println("Error parsing date:", err)
            return false
        }
    }
    
    // Get current time and truncate to minutes
    currentTime := time.Now().Truncate(time.Minute)
    
    // Convert both to Unix time (seconds since epoch)
    currentUnix := currentTime.Unix()
    startUnix := startDate.Unix()
    
    log.Println("Current Unix time:", currentUnix)
    log.Println("Start date Unix time:", startUnix)
	if (currentUnix == startUnix) {
		switch eqEffects {
			case "bull": UpdateMarket(tx, "bull")
			case "bear": UpdateMarket(tx, "bear")
			case "squirrel": UpdateMarket(tx, "squirrel")
			case "dragon": UpdateMarket(tx, "dragon")
		}
		return true
	} else {
		return false
	}
}