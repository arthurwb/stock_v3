package database

import (
	"database/sql"
	"errors"
	"fmt"
	"log"

	_ "github.com/go-sql-driver/mysql"
	"github.com/google/uuid"
)

func CheckUserQueue(db *sql.DB) (error) {
    fmt.Println("Starting user queue")
    // Query to select all incomplete user queue entries ordered by transaction date (oldest first)
    query := `SELECT id, uqType, uqOptionId, uqUserId, uqCount,
              uqTransactionDate, uqComplete FROM tUserQueue 
              WHERE uqComplete = FALSE
              ORDER BY uqTransactionDate ASC`
    
    rows, err := db.Query(query)
    if err != nil {
        return fmt.Errorf("Error querying user queue: %v", err)
    }
    defer rows.Close()
    
    // Process each queue item
    for rows.Next() {
        var id, uqType string
        var uqOptionId, uqUserId sql.NullString
        var uqCount sql.NullInt32
        var uqTransactionDateStr sql.NullString
        var uqComplete bool
        
        // Scan the row into variables
        err := rows.Scan(&id, &uqType, &uqOptionId, &uqUserId,
                       &uqCount, &uqTransactionDateStr, &uqComplete)
        if err != nil {
            log.Printf("Error scanning user queue row: %v", err)
            continue
        }
        
        // Skip if already complete or missing required fields
        if uqComplete || !uqOptionId.Valid || !uqUserId.Valid {
            continue
        }
        
        // Process based on queue type
        switch uqType {
        case "buy":
            err = processBuyQueueItem(db, id, uqOptionId.String, uqUserId.String, uqCount)
        case "sell":
            err = processSellQueueItem(db, id, uqOptionId.String, uqUserId.String, uqCount)
        default:
            log.Printf("Unknown queue type for item %s: %s", id, uqType)
            continue
        }
        
        if err != nil {
            log.Printf("Error processing %s queue item %s: %v", uqType, id, err)
            continue
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

    fmt.Println("Finished user queue")
    return nil
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
        return errors.New("insufficient funds")
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

func processSellQueueItem(db *sql.DB, queueId, optionId, userId string, sellCount sql.NullInt32) error {
    // Start a transaction
    tx, err := db.Begin()
    if err != nil {
        log.Printf("Error starting transaction: %v", err)
        return err
    }
    
    // Set default sell count if null
    count := int32(1)
    if sellCount.Valid {
        count = sellCount.Int32
    }
    
    // Get current option price
    var optionPrice float64
    priceQuery := "SELECT optionPrice FROM tOptions WHERE id = ?"
    err = tx.QueryRow(priceQuery, optionId).Scan(&optionPrice)
    if err != nil {
        tx.Rollback()
        return err
    }
    
    // Calculate total sale value
    totalSaleValue := optionPrice * float64(count)
    
    // Verify user owns enough carrots of this option
    var carrots []string
    findCarrotsQuery := `SELECT id FROM tCarrots 
                        WHERE userId = ? AND optionId = ? 
                        ORDER BY carrotDatePurchased ASC 
                        LIMIT ?`
    
    rows, err := tx.Query(findCarrotsQuery, userId, optionId, count)
    if err != nil {
        tx.Rollback()
        log.Printf("Error finding carrots for user %s, option %s: %v", userId, optionId, err)
        return err
    }
    
    // Collect carrot IDs
    for rows.Next() {
        var carrotId string
        if err := rows.Scan(&carrotId); err != nil {
            rows.Close()
            tx.Rollback()
            return err
        }
        carrots = append(carrots, carrotId)
    }
    rows.Close()
    
    // Check if we found enough carrots
    if len(carrots) < int(count) {
        tx.Rollback()
        log.Printf("User %s doesn't own enough carrots of option %s. Required: %d, Found: %d", 
                  userId, optionId, count, len(carrots))
        return errors.New("insufficient carrots owned")
    }
    
    // Get current user wallet balance
    var userWallet float64
    walletQuery := "SELECT userWallet FROM tUsers WHERE id = ?"
    err = tx.QueryRow(walletQuery, userId).Scan(&userWallet)
    if err != nil {
        tx.Rollback()
        log.Printf("Error getting user wallet for %s: %v", userId, err)
        return err
    }
    
    // Update user wallet with sale proceeds
    newBalance := userWallet + totalSaleValue
    updateWalletQuery := "UPDATE tUsers SET userWallet = ? WHERE id = ?"
    _, err = tx.Exec(updateWalletQuery, newBalance, userId)
    if err != nil {
        tx.Rollback()
        log.Printf("Error updating user wallet for %s: %v", userId, err)
        return err
    }
    
    // Delete sold carrots
    for _, carrotId := range carrots {
        deleteCarrotQuery := "DELETE FROM tCarrots WHERE id = ?"
        _, err = tx.Exec(deleteCarrotQuery, carrotId)
        if err != nil {
            tx.Rollback()
            log.Printf("Error deleting carrot %s: %v", carrotId, err)
            return err
        }
    }
    
    // Commit the transaction
    err = tx.Commit()
    if err != nil {
        log.Printf("Error committing transaction for queue item %s: %v", queueId, err)
        return err
    }
    
    log.Printf("Successfully processed sell queue item %s: user %s sold %d of option %s for $%f", 
               queueId, userId, count, optionId, totalSaleValue)
    return nil
}