FROM node:22-slim

WORKDIR /app

RUN apt update \
    && apt install -y wget gnupg \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-stable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 \
      --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*


RUN groupadd -r pptruser && useradd -r -g pptruser -G audio,video pptruser

ENV NPM_CONFIG_LOGLEVEL=error

COPY package.json .

RUN npm install --save-dev --no-update-notifie --no-audit --no-fund

COPY . .

RUN npm run build

RUN chown -R pptruser:pptruser /app

USER pptruser

CMD ["npm", "start"]
