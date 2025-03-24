package database

import (
    "database/sql"
    _ "github.com/go-sql-driver/mysql"
    "log"
)

func GetAllOptions(db *sql.DB) (map[string]map[string]interface{}, error) {
    // Initialize the result map
    optionsMap := make(map[string]map[string]interface{})
    
    // Query to select all options based on the updated schema
    query := "SELECT id, optionName, optionDescription, optionPrice FROM tOptions"
    rows, err := db.Query(query)
    if err != nil {
        log.Printf("Error querying options: %v", err)
        return nil, err
    }
    defer rows.Close()
    
    // Iterate through the results
    for rows.Next() {
        var id, optionName, optionDescription string
        var optionPrice float64
        
        // Scan the row into variables
        err := rows.Scan(&id, &optionName, &optionDescription, &optionPrice)
        if err != nil {
            log.Printf("Error scanning option row: %v", err)
            continue
        }
        
        // Create a map for this option
        optionData := map[string]interface{}{
            "optionName":        optionName,
            "optionDescription": optionDescription,
            "optionPrice":       optionPrice,
        }
        
        // Add the option to the results map
        optionsMap[id] = optionData
    }
    
    // Check for errors from iterating over rows
    if err = rows.Err(); err != nil {
        log.Printf("Error iterating over option rows: %v", err)
        return nil, err
    }
    
    log.Printf("Retrieved %d options", len(optionsMap))
    return optionsMap, nil
}