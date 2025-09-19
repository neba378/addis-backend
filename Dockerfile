# Use Node.js LTS as base image
FROM node:20

# Set working directory
WORKDIR /app

# Copy package.json and lock file first (for caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy rest of the project files
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Expose the app port
EXPOSE 3001

# Start the server
CMD ["npm", "run", "dev"]
