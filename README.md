<!-- Just an example view rendered with _markdown_. -->

<!-- <p align="center"> -->
  <!-- <img src="https://i2.wp.com/www.pngx.com.pg/wp-content/uploads/2019/07/pngx1.png" width="300" height="175" alt="PNGX logo"> -->
<!-- </p> -->

<!-- <h3 align="center">Bootstrap npm starter template</h3> -->

<!-- <p align="center">Create new Bootstrap-powered npm projects in no time.</p> -->

# PNGX-API

# 🛠️Hi!The app might have some bugs since it's undergoing major refactoring🛠

### Screenshots
<p align="left">
<img src="/images/upcomingmatches.png" width="30%"/> 
<img src="/images/pastscores.png" width="30%"/> 
<img src="/images/leaguetable.png" width="30%"/>
<img src="/images/topscorers.png" width="30%"/>
</p>

---

### Table of Contents

- [Description](#description)
- [Dependencies](#dependencies)
- [API Reference](#api-reference)
- [Lessons Learnt](#lesssons-learnt)
- [Contributing](#contributing)
- [Roadmap](#roadmap)
- [Google Playstore](google-playstore)
- [License](#license)
- [Author Info](author-info)

---

## Description
API endpoint that exposes stock quotes from [pngx.com](http://www.pngx.com.pg/data/). PNGX-API is part of [crisbot](https://github.com/chrisaugu/cristhebot).

* A simple football stats and live-score Android app
* A user can select a league they want to view the league table, top scorers and also be updated on the live-scores in realtime
* User can be able to select to see upcoming matches for a given day
* Project was completed with MVVM architecture and following android app architecture using Retrofit , Coroutines and Navigation components

### Dependencies
* Coroutines
* Retrofit
* Navigation components
* Glide
* GlideVectorYou


### Tech & Tools
The entire application is written in JavaScript and built on NodeJs.

Companies listed on PNGX

    BSP
    CCP
    CGA
    COY
    CPL
    KAM
    KSL
    NCM
    NGP
    NIU
    OSH
    SST

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

`GET /stocks/`

    curl -i -H 'Accept: application/json' https://pngx-api.cleverapps.io/stocks

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

`GET /stocks/:symbol`
</br>
`GET /stocks/:symbol?date=DATE`
</br>
`GET /stocks/:symbol?start=DATE`
</br>
`GET /stocks/:symbol?end=DATE`
</br>
`GET /stocks/:symbol?field=`
</br>


    curl -i -H 'Accept: application/json' https://pngx-api.cleverapps.io/:symbol

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

`GET /stocks/:symbol`

    curl -i -H 'Accept: application/json' https://pngx-api.cleverapps.io/stocks/:symbol

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

## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request


## License

[MIT](https://choosealicense.com/licenses/mit/)

## ChangeLog
hello


## Author Info

- Linkedin - [LinkedIn: Christian Augustyn](https://www.linkedin.com/in/christianaugustyn/)

## Copyright

&copy; 2021, Christian Augustyn.