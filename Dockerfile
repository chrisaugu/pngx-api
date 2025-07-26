FROM node:20-alpine

WORKDIR /usr/src/nuku-api

# FROM node:22-alpine

# Setting up the work directory
# WORKDIR /app/nuku-api

# RUN addgroup --system --gid 1001 nodejs
# USER nodejs

COPY package*.json ./

# Installing dependencies
RUN npm install

# Copying all the files in our project
COPY . .

# Installing pm2 globally
# RUN npm install pm2 -g

# Starting our application
# CMD pm2 start process.yml && tail -f /dev/null

# Define environment variables (default values if not provided at runtime)
ENV NODE_ENV=production
ENV PORT=5000

# Exposing server port
EXPOSE $PORT

# HEALTHCHECK --interval=5s --timeout=3s --retries=3 \
#     CMD curl -f http://localhost:5000/health || exit 1

# Starting our application
CMD [ "node", "server.js" ]
# CMD ["pm2-runtime", "server.js"]