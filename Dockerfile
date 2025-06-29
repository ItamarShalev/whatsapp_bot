FROM node:lts-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npx --yes prisma generate

ENV DATABASE_URL=file:./data/database.sqlite

CMD ["sh", "-c", "npx --yes prisma migrate deploy && npx --yes tsx src/index.ts"]
