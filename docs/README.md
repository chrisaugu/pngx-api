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

## 🛣️ Roadmap
We continuously make NUKU-API the only place where all users can obtain the necessary financial data. If you have any questions or ideas about improvement, [contribute](#-contributing).

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
