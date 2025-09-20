# Multi-stage Dockerfile for Manufacturing Management API
FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache bash

FROM base AS deps
COPY package*.json ./
RUN npm ci --omit=dev

# (No build stage yet since plain JS). If TS added, insert build stage here.

FROM node:20-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app
# Create non-root user
RUN addgroup -S app && adduser -S app -G app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
EXPOSE 3000
USER app
HEALTHCHECK --interval=30s --timeout=5s --retries=3 CMD node -e "fetch('http://localhost:3000/health').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"
CMD ["node","src/server.js"]
