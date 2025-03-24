package database

import (
    "database/sql"
    "log"
    "github.com/google/uuid"
    _ "github.com/go-sql-driver/mysql"
)

func CheckUserQueue(db *sql.DB) {
    // Query to select all incomplete user queue entries ordered by purchase date (oldest first)
    query := `SELECT id, uqType, uqOptionId, uqUserId, uqPurchaseCount,
              uqDatePurchased, uqComplete FROM tUserQueue 
              WHERE uqComplete = FALSE
              ORDER BY uqDatePurchased ASC`
    
    rows, err := db.Query(query)
    if err != nil {
        log.Printf("Error querying user queue: %v", err)
        return
    }
    defer rows.Close()
    
    // Process each queue item
    for rows.Next() {
        var id, uqType string
        var uqOptionId, uqUserId sql.NullString
        var uqPurchaseCount sql.NullInt32
        var uqDatePurchasedStr sql.NullString
        var uqComplete bool
        
        // Scan the row into variables
        err := rows.Scan(&id, &uqType, &uqOptionId, &uqUserId,
                       &uqPurchaseCount, &uqDatePurchasedStr, &uqComplete)
        if err != nil {
            log.Printf("Error scanning user queue row: %v", err)
            continue
        }
        
        // Skip if already complete or missing required fields
        if uqComplete || !uqOptionId.Valid || !uqUserId.Valid {
            continue
        }
        
        // Process "buy" type queue items
        if uqType == "buy" {
            err = processBuyQueueItem(db, id, uqOptionId.String, uqUserId.String, uqPurchaseCount)
            if err != nil {
                log.Printf("Error processing buy queue item %s: %v", id, err)
                continue
            }
        }
        
        // Mark the queue item as complete
        updateQuery := "UPDATE tUserQueue SET uqComplete = TRUE WHERE id = ?"
        _, err = db.Exec(updateQuery, id)
        if err != nil {
            log.Printf("Error marking queue item %s as complete: %v", id, err)
        }
    }
    
    // Check for errors from iterating over rows
    if err = rows.Err(); err != nil {
        log.Printf("Error iterating over user queue rows: %v", err)
    }
}

func processBuyQueueItem(db *sql.DB, queueId, optionId, userId string, purchaseCount sql.NullInt32) error {
    // Start a transaction
    tx, err := db.Begin()
    if err != nil {
        log.Printf("Error starting transaction: %v", err)
        return err
    }
    
    // Set default purchase count if null
    count := int32(1)
    if purchaseCount.Valid {
        count = purchaseCount.Int32
    }
    
    // Get current option price
    var optionPrice float64
    priceQuery := "SELECT optionPrice FROM tOptions WHERE id = ?"
    err = tx.QueryRow(priceQuery, optionId).Scan(&optionPrice)
    if err != nil {
        tx.Rollback()
        log.Printf("Error getting option price for %s: %v", optionId, err)
        return err
    }
    
    // Calculate total cost
    totalCost := optionPrice * float64(count)
    
    // Get current user wallet balance
    var userWallet float64
    walletQuery := "SELECT userWallet FROM tUsers WHERE id = ?"
    err = tx.QueryRow(walletQuery, userId).Scan(&userWallet)
    if err != nil {
        tx.Rollback()
        log.Printf("Error getting user wallet for %s: %v", userId, err)
        return err
    }
    
    // Check if user has enough funds
    if userWallet < totalCost {
        tx.Rollback()
        log.Printf("Insufficient funds for user %s. Required: %f, Available: %f", userId, totalCost, userWallet)
        return err
    }
    
    // Update user wallet
    newBalance := userWallet - totalCost
    updateWalletQuery := "UPDATE tUsers SET userWallet = ? WHERE id = ?"
    _, err = tx.Exec(updateWalletQuery, newBalance, userId)
    if err != nil {
        tx.Rollback()
        log.Printf("Error updating user wallet for %s: %v", userId, err)
        return err
    }
    
    // Create carrot entries for each purchase
    for i := 0; i < int(count); i++ {
        // Generate a new UUID for the carrot
        carrotId := uuid.New().String()
        
        // Insert carrot record
        insertCarrotQuery := `INSERT INTO tCarrots 
                             (id, userId, optionId, carrotPurchasePrice, carrotDatePurchased) 
                             VALUES (?, ?, ?, ?, NOW())`
        _, err = tx.Exec(insertCarrotQuery, carrotId, userId, optionId, optionPrice)
        if err != nil {
            tx.Rollback()
            log.Printf("Error creating carrot for user %s, option %s: %v", userId, optionId, err)
            return err
        }
    }
    
    // Commit the transaction
    err = tx.Commit()
    if err != nil {
        log.Printf("Error committing transaction for queue item %s: %v", queueId, err)
        return err
    }
    
    log.Printf("Successfully processed buy queue item %s: user %s purchased %d of option %s for $%f", 
               queueId, userId, count, optionId, totalCost)
    return nil
}