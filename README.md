 [![PNGX-API Logo](https://raw.githubusercontent.com/chrisaugu/pngx-api/master/images/banner.png)](https://pngx-api.cleverapps.io/) 

# PNGX-API

PNGX-API
============

PNGX Restful API. Formerly part of CrisBot, now a standalone API.


_The First Unofficial PNGX-API, Ever_

[![N|Solid](https://cldup.com/dTxpPi9lDf.thumb.png)](https://nodesource.com/products/nsolid)
![GitHub branch checks state](https://img.shields.io/github/checks-status/chrisaugu/pngx-api/master)
![GitHub last commit](https://img.shields.io/github/last-commit/chrisaugu/pngx-api)
![Lines of code](https://img.shields.io/tokei/lines/github/chrisaugu/pngx-api)
![GitHub forks](https://img.shields.io/github/forks/chrisaugu/pngx-api?style=social)
![Github Repo stars](https://img.shields.io/github/stars/chrisaugu/pngx-api?style=social)
![GitHub watchers](https://img.shields.io/github/watchers/chrisaugu/pngx-api?style=social)
![GitHub contributors](https://img.shields.io/github/contributors/chrisaugu/pngx-api)

Dillinger is a cloud-enabled, mobile-ready, offline-storage compatible,
AngularJS-powered HTML5 Markdown editor.

- Type some Markdown on the left
- See HTML in the right
- ✨Magic ✨

## Features

- Import a HTML file and watch it magically convert to Markdown
- Drag and drop images (requires your Dropbox account be linked)
- Import and save files from GitHub, Dropbox, Google Drive and One Drive
- Drag and drop markdown and HTML files into Dillinger
- Export documents as Markdown, HTML and PDF

Markdown is a lightweight markup language based on the formatting conventions
that people naturally use in email.
As [John Gruber] writes on the [Markdown site][df1]

> The overriding design goal for Markdown's
> formatting syntax is to make it as readable
> as possible. The idea is that a
> Markdown-formatted document should be
> publishable as-is, as plain text, without
> looking like it's been marked up with tags
> or formatting instructions.

This text you see here is *actually- written in Markdown! To get a feel
for Markdown's syntax, type some text into the left window and 
watch the results in the right.*

## Tech

Dillinger uses a number of open source projects to work properly:

- [AngularJS] - HTML enhanced for web apps!
- [Ace Editor] - awesome web-based text editor
- [markdown-it] - Markdown parser done right. Fast and easy to extend.
- [Twitter Bootstrap] - great UI boilerplate for modern web apps
- [node.js] - evented I/O for the backend
- [Express] - fast node.js network app framework [@tjholowaychuk]
- [Gulp] - the streaming build system
- [Breakdance](https://breakdance.github.io/breakdance/) - HTML to Markdown converter
- [jQuery] - duh

And of course Dillinger itself is open source with a [public repository][dill]
 on GitHub.

## Installation

Dillinger requires [Node.js](https://nodejs.org/) v10+ to run.

Install the dependencies and devDependencies and start the server.

```sh
cd dillinger
npm i
node app
```

For production environments...

```sh
npm install --production
NODE_ENV=production node app
```

## Plugins

Dillinger is currently extended with the following plugins.
Instructions on how to use them in your own application are linked below.

| Plugin | README |
| ------ | ------ |
| Dropbox | [plugins/dropbox/README.md][PlDb] |
| GitHub | [plugins/github/README.md][PlGh] |
| Google Drive | [plugins/googledrive/README.md][PlGd] |
| OneDrive | [plugins/onedrive/README.md][PlOd] |
| Medium | [plugins/medium/README.md][PlMe] |
| Google Analytics | [plugins/googleanalytics/README.md][PlGa] |



#### Building for source

For production release:

```sh
gulp build --prod
```

Generating pre-built zip archives for distribution:

```sh
gulp build dist --prod
```

## Docker

Dillinger is very easy to install and deploy in a Docker container.

By default, the Docker will expose port 8080, so change this within the
Dockerfile if necessary. When ready, simply use the Dockerfile to
build the image.

```sh
cd dillinger
docker build -t <youruser>/dillinger:${package.json.version} .
```

This will create the dillinger image and pull in the necessary dependencies.
Be sure to swap out `${package.json.version}` with the actual
version of Dillinger.

Once done, run the Docker image and map the port to whatever you wish on
your host. In this example, we simply map port 8000 of the host to
port 8080 of the Docker (or whatever port was exposed in the Dockerfile):

```sh
docker run -d -p 8000:8080 --restart=always --cap-add=SYS_ADMIN --name=dillinger <youruser>/dillinger:${package.json.version}
```

> Note: `--capt-add=SYS-ADMIN` is required for PDF rendering.

Verify the deployment by navigating to your server address in
your preferred browser.

```sh
127.0.0.1:8000
```

## License

MIT

**Free Software, Hell Yeah!**


### Screenshots
<p align="left">
<!-- <img src="/images/upcomingmatches.png" width="30%"/> 
<img src="/images/pastscores.png" width="30%"/> 
<img src="/images/leaguetable.png" width="30%"/>
<img src="/images/topscorers.png" width="30%"/>-->
</p>

---

### Table of Contents
- [Description](#description)
- [Dependencies](#dependencies)
- [API Reference](#api-reference)
- [Lessons Learnt](#lesssons-learnt)
- [Contributing](#contributing)
- [Author Info](author-info)
- [License](#license)
- [Copyright](#copyright)

---

## Description
API endpoint that exposes stock quotes from [pngx.com](http://www.pngx.com.pg/data/). PNGX-API is part of [crisbot](https://github.com/chrisaugu/cristhebot). PNGX-API was part of CrisBot - my personal bot which is still under heavy development but now is a standalone server.

* A simple football stats and live-score Android app
* A user can select a league they want to view the league table, top scorers and also be updated on the live-scores in realtime
* User can be able to select to see upcoming matches for a given day
* Project was completed with MVVM architecture and following android app architecture using Retrofit , Coroutines and Navigation components

### Dependencies
* Express
* CORS
* BodyParser
* Mongoose
* MongoDB
* NodeCron
* Path
* Request
* Fs

### Tech & Tools
The entire application is written in JavaScript and built on NodeJs.

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
| NCM | Newcrest Mining Limited |
| NGP | NGIP Agmark Limited |
| NIU | Niuminco Group Limited |
| SST | Steamships Trading Company Limited |
| STO | Santos Limited |

### API Reference

### Get a list of symbols for all the current listed companies
#### Get upcoming matches
#### Request
```GET /```

    curl -i -H 'Accept: application/json' https://pngx-api.cleverapps.io/

```https
  GET /api/stocks
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `apiKey` | `string` | **Required**. Your API key |
| `seasonId` | `string` | **Required**.League Id e.g Premier League|
| `dateFrom` | `string` | **Required**.|
| `dateTo` | `string` | **Required**.|

#### Response
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

## Get list of Stocks for the day

#### Request

`GET /api/stocks/`

    curl -i -H 'Accept: application/json' https://pngx-api.cleverapps.io/api/stocks

#### Response

    HTTP/1.1 200 OK
    Date: Sat, 02 Oct 2021 03:25:07 GMT
    Status: 200 OK
    Connection: close
    X-Powered-By: Express
    Content-Type: application/json
    Content-Length: 85

    {"symbols":["BSP","CCP","CGA","COY","CPL","KAM","KSL","NCM","NGP","NIU","OSH","S
    ST"]}


## Get a specific Quote

#### Request

`GET /api/historicals/:symbol`

</br>

`GET /api/historicals/:symbol?date=DATE`

</br>

`GET /api/historicals/:symbol?start=DATE`

</br>

`GET /api/historicals/:symbol?end=DATE`

</br>

`GET /api/historicals/:symbol?field=`

</br>

    curl -i -H 'Accept: application/json' https://pngx-api.cleverapps.io/api/historicals/:symbol

#### Response

    HTTP/1.1 200 OK
    Date: Sat, 02 Oct 2021 03:25:07 GMT
    Status: 200 OK
    Connection: close
    X-Powered-By: Express
    Content-Type: application/json
    Content-Length: 85

    {"symbol": "BSP", "historical": [{}]}


## Get a non-existent Quote

#### Request

`GET /api/historicals/:symbol`

    curl -i -H 'Accept: application/json' https://pngx-api.cleverapps.io/api/historicals/:symbol

#### Response

    HTTP/1.1 200 OK
    Date: Sat, 02 Oct 2021 03:25:07[^1] GMT
    Status: 200 OK
    Connection: close
    X-Powered-By: Express
    Content-Type: application/json
    Content-Length: 85

    {"status":404,"reason":"Not found"}

</br>

## 👩‍💻 Contributing

Want to contribute? Great!

PNGX-API uses express 

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
[History](HISTORY.md)


## 📝 License

Licensed under the [MIT License](./LICENSE).


## © Copyright

&copy; 2021, Christian Augustyn.

