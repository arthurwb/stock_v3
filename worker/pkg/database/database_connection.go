package database

import (
	"database/sql"
	"fmt"
	"log"
	"os"
	"strings"

	_ "github.com/go-sql-driver/mysql"
	"github.com/google/uuid"
)

func DatabaseConnect() (*sql.DB, error) {
    dbURL := os.Getenv("DATABASE_URL")
    if dbURL == "" {
        return nil, fmt.Errorf("DATABASE_URL environment variable is not set")
    }
    
    dbURL = strings.TrimPrefix(dbURL, "mysql://")
    
    parts := strings.Split(dbURL, "@")
    if len(parts) != 2 {
        return nil, fmt.Errorf("invalid database URL format")
    }
    
    credentials := parts[0]
    hostAndDB := parts[1]
    
    hostDBParts := strings.Split(hostAndDB, "/")
    if len(hostDBParts) != 2 {
        return nil, fmt.Errorf("invalid database URL format")
    }
    
    host := hostDBParts[0]
    dbName := hostDBParts[1]
    
    dsn := fmt.Sprintf("%s@tcp(%s)/%s", credentials, host, dbName)
    
    db, err := sql.Open("mysql", dsn)
    if err != nil {
        return nil, fmt.Errorf("error opening database connection: %v", err)
    }
    
    if err := db.Ping(); err != nil {
        return nil, fmt.Errorf("error opening database connection: %v", err)
    }

    tx, err := db.Begin()

	query := "SELECT mName FROM tMarket"
	rows, err := db.Query(query)
	if err != nil {
        return nil, fmt.Errorf("error connecting to the database: %v", err)
    }
    defer tx.Rollback()
	defer rows.Close()
    if !rows.Next() {
        marketId := uuid.New().String()
        marketQuery := `INSERT INTO tMarket 
                        (id, mName, mType) 
                        VALUES (?, ?, ?)`
        _, err = tx.Exec(marketQuery, marketId, "current", "squirrel")
        if err != nil {
            log.Println("Error in market configuration")
        }
    }

    if err := tx.Commit(); err != nil {
        return nil, fmt.Errorf("error committing transaction: %v", err)
    }
    return db, nil
}