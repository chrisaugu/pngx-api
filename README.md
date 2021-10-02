# PNGX-API
API endpoint that exposes stock quotes from [pngx.com](http://www.pngx.com.pg/data/).

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

`/v1/stocks` -
Retrieve stocks

[BSP, CCP, CGA, COY, CPL, KAM, KSL, NCM, NGP, NIU, OSH, SST]

# REST API

The REST API to the example app is described below.

## Get list of currently listed companies

### Request
`GET /v1/`

    curl -i -H 'Accept: application/json' https://pngx-api.cleverapps.io/v1/

### Response

    HTTP/1.1 200 OK
    Date: Sat, 02 Oct 2021 03:25:07 GMT
    Status: 200 OK
    Connection: close
    X-Powered-By: Express
    Content-Type: application/json
    Content-Length: 85

    {"symbols":["BSP","CCP","CGA","COY","CPL","KAM","KSL","NCM","NGP","NIU","OSH","S
    ST"]}

## Get list of Stocks

### Request

`GET /v1/stocks/`

    curl -i -H 'Accept: application/json' https://pngx-api.cleverapps.io/v1/stocks

### Response

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

### Request

`GET /v1/stocks/:symbol`
</br>
`GET /v1/stocks/:symbol?date=DATE`
</br>
`GET /v1/stocks/:symbol?start=DATE`
</br>
`GET /v1/stocks/:symbol?end=DATE`
</br>
`GET /v1/stocks/:symbol?start=DATE&end=DATE`
</br>


    curl -i -H 'Accept: application/json' https://pngx-api.cleverapps.io/v1/:symbol

### Response

    HTTP/1.1 200 OK
    Date: Sat, 02 Oct 2021 03:25:07 GMT
    Status: 200 OK
    Connection: close
    X-Powered-By: Express
    Content-Type: application/json
    Content-Length: 85

    {"symbol": "BSP", "historical": [{}]}

## Get a non-existent Quote

### Request

`GET /v1/stocks/:symbol`

    curl -i -H 'Accept: application/json' https://pngx-api.cleverapps.io/v1/stocks/:symbol

### Response

    HTTP/1.1 200 OK
    Date: Sat, 02 Oct 2021 03:25:07 GMT
    Status: 200 OK
    Connection: close
    X-Powered-By: Express
    Content-Type: application/json
    Content-Length: 85

    {"status":404,"reason":"Not found"}

### Contribute
Show your support by 🌟 the project!!

Feel free to contribute!!

### License
This project is released under [MIT License](https://opensource.org/licenses/MIT)(LICENSE.txt).
