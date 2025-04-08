FROM golang:latest AS builder

WORKDIR /app
COPY . .
RUN go mod download
# Point to your main.go in the src directory
RUN CGO_ENABLED=0 GOOS=linux go build -o worker ./src/

FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /root/
COPY --from=builder /app/worker .
CMD ["./worker"]