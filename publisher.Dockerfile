FROM node:22-alpine

ENV NODE_ENV=production

# Setting up the work directory
WORKDIR /usr/src/nuku-api

# COPY package*.json ./

# RUN npm install -g npm@11.0.0

# Installing dependencies
# RUN npm install

# Copying all the files in our project
# COPY . .

# Starting our application
CMD [ "node", "routes/stockPublisher.js" ]