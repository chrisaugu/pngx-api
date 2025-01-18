docker build -t nuku-api:latest .
docker run -p 5000:5000 nuku-api:v1
docker run -it nuku-api:latest sh


docker run -p 5000:5000 \
  -e PORT=5000 \
  -e MONGODB_URI=mongodb://localhost:27017/pngx-db \
  -e REDIS_URL=redis://red-cs8mule8ii6s73fgtg8g:6379\
  nuku-api:latest

openssl genrsa -out nuku-key.pem 2048
openssl req -new -x509 -sha256 -key nuku-key.pem -out nuku.pem -days 365