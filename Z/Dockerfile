FROM node:25

# Set working directory
WORKDIR /app

# Install dependencies directly
RUN npm install axios ws

# Copy script
COPY apitest.js .

# Run the script
CMD ["node", "apitest.js"]