package database

import (
	"database/sql"
	"time"
)

func MarketChange(tx *sql.Tx, eqEffects string, eqStartDate string) (bool) {
	timeNow := time.Now().Truncate(time.Minute).Format("2006-01-02T15:04:05Z")
	if (timeNow == eqStartDate) {
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