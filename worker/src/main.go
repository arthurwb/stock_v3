package main

import (
	"fmt"
	"time"
)

func main() {
	for 1 > 0 {
		fmt.Println("Ping!")
		time.Sleep(5 * time.Second)
	}
}