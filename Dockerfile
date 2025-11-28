# syntax=docker/dockerfile:1

ARG NODE_VERSION=22.20.0

################################################################################
# Base stage
FROM node:${NODE_VERSION}-alpine as base

WORKDIR /usr/src/app

################################################################################
# Dependencies stage
FROM base as deps

RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev

################################################################################
# Build stage
FROM base as build

# Install all dependencies (including devDependencies)
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci

# Copy source files
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build TypeScript
RUN npm run build

################################################################################
# Final stage
FROM base as final

ENV NODE_ENV=production

# Run as non-root user
USER node

# Copy package files
COPY package.json .
COPY package-lock.json .

# Copy production dependencies
COPY --from=deps /usr/src/app/node_modules ./node_modules

# Copy built application
COPY --from=build /usr/src/app/dist ./dist

# Copy Prisma files (CRITICAL for migrations)
COPY --chown=node:node prisma ./prisma

# Copy Prisma Client from build stage
COPY --from=build /usr/src/app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build /usr/src/app/node_modules/@prisma ./node_modules/@prisma

EXPOSE 3000

# Run migrations and start app
CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]