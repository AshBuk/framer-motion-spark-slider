# Build stage
FROM node:20-bookworm-slim AS builder
WORKDIR /app
COPY package*.json ./
ENV NEXT_TELEMETRY_DISABLED=1
# Install dependencies (CI-mode)
RUN npm ci --no-audit --no-fund
COPY . .
RUN npm run build

# Runtime stage
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
VOLUME ["/app/public/uploads"]
EXPOSE 3000
CMD ["node", "server.js"]

