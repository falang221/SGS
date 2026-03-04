# Dockerfile pour l'API Backend
FROM node:20-alpine AS builder

WORKDIR /app

# Installation de pnpm
RUN npm install -g pnpm

# Copie des fichiers de configuration
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/api/package.json ./apps/api/

# Installation des dépendances
RUN pnpm install --frozen-lockfile

# Copie du code source
COPY packages/shared ./packages/shared
COPY apps/api ./apps/api

# Génération du client Prisma
WORKDIR /app/packages/shared
RUN pnpm prisma generate

# Build
WORKDIR /app/apps/api
RUN pnpm build

# Image de production
FROM node:20-alpine AS runner

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/shared/node_modules ./packages/shared/node_modules
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/package.json ./apps/api/package.json

EXPOSE 3001

CMD ["node", "apps/api/dist/index.js"]
