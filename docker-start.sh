docker build --file Dockerfile --tag nuku-api:1 .
docker run -p 5000:5000 --env-file .env nuku-api:1