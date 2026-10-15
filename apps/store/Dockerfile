FROM node:22-alpine AS base

# Dependencias del sistema
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Etapa de dependencias
FROM base AS deps
COPY package.json package-lock.json* ./
COPY apps/store/package.json ./apps/store/
COPY packages/database/package.json ./packages/database/
COPY packages/config-contracts/package.json ./packages/config-contracts/
RUN npm ci

# Etapa de compilación
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generar cliente de Prisma
RUN npm run db:generate --workspace=packages/database

# Compilar contratos compartidos y luego la tienda
RUN npm run build --workspace=packages/config-contracts
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
RUN npm run build --workspace=apps/store

# Etapa de ejecución
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/apps/store/public ./apps/store/public
COPY --from=builder --chown=nextjs:nodejs /app/apps/store/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/store/.next/static ./apps/store/.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "apps/store/server.js"]
