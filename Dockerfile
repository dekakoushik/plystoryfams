# ==========================================
# Multi-stage Docker Build for Plystory FAMS
# ==========================================

# Stage 1: Build the Static Frontend
FROM node:20-alpine AS builder
WORKDIR /app

# Install build dependencies
COPY package*.json ./
RUN npm ci

# Copy source and build production bundle
COPY . .
RUN npm run build

# Stage 2: Production Runtime with Node.js & Express
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Install production dependencies only
COPY package*.json ./
RUN npm ci --only=production

# Copy compiled assets and server from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public
COPY server.js ./

# Expose production port
EXPOSE 3000

# Health check for Dockploy / Docker
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:3000/health || exit 1

# Start the production server
CMD ["node", "server.js"]
