FROM node:20-alpine as base

WORKDIR /usr/src/app

ENV PORT=4000
ENV NODE_ENV=production

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 4000

CMD ["node", "server.js"]
# CMD ["node", "worker.js"]
# RUN node server.js