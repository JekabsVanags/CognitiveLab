# Use Node.js LTS version as the base image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the project
COPY . .

# Expose port (jsPsych server port)
EXPOSE 3000

# Default command (can be overridden in docker-compose)
CMD ["npm", "start"]
