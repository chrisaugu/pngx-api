 [![PNGX-API Logo](https://raw.githubusercontent.com/chrisaugu/pngx-api/master/images/banner.png)](https://pngx-api.christianaugustyn.app/) 

# PNGX-API

_The First Unofficial PNGX-API, Ever_

PNGX Restful API. Formerly part of CrisBot, now a standalone API.


![GitHub last commit](https://img.shields.io/github/last-commit/chrisaugu/pngx-api)
![Lines of code](https://img.shields.io/tokei/lines/github/chrisaugu/pngx-api)
![GitHub forks](https://img.shields.io/github/forks/chrisaugu/pngx-api?style=social)
![Github Repo stars](https://img.shields.io/github/stars/chrisaugu/pngx-api?style=social)
![GitHub watchers](https://img.shields.io/github/watchers/chrisaugu/pngx-api?style=social)
![GitHub contributors](https://img.shields.io/github/contributors/chrisaugu/pngx-api)


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
API endpoint that exposes stock quotes from [pngx.com](http://www.pngx.com.pg/data/). PNGX-API is part of [crisbot](https://github.com/chrisaugu/cristhebot). PNGX-API was part of CrisBot - my personal bot which is still under heavy development but now is a standalone server.

* A simple football stats and live-score Android app
* A user can select a league they want to view the league table, top scorers and also be updated on the live-scores in realtime
* User can be able to select to see upcoming matches for a given day
* Project was completed with MVVM architecture and following android app architecture using Retrofit , Coroutines and Navigation components

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
| *NCM | Newcrest Mining Limited |
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
- [x] #739
- [ ] https://github.com/octo-org/octo-repo/issues/740
- [ ] Add delight to the experience when all tasks are complete :tada:


## 📱 Screenshots
<p align="left">
<!-- <img src="/images/upcomingmatches.png" width="30%"/> 
<img src="/images/pastscores.png" width="30%"/> 
<img src="/images/leaguetable.png" width="30%"/>
<img src="/images/topscorers.png" width="30%"/>-->
</p>
---

## API Reference

### Get a list of symbols for all the current listed companies
#### Get upcoming matches
#### Request
```GET /```

    curl -i -H 'Accept: application/json' https://pngx-api.christianaugustyn.me/

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

    curl -i -H 'Accept: application/json' https://pngx-api.christianaugustyn.me/api/stocks

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

&nbsp;

`GET /api/historicals/:symbol?date=DATE`

&nbsp;

`GET /api/historicals/:symbol?start=DATE`

&nbsp;

`GET /api/historicals/:symbol?end=DATE`

&nbsp;

`GET /api/historicals/:symbol?field=`

&nbsp;

    curl -i -H 'Accept: application/json' https://pngx-api.christianaugustyn.me/api/historicals/:symbol

&nbsp;

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

&nbsp;

#### Request

`GET /api/historicals/:symbol`

    curl -i -H 'Accept: application/json' https://pngx-api.christianaugustyn.me/api/historicals/:symbol

&nbsp;

#### Response

    HTTP/1.1 200 OK
    Date: Sat, 02 Oct 2021 03:25:07[^1] GMT
    Status: 200 OK
    Connection: close
    X-Powered-By: Express
    Content-Type: application/json
    Content-Length: 85

    {"status":404,"reason":"Not found"}


## 🛠️ Tech & Tools

The entire application is written in JavaScript and built on NodeJs.

Dillinger uses a number of open source projects to work properly:

### Dependencies

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
- []
* Express
* CORS
* BodyParser
* Mongoose
* MongoDB
* NodeCron
* Path
* Request
* Fs



And of course Dillinger itself is open source with a [public repository][dill]
 on GitHub.



## 👩‍💻 Contributing

fork_and_knifeFork it!
twisted_rightwards_arrowsCreate your branch: git checkout -b new-branch
wrenchMake your changes
memoCommit your changes: git commit -am 'Add some feature'
rocketPush to the branch: git push origin new-branch
tadaSubmit a pull request
or submit an issue - any helpful suggestions are welcomed. stuck_out_tongue_winking_eye

Want to contribute? Great!

PNGX-API uses Gulp for fast developing.
Make a change in your file and instantaneously see your updates!

Open your favorite Terminal and run these commands.

First Tab:

```sh
node app
```

Second Tab:

```sh
gulp watch
```

(optional) Third:

```sh
karma test
```

#### Building for source

For production release:

```sh
gulp build --prod
```

Generating pre-built zip archives for distribution:

```sh
gulp build dist --prod
```


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

**Free Software, Hell Yeah!**


## © Copyright

&copy; 2023, Christian Augustyn.



[//]: # (These are reference links used in the body of this note and get stripped out when the markdown processor does its job. There is no need to format nicely because it shouldn't be seen. Thanks SO - http://stackoverflow.com/questions/4823468/store-comments-in-markdown-syntax)

   [dill]: <https://github.com/joemccann/dillinger>
   [MongoDB]: <https://www.mongodb.com>
   [git-repo-url]: <https://github.com/joemccann/dillinger.git>
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

   [PlDb]: <https://github.com/joemccann/dillinger/tree/master/plugins/dropbox/README.md>
   [PlGh]: <https://github.com/joemccann/dillinger/tree/master/plugins/github/README.md>
   [PlGd]: <https://github.com/joemccann/dillinger/tree/master/plugins/googledrive/README.md>
   [PlOd]: <https://github.com/joemccann/dillinger/tree/master/plugins/onedrive/README.md>
   [PlMe]: <https://github.com/joemccann/dillinger/tree/master/plugins/medium/README.md>
   [PlGa]: <https://github.com/RahulHP/dillinger/blob/master/plugins/googleanalytics/README.md>


