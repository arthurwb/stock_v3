# Use the official MySQL image from Docker Hub
FROM mysql:8.1
# Explicit version for consistency

# Set environment variables for MySQL
ENV MYSQL_ROOT_PASSWORD=root_password
ENV MYSQL_DATABASE=exc_database
ENV MYSQL_USER=user
ENV MYSQL_PASSWORD=password

# Expose MySQL's standard port
EXPOSE 3306
