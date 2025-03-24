# Use a lightweight Node.js image
FROM node:16-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port for the server.js (if applicable)
EXPOSE 8080

# Start both scripts using concurrently
CMD ["npm", "start"]
