# {title}

Just an example view rendered with _markdown_.

<p align="center">
  <img src="https://i2.wp.com/www.pngx.com.pg/wp-content/uploads/2019/07/pngx1.png" width="300" height="175" alt="PNGX logo">
</p>

<h3 align="center">Bootstrap npm starter template</h3>

<p align="center">Create new Bootstrap-powered npm projects in no time.</p>

## About

# PNGX-API
API endpoint that exposes stock quotes from [pngx.com](http://www.pngx.com.pg/data/). PNGX-API is part of [crisbot](https://github.com/chrisaugu/cristhebot).

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

## REST API Usage

The REST API to the example app is described below.

### Get a list of symbols for all the current listed companies

#### Request
`GET /v1/`

    curl -i -H 'Accept: application/json' https://pngx-api.cleverapps.io/v1/

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


## Get list of Stocks for the day

#### Request

`GET /v1/stocks/`

    curl -i -H 'Accept: application/json' https://pngx-api.cleverapps.io/v1/stocks

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

`GET /v1/stocks/:symbol`
</br>
`GET /v1/stocks/:symbol?date=DATE`
</br>
`GET /v1/stocks/:symbol?start=DATE`
</br>
`GET /v1/stocks/:symbol?end=DATE`
</br>
`GET /v1/stocks/:symbol?field=`
</br>


    curl -i -H 'Accept: application/json' https://pngx-api.cleverapps.io/v1/:symbol

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

`GET /v1/stocks/:symbol`

    curl -i -H 'Accept: application/json' https://pngx-api.cleverapps.io/v1/stocks/:symbol

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

## ChangeLog
>hello


## Copyright

&copy; chrisaugu 2021.