FROM node:20-alpine

ENV NODE_ENV=production

# Setting up the work directory
WORKDIR /usr/src/nuku-etl

COPY package*.json ./

# RUN npm install -g npm@11.0.0

# Installing dependencies
RUN npm install

# Copying all the files in our project
COPY . .

# Starting our application
CMD [ "node", "etl.js" ]