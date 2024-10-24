FROM node:20-alpine as base

WORKDIR /app

ENV PORT=4000

# daemon for cron jobs
# RUN echo 'crond' > /boot.sh
# RUN echo 'crontab .openode.cron' >> /boot.sh

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json .

# Bundle app source
COPY . .

FROM base as production
ENV NODE_ENV=production
RUN npm install
EXPOSE 4000
# CMD ["node", "server.js"]
# CMD ["node", "worker.js"]
RUN node server.js && node worker.js