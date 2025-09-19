FROM node:20-alpine

# Create app directory
WORKDIR /app

# Copy dependencies
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma Client
RUN npx prisma generate

RUN npx prisma generate && npm run build

# Expose port
EXPOSE 3001

# Default command (migrations + start)
CMD ["sh", "-c", "npx prisma migrate deploy && npm run start"]
