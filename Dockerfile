
# Use a base image
FROM node:24.11.1

# Set the working directory
WORKDIR /app

# Copy package.json first (for caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the code
COPY . .

# Expose port (optional)
EXPOSE 3000

# Run the app
CMD ["npm", "start"]
