FROM node:18-slim

# Create app directory
WORKDIR /usr/src/app

# Install dependencies first (better layer caching)
COPY package*.json ./
RUN npm install --production

# Copy source code
COPY . .

# RSC server port
EXPOSE 43594

# Run the Fly.io server entry point
CMD ["node", "src/fly-server.js"]
