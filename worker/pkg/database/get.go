package database

import (
    "database/sql"
    _ "github.com/go-sql-driver/mysql"
    "log"
)

func GetAllOptions(db *sql.DB) (map[string]map[string]interface{}, error) {
    optionsMap := make(map[string]map[string]interface{})
    
    query := "SELECT id, optionName, optionDescription, optionPrice FROM tOptions"
    rows, err := db.Query(query)
    if err != nil {
        log.Printf("Error querying options: %v", err)
        return nil, err
    }
    defer rows.Close()
    
    for rows.Next() {
        var id, optionName, optionDescription string
        var optionPrice float64
        
        err := rows.Scan(&id, &optionName, &optionDescription, &optionPrice)
        if err != nil {
            log.Printf("Error scanning option row: %v", err)
            continue
        }
        
        optionData := map[string]interface{}{
            "optionName":        optionName,
            "optionDescription": optionDescription,
            "optionPrice":       optionPrice,
        }
        
        optionsMap[id] = optionData
    }
    
    if err = rows.Err(); err != nil {
        log.Printf("Error iterating over option rows: %v", err)
        return nil, err
    }
    
    log.Printf("Retrieved %d options", len(optionsMap))
    return optionsMap, nil
}

func GetOneOption(tx *sql.Tx, optionId string) (map[string]interface{}, error) {
    optionMap := make(map[string]interface{})

    query := "SELECT id, optionName, optionDescription, optionPrice, optionBankruptcy FROM tOptions WHERE id = ?"
    row := tx.QueryRow(query, optionId)

    var id, optionName, optionDescription string
    var optionBankruptcy bool
    var optionPrice float64

    err := row.Scan(&id, &optionName, &optionDescription, &optionPrice, &optionBankruptcy)
    if err != nil {
        if err == sql.ErrNoRows {
            log.Printf("No option found with id: %s", optionId)
            return nil, nil
        }
        log.Printf("Error scanning option row: %v", err)
        return nil, err
    }

    optionMap["id"] = id
    optionMap["optionName"] = optionName
    optionMap["optionDescription"] = optionDescription
    optionMap["optionPrice"] = optionPrice
    optionMap["optionBankruptcy"] = optionBankruptcy

    return optionMap, nil
}


func GetAllUsers(tx *sql.Tx) (map[string]map[string]interface{}, error) {
    usersMap := make(map[string]map[string]interface{})
    
    query := "SELECT id, userEmail, userUsername, userPassword, userWallet FROM tUsers"
    rows, err := tx.Query(query)
    if err != nil {
        log.Printf("Error querying users: %v", err)
        return nil, err
    }
    defer rows.Close()
    
    for rows.Next() {
        var id, userEmail, userUsername, userPassword string
        var userWallet float64
        
        err := rows.Scan(&id, &userEmail, &userUsername, &userPassword, &userWallet)
        if err != nil {
            log.Printf("Error scanning option row: %v", err)
            continue
        }
        
        userData := map[string]interface{}{
            "userEmail": userEmail,
            "userUsername": userUsername,
            "userPassword": userPassword,
			"userWallet": userWallet,
        }
        
        usersMap[id] = userData
    }
    
    if err = rows.Err(); err != nil {
        log.Printf("Error iterating over option rows: %v", err)
        return nil, err
    }
    
    return usersMap, nil
}

func GetMarketDetails(db *sql.DB) map[string]string {
	query := "SELECT id, mName, mType FROM tMarket WHERE mName = 'current'"
	rows, err := db.Query(query)
	if err != nil {
		log.Println("Query error:", err)
		return nil
	}
	if err != nil {
		log.Printf("Failed get market: %v", err)
	}
	var id, mName, mType string
    for rows.Next() {
		err := rows.Scan(&id, &mName, &mType)
		if err != nil {
			log.Println("Error in getting market details")
		}
	}
	defer rows.Close()
	return map[string]string {
		"id": id,
		"mName": mName,
		"mType": mType,
	}
}

func GetAllCarrots(tx *sql.Tx) (map[string]map[string]interface{}, error) {
	carrotsMap := make(map[string]map[string]interface{})
    
    query := "SELECT id, userId, optionId FROM tCarrots"
    rows, err := tx.Query(query)
    if err != nil {
        log.Printf("Error querying carrots: %v", err)
        return nil, err
    }
    defer rows.Close()
    
    for rows.Next() {
        var id, userId, optionId string
        
        err := rows.Scan(&id, &userId, &optionId)
        if err != nil {
            log.Printf("Error scanning option row: %v", err)
            continue
        }
        
        carrotData := map[string]interface{}{
            "userId": userId,
            "optionId": optionId,
        }
        
        carrotsMap[id] = carrotData
    }
    
    if err = rows.Err(); err != nil {
        log.Printf("Error iterating over option rows: %v", err)
        return nil, err
    }
    
    log.Printf("Retrieved %d carrots", len(carrotsMap))
    return carrotsMap, nil
}