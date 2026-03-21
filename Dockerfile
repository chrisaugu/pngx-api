FROM node:22-alpine

WORKDIR /app/nuku-api
# WORKDIR /usr/src/nuku-api

RUN apk add --no-cache tzdata

# RUN addgroup --system --gid 1001 nodejs
# USER nodejs

COPY package*.json ./

RUN npm install

COPY . .

RUN npm install pm2 -g

ENV NODE_ENV=production
ENV PORT=5000
ENV TZ=Pacific/Port_Moresby
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

EXPOSE $PORT

# HEALTHCHECK --interval=5s --timeout=3s --retries=3 \
#     CMD curl -f http://localhost:5000/api/health || exit 1

# CMD pm2 start process.yml && tail -f /dev/null
# CMD [ "node", "server.js" ]
CMD ["pm2-runtime", "server.js"]
# ENTRYPOINT ["/bin/sh", "-c" , "date"]