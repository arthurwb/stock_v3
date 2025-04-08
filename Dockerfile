# Base image for your Node.js app
FROM mcr.microsoft.com/devcontainers/typescript-node:1-22-bookworm

# Install yarn (if not preinstalled)
RUN npm install -g yarn

# Set working directory
WORKDIR /workspace

# Copy application files
COPY . .

# Install dependencies
RUN yarn install

# Expose app's port
EXPOSE 3000
