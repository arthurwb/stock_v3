package database

import (
	"database/sql"
	"log"
	"time"
)

func MarketChange(tx *sql.Tx, eqEffects string, eqStartDate string) (bool) {
    var startDate time.Time
    var err error
    
    startDate, err = time.Parse(time.RFC3339, eqStartDate)
    if err != nil {
        startDate, err = time.Parse("2006-01-02 15:04:05.000", eqStartDate)
        if err != nil {
            log.Println("Error parsing date:", err)
            return false
        }
    }
    
    currentTime := time.Now().Truncate(time.Minute)
    
    currentUnix := currentTime.Unix()
    startUnix := startDate.Unix()
    
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