#!/bin/bash

CONTAINER_NAME="exc_database"
IMAGE_NAME="exc_database"

cd ./database

# Check if the container exists
if docker ps -a --format '{{.Names}}' | grep -q "^$CONTAINER_NAME$"; then
    echo "Stopping and removing existing container: $CONTAINER_NAME..."
    docker stop $CONTAINER_NAME
    docker rm $CONTAINER_NAME
fi

# Check if the image exists
if docker images -q $IMAGE_NAME > /dev/null; then
    echo "Removing existing image: $IMAGE_NAME..."
    docker rmi $IMAGE_NAME
fi

# Build the new MySQL image
echo "Building new MySQL image..."
docker build -t $IMAGE_NAME ./database

# Run the MySQL container
echo "Starting new MySQL container..."
docker run -d \
  --name $CONTAINER_NAME \
  -p 3306:3306 \
  -e MYSQL_ROOT_PASSWORD=root_password \
  -e MYSQL_DATABASE=exc_database \
  -e MYSQL_USER=user \
  -e MYSQL_PASSWORD=password \
  $IMAGE_NAME

echo "MySQL container setup complete."
