curl -O <URL_OF_FILE>

# Calculate the SHA-256 hash
shasum -a 256 <FILENAME>
# or on Linux
sha256sum <FILENAME>

find . -type f -exec md5sum {} > md5sums.txt \;

curl -O https://www.pngx.com.pg/data/BSP.csv
sha256sum BSP.csv > checksum.txt
sha256sum -c checksum.txt