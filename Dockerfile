
# Use a base image
FROM node:24.11.1-alpine
# Install Docker CLI
RUN apk add --no-cache docker-cli
# RUN docker pull mradrsmishra/compiler.com:cpp-runner
# RUN docker pull mradrsmishra/compiler.com:java-runner
# RUN docker pull mradrsmishra/compiler.com:go-runner
# RUN docker pull mradrsmishra/compiler.com:javascript-runner
# RUN docker pull mradrsmishra/compiler.com:rust-runner
# RUN docker pull mradrsmishra/compiler.com:python-runner
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
