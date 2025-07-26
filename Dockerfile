FROM node:22-alpine

# Setting up the work directory
WORKDIR /app/nuku-api

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
ENV MONGODB_URI=mongodb+srv://admin:admin@sweetlipsdb.7pn8s.mongodb.net/pngx-db
ENV REDIS_URL=rediss://red-cs8mule8ii6s73fgtg8g:TQH1y6fDxY9TQpf8VEbGKr5FDQQ8k5af@oregon-redis.render.com:6379
ENV REDIS_BACKEND_URL=rediss://red-cs8mule8ii6s73fgtg8g:TQH1y6fDxY9TQpf8VEbGKr5FDQQ8k5af@oregon-redis.render.com:6379
ENV UPSTASH_REDIS_URL="rediss://**********@unified-doe-29314.upstash.io:6379"
ENV UPSTASH_REDIS_REST_URL="https://unified-doe-29314.upstash.io"
ENV UPSTASH_REDIS_REST_TOKEN="**********"
ENV WEBHOOK_TOKEN=abc
ENV MAX_TIME_DIFFERENCE=60
ENV API_SECRET="secr3t"
ENV LOG_LEVEL=debug 
ENV LOG_FORMAT=combined
ENV LOG_FILE=./logs/app.log
ENV LOG_DIR=./logs

# Exposing server port
EXPOSE $PORT

# HEALTHCHECK --interval=5s --timeout=3s --retries=3 \
#     CMD curl -f http://localhost:5000/health || exit 1

# Starting our application
CMD [ "node", "server.js" ]
# CMD ["pm2-runtime", "server.js"]