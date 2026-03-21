# 🔗 API Reference

### Endpoints

API endpoints are prefixed with `http[s]://example.com/api`.
WebSocket endpoints are prefixed with `ws[s]://example.com/ws`. Websocket is only available from >= v2

> v1.0.0

Base URL:

```
GET /api/v1
```

> v2.0.0

Base URL:

```https
GET /api/v2
WS /ws/v2
```

### Parameters

#### How to separate params

Parameters are `ampersand(&)` separated i.e.
`?symbol=BSP&interval=5min`

#### Exchange

`symbol:exchange_name` =
`?BSP:PNGX`

#### Dates

Dates are in ISO 8601 format i.e. `YYYY-MM-DD` or `YYYY-MM-DDTHH:mm:ssZ`

#### Errors

| Error Codes | Status                | Meaning                                 |
| ----------- | --------------------- | --------------------------------------- |
| 300         | Multiple Choices      |                                         |
| 301         | Moved Permanently     |                                         |
| 400         | Bad Request           |                                         |
| 404         | Not Found             | Record requested is no longer available |
| 500         | Internal Server Error |                                         |
| 503         | Service Unavailable   |                                         |

` GET /api`

> Request

```https
curl -i -H 'Accept: application/json' https://example.com/api
```

> Params

| Parameter | Type       | Description |
| :-------- | :--------- | :---------- | -------------------------- | --- |
| <!--      | `apiKey`   | `string`    | **Required**. Your API key | --> |
| <!--      | `dateFrom` | `string`    | **Required**.              | --> |
| <!--      | `dateTo`   | `string`    | **Required**.              | --> |

### API Health

Check the health of the API

`GET /api/v2/health`

### Get all ticker symbols

Get all ticker symbols available on PNGX

`GET /api/v2/tickers`

> Request

```https
curl -i -H 'Accept: application/json' https://example.com/api/v2/tickers
```

> Response

```
    HTTP/1.1 200 OK
    Date: Sat, 02 Oct 2021 03:25:07 GMT
    Status: 200 OK
    Connection: close
    Content-Type: application/json
    Content-Length: 85

    {"symbols":["BSP","CCP","CGA","COY","CPL","KAM","KSL","NCM","NGP","NIU","OSH","SST"]}
```

### Get ticker data

Get ticker data for a specific ticker symbol

`GET /api/v2/tickers/:symbol`

> Params

| Parameter | Type     | Description                              |
| --------- | -------- | ---------------------------------------- |
| `symbol`  | `string` | **Required**. Ticker symbol of the stock |

> Request

```sh
curl -i -H 'Accept: application/json' https://example.com/api/v2/tickers/BSP
```

> Response

```
    HTTP/1.1 200 OK
    Date: Sat, 02 Oct 2021 03:25:07 GMT
    Status: 200 OK
    Connection: close
    Content-Type: application/json
    Content-Length: 85

    {"symbols":["BSP","CCP","CGA","COY","CPL","KAM","KSL","NCM","NGP","NIU","OSH","S
    ST"]}
```

### Get latest stocks data

Update an existing pet by Id

`GET /api/v2/stocks`

> Request

```sh
curl -i -H 'Accept: application/json' https://example.com/api/v2/stocks
```

> Params

| Parameter  | Type     | Description                               |
| :--------- | :------- | :---------------------------------------- | -------------------------- |
| <!--       | `apiKey` | `string`                                  | **Required**. Your API key |
| `seasonId` | `string` | **Required**.League Id e.g Premier League |
| `dateFrom` | `string` | **Required**.                             |
| `dateTo`   | `string` | **Required**.                             | -->                        |

> Response

```
    HTTP/1.1 200 OK
    Date: Sat, 02 Oct 2021 03:25:07 GMT
    Status: 200 OK
    Connection: close
    Content-Type: application/json
    Content-Length: 85

    {"symbols":["BSP","CCP","CGA","COY","CPL","KAM","KSL","NCM","NGP","NIU","OSH","S
    ST"]}
```

### Get a historical stock data

Get historical stock data for a specific ticker symbol

`GET /api/v2/historicals/:symbol`

> Request

`curl -i -H 'Accept: application/json' https://example.com/api/v2/historicals/BSP`

> Params

| Name   | Location | Type   | Required | Description                          |
| ------ | -------- | ------ | -------- | ------------------------------------ |
| symbol | param    | string | yes      | ticker symbol of the preferred stock |

> Query Params

| Name  | Location | Type    | Required | Description |
| ----- | -------- | ------- | -------- | ----------- |
| date  | query    | date    | no       | none        |
| start | query    | date    | no       | none        |
| end   | query    | date    | no       | none        |
| field | query    | array   | no       | none        |
| start | body     | integer | no       | none        |

> Response

```
    HTTP/1.1 200 OK
    Date: Sat, 02 Oct 2021 03:25:07 GMT
    Status: 200 OK
    Connection: close
    Content-Type: application/json
    Content-Length: 85

    {"symbol": "BSP", "historical": [{}]}
```

### Get a non-existent historical stock data

`GET /api/v2/historicals/:symbol`

> Request
> Request a non-existent symbol

