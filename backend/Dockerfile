# Use official Node.js LTS image
FROM node:18-alpine

# Create app directory
WORKDIR /app

# Install dependencies first for better caching
COPY package*.json ./
RUN npm install

# Copy source files
COPY . .

# Expose port
EXPOSE 3000

# Start command
CMD ["npm", "run", "dev"]
