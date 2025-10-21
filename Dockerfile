FROM node:22-alpine

# Setting up the work directory
WORKDIR /app/nuku-api
# WORKDIR /usr/src/nuku-api

# 
RUN apk add --no-cache tzdata

# RUN addgroup --system --gid 1001 nodejs
# USER nodejs

COPY package*.json ./

# Installing dependencies
RUN npm install

# Copying all the files in our project
COPY . .

# Installing pm2 globally
RUN npm install pm2 -g

# Define environment variables (default values if not provided at runtime)
ENV NODE_ENV=production
ENV PORT=5000
ENV TZ=Pacific/Port_Moresby
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# Exposing server port
EXPOSE $PORT

# HEALTHCHECK --interval=5s --timeout=3s --retries=3 \
#     CMD curl -f http://localhost:5000/api/health || exit 1

# Starting our application
# CMD pm2 start process.yml && tail -f /dev/null
# CMD [ "node", "server.js" ]
CMD ["pm2-runtime", "server.js"]
# testing timezone
# ENTRYPOINT ["/bin/sh", "-c" , "date"]