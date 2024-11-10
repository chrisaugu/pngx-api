FROM node:20-alpine

WORKDIR /usr/src/app

ENV PORT=5000

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 5000

ENV NODE_ENV=production

CMD ["node", "server.js"]