package database

import (
	"database/sql"
	_ "github.com/go-sql-driver/mysql"

	"fmt"
	"os"
)

func env(enVar string) string {
	return os.Getenv(enVar)
}

func DatabaseConnect() (*sql.DB) {

	dsn := fmt.Sprintf("%s:%s@tcp(stock_v3_devcontainer-mysql-1:3306)/%s", env("DATABASE_ROOTUSER"), env("DATABASE_ROOTPASSWORD"), env("DATABASE_NAME"))

	db, err := sql.Open("mysql", dsn)
	if err != nil {
		fmt.Printf("Error opening database connection: %v", err)
	}

	// Test the database connection
	if err := db.Ping(); err != nil {
		fmt.Printf("Error connecting to the database: %v", err)
	}
	fmt.Println("Successfully connected to the database!")

	return db
}