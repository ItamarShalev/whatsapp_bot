FROM node:22-slim

WORKDIR /app

ENV NODE_ENV=development

COPY package*.json ./

RUN npm ci

COPY . .

RUN npx prisma generate

RUN npm run build

ENV NODE_ENV=production

CMD ["node", "dist/index.js"]
