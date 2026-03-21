FROM node:22-alpine

WORKDIR /app/nuku-etl

# RUN addgroup --system --gid 1001 nodejs
# USER nodejs

# COPY package*.json ./

RUN npm install node-cron \
    lodash mongoose \
    dotenv jsonwebtoken \
    papaparse csv-parser \
    date-fns date-fns-tz \
    request needle \
    pino winston winston-elasticsearch winston-daily-rotate-file
    
COPY ./config .
COPY ./models .
COPY ./constants.js ./constants.js
COPY ./database.js ./database.js
COPY ./tasks.js ./tasks.js
COPY ./utils.js ./utils.js
COPY ./etl.js ./etl.js

ENV NODE_ENV=production

# HEALTHCHECK --interval=5s --timeout=3s --retries=3 \
#     CMD curl -f http://localhost:5000/health || exit 1

# Starting the etl process
CMD [ "node", "etl.js" ]

# Run this in cmd
# docker build -f etl.Dockerfile -t nuku-stock-producer:1.0.0 .
# docker run -d --name nuku-stock-producer:1.0.0
# docker logs
