## ------------------------------- Dependencies Stage ------------------------------ ##
FROM node:20-alpine AS deps

RUN npm install -g bun

WORKDIR /app

COPY package.json bun.lock ./

RUN bun install --frozen-lockfile

## ------------------------------- Builder Stage ------------------------------ ##
FROM node:20-alpine AS builder

RUN npm install -g bun

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

RUN bun run build

## ------------------------------- Production Stage ------------------------------ ##
FROM node:20-alpine AS production

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

WORKDIR /app

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
