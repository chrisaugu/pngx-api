[![PNGX-API Logo](https://raw.githubusercontent.com/chrisaugu/pngx-api/master/images/banner.png)](/) 

# PNGX-API

_The First Unofficial PNGX-API, Ever_

NUKU (aka PNGX) is a RESTFul API that retrieves, store and process stock data from PNGX. It formerly part of [CrisBot](https://github.com/crisbotio), now a standalone API.

![GitHub last commit](https://img.shields.io/github/last-commit/chrisaugu/pngx-api)
![GitHub repo size](https://img.shields.io/github/repo-size/chrisaugu/pngx-api)
![GitHub forks](https://img.shields.io/github/forks/chrisaugu/pngx-api?style=social)
![Github Repo stars](https://img.shields.io/github/stars/chrisaugu/pngx-api?style=social)
![GitHub watchers](https://img.shields.io/github/watchers/chrisaugu/pngx-api?style=social)
![GitHub contributors](https://img.shields.io/github/contributors/chrisaugu/pngx-api)
![](https://img.shields.io/badge/logo-javascript-blue?logo=javascript)
[![Build Status](https://travis-ci.org/chrisaugu/pngx-api.png)](https://travis-ci.org/chrisaugu/pngx-api)


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
The API retrieve, store, and process financial data from from [PNGX.com.pg](http://www.pngx.com.pg).

Companies listed on PNGX

| Symbol | Company |
| :----- | :------ |
| BSP | BSP Financial Group Limited |
| CCP | Credit Corporation (PNG) Ltd |
| CGA | PNG Air Limited |
| COY | Coppermoly Limited |
| CPL | CPL Group |
| KAM | Kina Asset Management Limited |
| KSL | Kina Securities Limited |
| NEM | Newmont Corporation |
| NGP | NGIP Agmark Limited |
| NIU | Niuminco Group Limited |
| SST | Steamships Trading Company Limited |
| STO | Santos Limited |

## ✨Features
- Historical data
- Current listed stock info
- Near-realtime updates
- RESTful API format


## 📱 Screenshots
<p align="left">
<!-- <img src="/images/upcomingmatches.png" width="30%"/> 
<img src="/images/pastscores.png" width="30%"/> 
<img src="/images/leaguetable.png" width="30%"/>
<img src="/images/topscorers.png" width="30%"/>-->
</p>
---

## 🔗 API Reference

> v2.0.0

Base URLs:
```https
GET http[s]://pngx-api.christianaugustyn.me
```

### Get ticker symbols
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
<!-- | `seasonId` | `string` | **Required**.League Id e.g Premier League| -->
<!-- | `dateFrom` | `string` | **Required**.| -->
<!-- | `dateTo` | `string` | **Required**.| -->

> Response
```
    HTTP/1.1 200 OK
    Date: Sat, 02 Oct 2021 03:25:07 GMT
    Status: 200 OK
    Connection: close
    X-Powered-By: Express
    Content-Type: application/json
    Content-Length: 85

    {"symbols":["BSP","CCP","CGA","COY","CPL","KAM","KSL","NCM","NGP","NIU","OSH","S
    ST"]}
```


### Get latest stocks data
Update an existing pet by Id

`GET /api/v1/stocks`

> Request

```https
    curl -i -H 'Accept: application/json' https://example.com/api/v1/stocks
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
    X-Powered-By: Express
    Content-Type: application/json
    Content-Length: 85

    {"symbols":["BSP","CCP","CGA","COY","CPL","KAM","KSL","NCM","NGP","NIU","OSH","S
    ST"]}
```


### Get a historical stock data
Update an existing pet by Id

`GET /api/v1/historicals/:symbol`

> Request

    curl -i -H 'Accept: application/json' https://example.com/api/v1/historicals/BSP

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
    X-Powered-By: Express
    Content-Type: application/json
    Content-Length: 85
    
    {"symbol": "BSP", "historical": [{}]}
```

### Get a non-existent Quote
Update an existing pet by Id

`GET /api/v1/historicals/:symbol`

> Request

    curl -i -H 'Accept: application/json' https://example.com/api/v1/historicals/HIL

> Response

```
    HTTP/1.1 200 OK
    Date: Sat, 02 Oct 2021 03:25:07[^1] GMT
    Status: 200 OK
    Connection: close
    X-Powered-By: Express
    Content-Type: application/json
    Content-Length: 85

    {"status":404,"reason":"Not found"}
```



## 🛠️ Tech & Tools

The entire application is written in JavaScript and run on NodeJS environment.

### Dependencies
**Nuku** uses a number of open source projects to work properly:

- [Moment.js] - Moment.js to manipulate date
- [Date-fn] - to manipulate date
- [MongoDB] - MongoDB to store stock info
- [node-cron] - Node-cron to to schedule the tasks
- [markdown-it] - Markdown parser done right. Fast and easy to extend.
- [Twitter Bootstrap] - great UI boilerplate for modern web apps
- [node.js] - evented I/O for the backend
- [Express] - fast node.js network app framework [@tjholowaychuk]
- [Gulp] - the streaming build system
- [Breakdance](https://breakdance.github.io/breakdance/) - HTML to Markdown converter
- [jQuery] - duh

* Express
* CORS
* BodyParser
* Mongoose
* MongoDB
* NodeCron
* Path
* Request
* fs


And of course PNGX-API itself is open source with a [public repository][pngx-api]
 on GitHub.

## 👩‍💻 Contributing

Want to contribute? Great!

PNGX-API uses Gulp for fast developing.
Make a change in your file and instantaneously see your updates!


Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

[Contributing Guide](Contributing.md)

[List of all contributors](https://github.com/chrisaugu/pngx-api/graphs/contributors)

## 🧑 Author Info

The original author of PNGX-API is [Christian Augustyn](https://github.com/chrisaugu)
- Linkedin - [LinkedIn: Christian Augustyn](https://www.linkedin.com/in/christianaugustyn/)
- Website - [Christian Augustyn](https://www.christianaugustyn.me)


## 🧾 ChangeLog
[CHANGELOG](./CHANGELOG.md)


## 📝 License

Licensed under the [MIT License](./LICENSE).

**Free Software, Hell Yeah!**

## © Copyright

&copy; 2023, Christian Augustyn.

## 🔧 Pull Request Steps

TOAST UI products are open source, so you can create a pull request(PR) after you fix issues.
Run npm scripts and develop yourself with the following process.

### Setup

Fork `main` branch into your personal repository.
Clone it to local computer. Install node modules.
Before starting development, you should check to have any errors.

``` sh
git clone https://github.com/{your-personal-repo}/[[repo name]].git
cd [[repo name]]
npm install
```

### Develop

Let's start development!

### Pull Request

Before PR, check to test lastly and then check any errors.
If it has no error, commit and then push it!

For more information on PR's step, please see links of Contributing section.

## 💬 Contributing

- [Code of Conduct](https://github.com/nhn/tui.calendar/blob/calendar@2.1.3/CODE_OF_CONDUCT.md)
- [Contributing Guidelines](https://github.com/nhn/tui.calendar/blob/calendar@2.1.3/CONTRIBUTING.md)
- [Commit Message Convention](https://github.com/nhn/tui.calendar/blob/calendar@2.1.3/docs/COMMIT_MESSAGE_CONVENTION.md)

## 📜 License

This software is licensed under the [MIT](https://github.com/nhn/tui.calendar/blob/calendar@2.1.3/LICENSE) © [NHN Cloud](https://github.com/nhn).


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








Types of schedules supported by _Schedule_:

* Schedule a set of work items across developers with different schedules
* Manage elevator reservations for an apartment building
* Schedule the company ping pong tournment

####For complete documentation visit [http://bunkat.github.io/schedule/](http://bunkat.github.io/schedule/).


## Installation
Using npm:

    $ npm install schedulejs

Using bower:

    $ bower install later
    $ bower install schedule

## Building

To build the minified javascript files for _schedule_, run `npm install` to install dependencies and then:

    $ make build

## Running tests

To run the tests for _schedule_, run `npm install` to install dependencies and then:

    $ make test

## Versioning

Releases will be numbered with the following format:

`<major>.<minor>.<patch>`

And constructed with the following guidelines:

* Breaking backward compatibility bumps the major (and resets the minor and patch)
* New additions without breaking backward compatibility bumps the minor (and resets the patch)
* Bug fixes and misc changes bumps the patch

For more information on SemVer, please visit [http://semver.org/](http://semver.org/).

## Bug tracker

Have a bug or a feature request? [Please open a new issue](https://github.com/chrisaugu/pngx-api/issues).

## Change Log

### Schedule v0.6.0

* First documented release.


