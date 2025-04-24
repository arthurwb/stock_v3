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

func DatabaseConnect() (*sql.DB) {
    dbURL := os.Getenv("DATABASE_URL")
    if dbURL == "" {
		fmt.Errorf("DATABASE_URL environment variable is not set")
        return nil
    }
    
    // Convert from mysql:// format to username:password@tcp(host:port)/dbname format
    // This handles URLs like: mysql://root:password@mysql.railway.internal:3306/railway
    dbURL = strings.TrimPrefix(dbURL, "mysql://")
    
    // Split the URL into user:pass@host:port/dbname
    parts := strings.Split(dbURL, "@")
    if len(parts) != 2 {
		fmt.Errorf("invalid database URL format")
        return nil
    }
    
    credentials := parts[0]
    hostAndDB := parts[1]
    
    // Split host:port/dbname
    hostDBParts := strings.Split(hostAndDB, "/")
    if len(hostDBParts) != 2 {
		fmt.Errorf("invalid database URL format")
        return nil
    }
    
    host := hostDBParts[0]
    dbName := hostDBParts[1]
    
    // Construct the MySQL DSN
    dsn := fmt.Sprintf("%s@tcp(%s)/%s", credentials, host, dbName)
    
    db, err := sql.Open("mysql", dsn)
    if err != nil {
		fmt.Errorf("error opening database connection: %v", err)
        return nil
    }
    
    // Test the database connection
    if err := db.Ping(); err != nil {
		fmt.Errorf("error connecting to the database: %v", err)
        return nil
    }

    tx, err := db.Begin()

    db.SetMaxOpenConns(10)
    db.SetMaxIdleConns(20)

	query := "SELECT mName FROM tMarket"
	rows, err := db.Query(query)
	if err != nil {
		log.Fatalf("Failed get market: %v", err)
	}
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

    tx.Commit()
    
    fmt.Println("Successfully connected to the database!")
    return db
}