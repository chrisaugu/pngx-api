FROM node:20-alpine

ENV PORT=5000
ENV NODE_ENV=production

# Setting up the work directory
WORKDIR /usr/src/nuku-api

# RUN addgroup --system --gid 1001 nodejs
# USER nextjs

COPY package*.json ./

# RUN npm install -g npm@11.0.0

# Installing dependencies
RUN npm install

# Copying all the files in our project
COPY . .

# Installing pm2 globally
RUN npm install pm2 -g

# Starting our application
# CMD pm2 start process.yml && tail -f /dev/null

# Exposing server port
EXPOSE 5000

# Starting our application
# CMD [ "node", "server.js" ]
CMD ["pm2-runtime", "server.js"]