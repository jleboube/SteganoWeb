# syntax=docker/dockerfile:1
FROM node:20-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm install --include=dev

FROM deps AS build
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
RUN apk add --no-cache openssl
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./
CMD ["node", "dist/index.js"]
