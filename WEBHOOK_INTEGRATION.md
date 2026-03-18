# Webhook Integration Guide

This document shows how a third-party service can integrate with this simple webhook service.

## Overview

There are two parts to a typical integration:

1. Register a webhook URL that should receive events.
2. Implement a receiver endpoint in the third-party service to accept POST requests with `{ event, data }`.

## Prerequisites

- The server is running locally (default base URL): `http://localhost:3000`
- MongoDB is running (used to store webhook registrations).

## Register A Webhook

You can register via the HTML form at `/webhooks` or directly through the API.

### Option A: POST `/webhooks`

This creates a full webhook record in MongoDB.

```bash
curl -i "http://localhost:3000/webhooks" \
  -H 'Content-Type: application/json' \
  -d '{
    "url":"https://third-party.example.com/webhook",
    "headers":{"Authorization": "Bearer YOUR-ACCESS-TOKEN","X-Test":"true"},
    "events":["user.created","order.paid"],
    "secret":"secret",
    "description":"third-party integration"
  }'
```

### Option B: POST `/register-webhook`

This is a simplified registration that only needs `url` and `events`.

```bash
curl -i "http://localhost:3000/register-webhook" \
  -H 'Content-Type: application/json' \
  -d '{
    "url":"https://third-party.example.com/webhook",
    "events":["user.created","order.paid"]
  }'
```

## Receive Webhook Events

When an event is triggered, the server sends a POST request to each subscribed webhook URL with JSON like:

```json
{
  "event": "user.created",
  "data": {
    "id": "123",
    "email": "test@example.com"
  }
}
```

```json
// Client sets up webhook for their account
POST /api/client/webhooks
{
  "url": "https://client-app.com/webhook",
  "events": ["order.created", "order.updated"],
  "scope": {
    "type": "client",  // All events for this client
    "id": "client_123"
  },
  "secret": "generated-secret"
}

// Client sets up webhook for specific store
POST /api/client/webhooks
{
  "url": "https://store-456.client-app.com/webhook",
  "events": ["product.updated", "inventory.changed"],
  "scope": {
    "type": "store",
    "id": "store_456"  // Only events for this specific store
  },
  "secret": "store-specific-secret"
}
```

```json
// Client-wide event (e.g., account settings changed)
POST /internal/webhook-trigger/client.account.updated
{
  "clientId": "client_123",
  "data": {
    "settings": { "theme": "dark" }
  }
}

// Store-specific event (e.g., new product in specific store)
POST /internal/webhook-trigger/store.product.created
{
  "clientId": "client_123",
  "storeId": "store_456",
  "data": {
    "product": {
      "id": "prod_789",
      "name": "New Product",
      "price": 29.99
    }
  }
}

// User-specific event (e.g., user role changed)
POST /internal/webhook-trigger/user.role.updated
{
  "clientId": "client_123",
  "userId": "user_789",
  "data": {
    "oldRole": "member",
    "newRole": "admin"
  }
}
```

### Example Receiver (Express)

```js
import express from "express";

const app = express();
app.use(express.json());

app.post("/webhook", (req, res) => {
  const { event, data } = req.body;

  // verify the signature (authenticity) of the webhook
  // const signature = req.headers['x-signature'];

  console.log("Received webhook:", event, data);
  res.status(200).send("ok");
});

app.listen(3001, () => {
  console.log("Receiver listening on http://localhost:3001");
});
```

## Trigger Events From This Service

### Option A: POST `/generate-event`

This endpoint looks up all webhooks that subscribed to the event and POSTs to them.

```bash
curl -i "http://localhost:3000/generate-event" \
  -H 'Content-Type: application/json' \
  -d '{
    "event":"payment.cancelled",
    "data":{"id":"123","email":"test@example.com"}
  }'
```

### Option B: POST `/trigger-webhook`

This endpoint triggers all webhooks that subscribed to the event. The request shape uses `payload`.

```bash
curl -i "http://localhost:3000/trigger-webhook" \
  -H 'Content-Type: application/json' \
  -d '{
    "event":"user.created",
    "payload":{"id":"123","email":"test@example.com"}
  }'
```

## Webhook Authentication (Incoming To This Service)

If a third-party needs to send webhooks into this service (endpoint: `POST /webhook`), the request must include:

- `x-webhook-token`
- `x-signature`
- `x-timestamp`

The signature is an `HMAC SHA-256` of: `JSON.stringify(payload) + timestamp`, signed with the shared secret.

A working example is in `webhook.sh`.

## Notes

- The `/generate-event` endpoint sends signature headers (`x-webhook-signature`, `X-Signature`) with each outgoing request.
- The `headers` field is stored with the webhook, but the current server code does not automatically apply it to outgoing requests.

### Stock Market Events:

| Event Name                | Description                                        |
| ------------------------- | -------------------------------------------------- |
| stock.price_threshold_hit | A stock crosses a user-defined price (up or down). |
| stock.price_updated       | Regular stock price updates (throttled).           |
| stock.volume_spike        | Volume anomaly detected (e.g., 3× 30-day average). |
| stock.news_published      | News or announcement related to a stock.           |
| stock.earnings_report     | Company publishes an earnings report.              |
| stock.dividend_declared   | Company declares a dividend.                       |
| stock.dividend_paid       | Dividend has been paid out.                        |
| stock.split_announced     | Company announces a stock split.                   |
| stock.split_executed      | Stock split takes effect.                          |
| stock.delisted            | Stock has been delisted from an exchange.          |
| ticker.created            | Ticker has been created                            |
| ticker.updated            | Ticker has been updated                            |
| ticker.removed            | Ticker has been removed                            |
