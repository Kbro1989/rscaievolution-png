# Dockerfile for RSC Server on Fly.io
FROM node:20-alpine

# Install canvas dependencies
RUN apk add --no-cache \
  build-base \
  g++ \
  cairo-dev \
  jpeg-dev \
  pango-dev \
  giflib-dev \
  pixman-dev

# Set working directory
WORKDIR /app

# Copy package files from rsc-server directory
# We assume the build context is the rsc-cloudflare directory
COPY rsc-server/package*.json ./

# Install dependencies
# We only need production dependencies for the server runtime
RUN npm ci --only=production

# Copy server source code and data
COPY rsc-server/src ./src
COPY rsc-server/config.json ./config.json
COPY rsc-data ./rsc-data

# Debug: List copied data files
RUN ls -R ./rsc-data

# Expose WebSocket port
EXPOSE 43594

# Health check endpoint
# HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
#   CMD node -e "require('http').get('http://localhost:43594/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start server
CMD sh -c "echo '=== DIAGNOSTIC INFO ===' && \
  echo 'Working directory:' && pwd && \
  echo 'Directory contents:' && ls -la && \
  echo 'rsc-data exists?' && ls -la rsc-data && \
  echo 'src exists?' && ls -la src && \
  echo 'Attempting to start server...' && \
  node src/fly-server.js || (echo 'Server failed with exit code' $? && tail -f /dev/null)"
