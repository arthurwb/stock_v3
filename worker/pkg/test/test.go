// You can edit this code!
// Click here and start typing.
package test

import (
	"fmt"
	"math/rand/v2"
	"strconv"
)

func Test() {
	// Generate a random float64
	randomFloat := strconv.FormatFloat((rand.Float64() * (4) - 2), 'f', 2, 64)

	fmt.Println(randomFloat)
}
