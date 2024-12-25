FROM node:20-alpine

# Setting up the work directory
WORKDIR /usr/src/app

# RUN addgroup --system --gid 1001 nodejs
# USER nextjs

ENV PORT=5000

COPY package*.json ./

# Installing dependencies
RUN npm install

# Copying all the files in our project
COPY . .

# install dotenv
# RUN npm install dotenv

# Installing pm2 globally
# RUN npm install pm2 -g

# Starting our application
# CMD pm2 start process.yml && tail -f /dev/null

# Exposing server port
EXPOSE 5000

ENV NODE_ENV=production

# Starting our application
CMD [ "node", "--env-file=.env", "server.js" ]