```sh
curl -i -H 'Accept: application/json' https://example.com/api/v2/historicals/HIL
```

> Response

```
    HTTP/1.1 200 OK
    Date: Sat, 02 Oct 2021 03:25:07[^1] GMT
    Status: 200 OK
    Connection: close
    Content-Type: application/json
    Content-Length: 85

    {"status":404,"reason":"Not found"}
```

### Get news

Get news

`GET /api/v2/news`

> Request

```bash
curl -i -H 'Accept: application/json' https://example.com/api/v2/news
```

> Response

```
    HTTP/1.1 200 OK
    Date: Sat, 02 Oct 2021 03:25:07[^1] GMT
    Status: 200 OK
    Connection: close
    Content-Type: application/json
    Content-Length: 85

    [{}]
```

### Market Status

Get the current market status for local exchanges (whether exchanges are open or close).
`GET /api/v2/market/status`

> Request

```sh
curl -i -H 'Accept: application/json' https://example.com/api/v2/market/status
```

> Response

```json
{
  "marketStatus": "open",
  "session": "pre-market",
  "timezone": "Pacific/Port_Moresby",
  "t": 1735680000000,
  "source": "PNGX",
  "lastUpdated": "2023-10-01T00:00:00Z",
  "exchange": "PG",
  "holiday": null,
  "isOpen": false
}
```

### Real-time Events

#### Watchlist

#### Tickers

`/events?topics=tickers:BSP`

> Request:

```json
{
  "event": "topic",
  "data": "message"
}
```

> Request:

```json
{
  "Authorization": "abc",
  "X-Access-Token": "abc",
  "X-Channel": "events",
  "X-Topics": "tickers:*",
  "X-API-Version": "v1"
}
```

## How to integrate with third-parties

### Webhook

You can create webhooks to subscribe to specific events that occur on NUKU-API.

#### Register Webhook

Register your callback function via the API to be notified of stock market events.

To register a webhook, send a `POST` request to [Register Webhook Callback](https://api.nuku-api.com.pg/api/v2/webhook) with a JSON body containing your webhook URL, the event type you want to be notified about, and an optional workflow `ID`.

For example:

```json
{
  "eventTypes": [""],
  "endpointUrl": "<https://www.example.com/api/callback>"
}
```

```sh
curl --request POST \
     --url https://api.nuku-api.com.pg/api/webhook \
     --header 'accept: application/json' \
     --header 'content-type: application/json' \
     --data '
        {
            "endpointUrl": "<https://your_website.com/webhook>",
            "eventTypes": ["workflowRun.completed"]
        }
    '
```

You will receive a response with the details of your registered webhook:

```json
{
  "status": "success",
  "data": {
    "id": "<id of webhook>",
    "endpointUrl": "<https://mywebsite.com/webhook>",
    "eventTypes": ["workflowRun.completed"]
  }
}
```

#### View Webhook

You can view the details of a webhook endpoint via the API.

```sh
curl --request GET \
     --url https://api.nuku-api.com.pg/api/webhook/webhook_id \
     --header 'accept: application/json'
```

To view a webhook, send a `GET` request to `https://api.nuku-api.com.pg/api/webhook/<webhook_id>`.

You will receive a response with the details of the webhook.

```json
{
  "status": "success",
  "data": {
    "id": "<webhook_id>",
    "url": "<https://mywebsite.com/webhook>",
    "eventType": "workflowRun.completed"
  }
}
```

#### Get All Webhooks

```sh
curl --request GET \
     --url 'https://api.nuku-api.com.pg/api/webhook?size=10&page=0' \
     --header 'accept: application/json'
```

To view all webhooks registered for your workspace, send a `GET` request to `https://api.nuku-api.com.pg/api/webhook`.

You will receive a response with the details for all webhooks.

```json
{
  "total": 2,
  "data": [
    {
      "id": "<webhook_id>",
      "url": "<https://mywebsite.com/webhook>",
      "eventType": "workflowRun.completed",
      "workflowId": "<workflow_id>"
    },
    {
      "id": "<webhook_id>",
      "url": "<https://mywebsite.com/webhook>",
      "eventType": "workflowRun.started",
      "workflowId": null
    },
    {
      "_id": "680c958aa4fd958428e03da6",
      "url": "http://localhost:5000/api/webhook",
      "headers": {
        "x-cs-signature": "abc",
        "x-cs-timestamp": 1745712000000,
        "x-webhook-token": "abc"
      },
      "events": ["subscribe"],
      "secret": "secr3t",
      "isActive": true,
      "description": "hello",
      "createdAt": "2025-04-26T08:12:58.977Z"
    }
  ]
}
```

#### Remove Webhook

You can remove a webhook endpoint via the API.
To remove a webhook, send a DELETE request to https://api.nuku-api.com.pg/api/webhook/<webhook_id>.

```sh
curl --request DELETE \
     --url https://api.nuku-api.com.pg/api/webhook/webhook_id \
     --header 'accept: application/json'
```

You will receive a response indicating the success of the operation.

```json
{
  "status": "success",
  "success": true,
  "message": "Webhook removed successfully"
}
```
