# ---- Build Stage ----
FROM node:22-slim AS builder
WORKDIR /app

ENV NODE_ENV=development

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build:bundle

# ---- Production Stage ----
FROM node:22-slim AS runner
WORKDIR /app

COPY --from=builder app/dist/index.js ./index.js

ENV NODE_ENV=production
CMD ["node", "index.js"]
