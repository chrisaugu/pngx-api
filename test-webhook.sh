#!/bin/bash

# # Define the payload
# payload='{"event":"user.created","data":{"id":"1","full_name":"Faizan","email":"faizan.ahmad.info@gmail.com","contact":"+923338184261"}}'

# # Generate the current Unix timestamp
# timestamp=$(date +%s)

# # Define the webhook shared token
# webhook_token='your_shared_webhook_token'

# # Define the shared secret
# shared_secret='your_shared_secret'

# # Generate the HMAC SHA-256 signature in hexadecimal format
# signature=$(echo -n "$payload$timestamp" | openssl dgst -sha256 -hmac "$shared_secret" | sed 's/^.* //')
# # signature=$(printf '%s' "$payload$timestamp" | openssl dgst -sha256 -hmac "$shared_secret" | awk '{print $2}')

# # Print the generated signature
# echo "Payload: $payload"
# echo "Webhook Token: $webhook_token"
# echo "Shared Secret: $shared_secret"
# echo "Generated timestamp: $timestamp"
# echo "Generated signature: $signature"

# # Send the payload with the signature and timestamp to the webhook
# curl -X POST \
#   -H "Content-Type: application/json" \
#   -H "x-signature: $signature" \
#   -H "x-webhook-token: $webhook_token" \
#   -H "x-timestamp: $timestamp" \
#   -d "$payload" \
#   "http://localhost:5000/api/webhook"

# curl -X POST -H "Content-Type: application/json" -d '{"title":"The Catcher in the Rye","author":"J.D. Salinger","publishedYear":1951,"isAvailable":true,"genres":["Fiction","Coming-of-age"]}' http://localhost:5000/api/books

# # Register webhook
# curl -X POST \
#     -H "Content-Type: application/json" \
#     -H "x-signature: $signature" \
#     -H "x-webhook-token: $webhook_token" \
#     -H "x-timestamp: $timestamp" \
#     -d "$payload" \
#     "http://localhost:5000/api/webhooks"
# curl --location 'http://localhost:5000/api/webhooks' \
curl --request POST \
     --url http://localhost:5000/api/webhooks \
     --header 'accept: application/json' \
     --header 'content-type: application/json' \
     --header 'x-signature: abc' \
     --header 'x-timestamp: 1745712000000' \
     --header 'x-webhook-token: abc' \
     --header 'accept: application/json' \
     --header 'Content-Type: application/json' \
     --data '{
        "url": "http://localhost:5000/api/webhook",
        "headers": {
            "x-signature": "abc",
            "x-timestamp": 1745712000000,
            "x-webhook-token": "abc"
        },
        "events": ["subscribe"],
        "secret": "24ac669fcafa869f6d6761c2b98d75b6c3f220c298b7f2f8b94646cffe145338",
        "isActive": true,
        "description": "hello"
    }'

# View Webhook
curl -X GET \
     -H "Accept: application/json" \
     -H "Content-Type: application/json" \
     "http://localhost:5000/api/webhooks"

# Update Webhook
curl -X PUT \
     -H "Accept: application/json" \
     -H "Content-Type: application/json" \
     -H 'x-signature: abc' \
     -H 'x-timestamp: 1745712000000' \
     -H 'x-webhook-token: abc' \
     -d '{
        "url": "http://localhost:5000/api/webhook",
        "headers": {
            "x-signature": "abc",
            "x-timestamp": 1745712000000,
            "x-webhook-token": "abc"
        },
        "events": ["subscribe"],
        "secret": "24ac669fcafa869f6d6761c2b98d75b6c3f220c298b7f2f8b94646cffe145338",
        "isActive": true,
        "description": "hello"
    }'
    "http://localhost:5000/api/webhooks/{webhook-id}"


# Delete Webhook
curl -X DELETE \
     -H "Accept: application/json" \
     -H "Content-Type: application/json" \
     "http://localhost:5000/api/webhooks/{webhook-id}"
