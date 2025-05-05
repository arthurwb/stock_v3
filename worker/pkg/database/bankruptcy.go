package database

import (
	"database/sql"
	"log"
	"math/rand"
	"os"
	"strconv"
)

func Bankruptcy(tx *sql.Tx, optionId string) {
	log.Println("Bankrupt!:", optionId)
	UpdatePrice(tx, optionId, "0")

	SetBankrupt(tx, optionId)

	DeleteAllOptionCarrots(tx, optionId)
}

func SetBankrupt(tx *sql.Tx, optionId string) {
	setBankruptcyQuery := `UPDATE tOptions
						SET optionBankruptcy = True
						WHERE Id = ?`
	_, err := tx.Exec(setBankruptcyQuery, optionId)
	if err != nil {
		log.Println("Unable to set option to bankrupt:", err)
		return
	}
}

func Buyout(tx *sql.Tx, optionId string) {
	// 1/x change of breaking out of bankruptcy
	buyoutRate, err := strconv.Atoi(os.Getenv("BUYOUT_RATE"))
	if err != nil {
		log.Println("No Buyout rate set")
		return
	}
	if rand.Intn(buyoutRate) == 0 {
		log.Println("Buyout!:", optionId)
		removeBankruptcyQuery := `UPDATE tOptions
						SET optionBankruptcy = False, optionPrice = ?
						WHERE Id = ?`
		_, err := tx.Exec(removeBankruptcyQuery, os.Getenv("STANDARD"), optionId)
		if err != nil {
			log.Println("Unable to set option to bankrupt:", err)
			return
		}
	}
}