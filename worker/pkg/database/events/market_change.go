package events

import (
	"database/sql"
	"time"

	"exchange.com/m/v3/pkg/database/mutations"
)

func MarketChange(tx *sql.Tx, eqEffects string, eqStartDate string) (bool) {
	timeNow := time.Now().Truncate(time.Minute).Format("2006-01-02T15:04:05Z")
	if (timeNow == eqStartDate) {
		switch eqEffects {
			case "bull": mutations.UpdateMarket(tx, "bull")
			case "bear": mutations.UpdateMarket(tx, "bear")
			case "squirrel": mutations.UpdateMarket(tx, "squirrel")
			case "dragon": mutations.UpdateMarket(tx, "dragon")
		}
		return true
	} else {
		return false
	}
}