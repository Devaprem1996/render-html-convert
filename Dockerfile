FROM ghcr.io/puppeteer/puppeteer:latest
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install --omit=dev
COPY server.js .
EXPOSE 3006
CMD ["node", "server.js"]
