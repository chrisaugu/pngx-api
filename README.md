[![NUKU-API Logo](https://raw.githubusercontent.com/chrisaugu/pngx-api/master/images/banner.png)](/) 

# NUKU-API (formerly PNGX-API)

NUKU-API (formerly PNGX-API) is a RESTFul API that retrieves, stores and processes stock data directly from PNGX. It was formerly part of [CrisBot](https://github.com/crisbotio), now a standalone API.

## For complete documentation visit [https://chrisaugu.github.io/pngx-api/](https://chrisaugu.github.io/pngx-api/).

![GitHub last commit](https://img.shields.io/github/last-commit/chrisaugu/pngx-api)
![GitHub repo size](https://img.shields.io/github/repo-size/chrisaugu/pngx-api)
![GitHub forks](https://img.shields.io/github/forks/chrisaugu/pngx-api?style=social)
![Github Repo stars](https://img.shields.io/github/stars/chrisaugu/pngx-api?style=social)
![GitHub watchers](https://img.shields.io/github/watchers/chrisaugu/pngx-api?style=social)
![GitHub contributors](https://img.shields.io/github/contributors/chrisaugu/pngx-api)
![](https://img.shields.io/badge/logo-javascript-blue?logo=javascript)
[![Build Status](https://travis-ci.org/chrisaugu/pngx-api.png)](https://travis-ci.org/chrisaugu/pngx-api)
[![Docker Image CI](https://github.com/chrisaugu/pngx-api/actions/workflows/docker-image.yml/badge.svg)](https://github.com/chrisaugu/pngx-api/actions/workflows/docker-image.yml)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)



## 📋 Table of Contents
- [Description](#description)
- [API Reference](#api-reference)
- [Tech](#tech)
- [Dependencies](##dependencies)
- [Contributing](#contributing)
- [Author Info](author-info)
- [License](#license)
- [Copyright](#copyright)

---

## 📜 Description
The API retrieve, store, and process stock data directly from [PNGX](http://www.pngx.com.pg).

### Companies listed on PNGX

| Symbol | Company |
| :----- | :------ |
| BSP | BSP Financial Group Limited |
| CCP | Credit Corporation (PNG) Ltd |
| CGA | PNG Air Limited |
| CPL | CPL Group |
| KAM | Kina Asset Management Limited |
| KSL | Kina Securities Limited |
| NEM | Newmont Corporation |
| NGP | NGIP Agmark Limited |
| NIU | Niuminco Group Limited |
| SST | Steamships Trading Company Limited |
| STO | Santos Limited |

## Roadmap
We continuously make NUKU-API the only place where all users can obtain the necessary financial data. If you have any questions or ideas about improvement, [contribute](#-contributing).

## 🔗 API Reference
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

| Error Codes | Status | Meaning |
|--|--|--|
| 300 | Multiple Choices |  |
| 301 | Moved Permanently |  |
| 400 | Bad Request |  |
| 404 | Not Found | Record requested is no longer available |
| 500 | Internal Server Error |  |

Update an existing pet by Id

` GET /api`

> Request

```https
curl -i -H 'Accept: application/json' https://example.com/api
```

> Params

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
<!-- | `apiKey` | `string` | **Required**. Your API key | -->
<!-- | `dateFrom` | `string` | **Required**.| -->
<!-- | `dateTo` | `string` | **Required**.| -->

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

| Parameter | Type     | Description                |
| --------- | -------- | -------------------------- |
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

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
<!-- | `apiKey` | `string` | **Required**. Your API key |
| `seasonId` | `string` | **Required**.League Id e.g Premier League|
| `dateFrom` | `string` | **Required**.|
| `dateTo` | `string` | **Required**.| -->

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

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|symbol|param|string| yes |ticker symbol of the prefered stock|

> Query Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|date|query|date| no |none|
|start|query|date| no |none|
|end|query|date| no |none|
|field|query|array| no |none|
|start|body|integer| no |none|

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
Register your callback function via the API to be notified the stock market events.

To register a webhook, send a `POST` request to [Register Webhook Callback](https://api.nuku-api.com.pg/api/v2/webhook) with a JSON body containing your webhook URL, the event type you want to be notified about, and an optional workflow `ID`.

For example:
```json
{
    "eventTypes": [""],
    "endpointUrl": "<https://www.example.com/api/callback>",
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
    "data":
    [
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
            "events": [
                "subscribe"
            ],
            "secret": "secr3t",
            "isActive": true,
            "description": "hello",
            "createdAt": "2025-04-26T08:12:58.977Z"
        },
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

You will receive a response with the details for all webhooks.
```json
{
    "success": true
}
```

## 🛠️ Tech & Tools

The entire application is written in JavaScript and runs on NodeJS environment.

### Dependencies
**Nuku** uses a number of open source projects to work properly:

- [Moment.js] - Moment.js to manipulate date
- [Date-fn] - to manipulate date
- [MongoDB] - MongoDB to store stock info
- [node-cron] - Node-cron to to schedule the tasks
- [markdown-it] - Markdown parser done right. Fast and easy to extend.
- [Twitter Bootstrap] - great UI boilerplate for modern web apps
- [Node.js] - evented I/O for the backend
- [Express] - fast node.js network app framework [@tjholowaychuk]
- [Gulp] - the streaming build system
- [Breakdance](https://breakdance.github.io/breakdance/) - HTML to Markdown converter
* CORS
* Mongoose
* NodeCron
* Path
* Request
* FS

And of course NUKU-API itself is open source with a [public repository](https://github.com/chrisaugu/pngx-api)
 on GitHub.

## 👩‍💻 Contributing

Want to contribute? Great!

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

Make sure you read [Contributing Guide](CONTRIBUTING.md) before making your contributions.
- [Code of Conduct](CODE_OF_CONDUCT.md)
- [Contributing Guidelines](CONTRIBUTING.md)
- [Commit Message Convention](COMMIT_MESSAGE_CONVENTION.md)

[List of all contributors](https://github.com/chrisaugu/pngx-api/graphs/contributors)

### 🧑‍💻Develop
Let's start development!

#### Logging
```sh
LOG_DESTINATION = ./logs.txt
LOG_LEVEL = 'error'
```

TOAST UI products are open source, so you can create a pull request(PR) after you fix issues.
Run npm scripts and develop yourself with the following process.

#### Setup
1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

#### Pull Request
Before PR, check to test lastly and then check any errors.
If it has no error, commit and then push it!

#### 🔧 Pull Request Steps
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Fork `master` branch into your personal repository.
``` sh
git clone https://github.com/{your-personal-repo}/[[repo name]].git
cd [[repo name]]
npm install
```
Clone it to local computer. Install node modules.
Before starting development, you should check to have any errors.

### Running tests
Please make sure to update tests as appropriate.

To run the tests for \_schedule\_, run \`npm install\` to install dependencies and then:
```sh
npm run test
```

For more information on PR's step, please see links of [Contributing](#contributing) section.

## 🐛 Bug tracker

Have a bug or a feature request? [Please open a new issue](https://github.com/chrisaugu/pngx-api/issues).

## 🧑 Author Info

The original author of NUKU-API is [Christian Augustyn](https://github.com/chrisaugu)
- Linkedin - [LinkedIn: Christian Augustyn](https://www.linkedin.com/in/christianaugustyn/)
- Website - [Christian Augustyn](https://www.christianaugustyn.me)

## 🧾 Changelog
Wonder how NUKU-API has been changing for years [CHANGELOG](./CHANGELOG.md)

## 📜 License
This software is licensed under the [MIT License](./LICENSE) © [Christian Augustyn](https://github.com/chrisaugu).

**Free Software, Hell Yeah!**

## © Copyright

&copy; 2023, Christian Augustyn.



[//]: # (These are reference links used in the body of this note and get stripped out when the markdown processor does its job. There is no need to format nicely because it shouldn't be seen. Thanks SO - http://stackoverflow.com/questions/4823468/store-comments-in-markdown-syntax)

   [pngx-api]: <https://github.com/chrisaugu/pngx-api>
   [MongoDB]: <https://www.mongodb.com>
   [git-repo-url]: <https://github.com/chrisaugu/pngx-api.git>
   [john gruber]: <http://daringfireball.net>
   [df1]: <http://daringfireball.net/projects/markdown/>
   [markdown-it]: <https://github.com/markdown-it/markdown-it>
   [Ace Editor]: <http://ace.ajax.org>
   [node.js]: <http://nodejs.org>
   [Twitter Bootstrap]: <http://twitter.github.com/bootstrap/>
   [jQuery]: <http://jquery.com>
   [@tjholowaychuk]: <http://twitter.com/tjholowaychuk>
   [express]: <http://expressjs.com>
   [AngularJS]: <http://angularjs.org>
   [Gulp]: <http://gulpjs.com>
