FROM node:20-alpine

WORKDIR /app

# Install dependencies first for better caching
COPY package.json package-lock.json* ./
RUN npm install

# Copy the rest of the code
COPY . .

# Expose Next.js port
EXPOSE 3000

# Run in development mode with hot-reloading
CMD ["npm", "run", "dev"]