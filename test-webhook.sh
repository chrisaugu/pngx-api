#!/bin/bash

# Define the payload
payload='{"event":"user.created","data":{"id":"1","full_name":"Faizan","email":"faizan.ahmad.info@gmail.com","contact":"+923338184261"}}'

# Generate the current Unix timestamp
timestamp=$(date +%s)

# Define the webhook shared token
webhook_token='your_shared_webhook_token'

# Define the shared secret
shared_secret='your_shared_secret'

# Generate the HMAC SHA-256 signature in hexadecimal format
signature=$(echo -n "$payload$timestamp" | openssl dgst -sha256 -hmac "$shared_secret" | sed 's/^.* //')

# Print the generated signature
echo "Payload: $payload"
echo "Webhook Token: $webhook_token"
echo "Shared Secret: $shared_secret"
echo "Generated timestamp: $timestamp"
echo "Generated signature: $signature"

# Send the payload with the signature and timestamp to the webhook
curl -X POST -H "Content-Type: application/json" -H "x-signature: $signature" -H "x-webhook-token: $webhook_token" -H "x-timestamp: $timestamp" -d "$payload" "http://localhost:3000/webhook"


curl -X POST -H "Content-Type: application/json" -d '{"title":"The Catcher in the Rye","author":"J.D. Salinger","publishedYear":1951,"isAvailable":true,"genres":["Fiction","Coming-of-age"]}' http://example.com/api/books