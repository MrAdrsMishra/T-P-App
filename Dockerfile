
# Use a base image
FROM node:24.11.1-alpine
# FROM docker:18.11.1-dind
# Install Docker CLI
RUN apk add --no-cache docker-cli
# Set the working directory
WORKDIR /app

# Copy package.json first (for caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the entire application source code
COPY src/ ./src/

# Expose port (optional)
EXPOSE 5000

# Run the app
CMD ["npm", "start"]