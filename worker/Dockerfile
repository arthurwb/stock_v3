FROM golang:1.21-alpine

WORKDIR /app

# Copy go.mod and go.sum files
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy the source code
COPY . .

# Build the application
RUN go build -o worker src/main.go

# Command to run the executable
CMD ["./worker"]