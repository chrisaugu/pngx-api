# NUKU-API NPM Library
This is a small JavaScript library package for retrieving stocks info from PNGX.com website
This npm package provides utilities to work with the Indian stock market, including functions to determine market holidays, expiry dates for futures and options, and market open/close status.
A lightweight NPM package for fetching Vietnam stock market data from VCI.

The library is built using TypeScript

https://medium.com/@the_nick_morgan/creating-an-npm-package-with-typescript-c38b97a793cf
https://medium.com/nerd-for-tech/testing-typescript-with-jest-290eaee9479d

https://github.com/nodef/extra-fyers
https://github.com/toolboxco/signalx/
https://zerodha.com/about/
https://www.npmjs.com/package/inves-broker
https://www.financialdatasets.ai/pricing
https://vnstocks.com/docs/vnstock/thong-ke-gia-lich-su
https://github.com/thinh-vu/vnstock/



## Market-cap Weighted indices
Market Cap is calculated as:

    market cap = total outstanding shares x share price

Where:
- **market cap**: The total market value of a company's outstanding shares.
- **total outstanding shares**: The total number of shares that are currently held by all shareholders
- **share price**: The current price of a single share of the company's stock.


## Price-weighted indices
Price-weighted indices are calculated by adding the prices of the stocks in the index and dividing by the number of stocks in the index. The formula is:

    index value = (sum of stock prices) / (number of stocks)

Where:
- **index value**: The value of the index at a given time.
- **sum of stock prices**: The total of the prices of all stocks in the index
- **number of stocks**: The total number of stocks in the index.

## Equal-weighted indices
Equal-weighted indices are calculated by taking the average of the prices of the stocks in the index. 
Let's say an equal-weighted index has three stocks (A, B, and C) with prices of $10, $20, and $30, respectively. 
Weight: 100 / 3 = 33.33% (approximately)
Contributions:
Stock A: $10 * 0.3333 = $3.333
Stock B: $20 * 0.3333 = $6.666
Stock C: $30 * 0.3333 = $9.999
Index Value: $3.333 + $6.666 + $9.999 = $20 (approximately)

The formula is:

    index weight = 100 / (number of stocks)
    index value = (sum of stock prices) * (index weight)


Where:
- **index value**: The value of the index at a given time.
- **sum of stock prices**: The total of the prices of all stocks in the index
- **number of stocks**: The total number of stocks in the index.
- **average price**: The average price of the stocks in the index.
- **index weight**: The weight assigned to each stock in the index, which is equal for all stocks in an equal-weighted index.



Free float weight, often used in stock market indices, is calculated by determining the portion of a company's outstanding shares that are available for public trading. This is done by subtracting shares held by insiders, governments, or those otherwise restricted from the total outstanding shares. The remaining "free float" shares are then used to calculate the company's weight within the index. 
Here's a more detailed breakdown:
1. Identify Outstanding Shares:
    Start with the total number of shares a company has issued and that are currently held by investors. 
2. Identify Restricted Shares:
    Determine which shares are not available for public trading. These can include shares held by:
    Promoters: The company's founders or major shareholders. 
    Company Officers: Executives and directors. 
    Controlling Interest Investors: Investors who hold a significant portion of the company's stock. 
    Government: In some cases, government entities may hold shares. 
    Other Restricted Shares: Shares subject to specific restrictions, like lock-up periods after an IPO. 
3. Calculate Free Float:
    Subtract the restricted shares from the total outstanding shares. 
4. Determine Free Float Weight:
    The free float (number of shares) is then used to calculate the company's weighting in an index. This is often done by dividing the company's free-float market capitalization (free float shares * current share price) by the total market capitalization of all companies in the index. 
5. Example:
    If a company has 1 million outstanding shares and 200,000 are restricted, the free float is 800,000 shares. This 800,000 would be used to calculate the company's weight in an index:

        free float weight = (free float shares * current share price) / total market cap of index

Where:
- **free float shares**: The number of shares available for public trading.
- **current share price**: The current market price of a single share of the company's stock.
- **total market cap of index**: The total market capitalization of all companies in the index.
- **free float weight**: The weight assigned to the company in the index based on its free float shares.


## PNGX Indices
The PNGX (Papua New Guinea Exchange) has several indices that track the performance of listed companies. These indices are categorized based on the type of companies they include (domestic vs. foreign) and the method of weighting used (free-float, total market cap, or equal-weighted).

| Index Name                         | Abbreviation | Coverage                                   | Weighting Type            |
| ---------------------------------- | ------------ | ------------------------------------------ | ------------------------- |
| PNGX Domestic Index                | **PNGXD**    | Domestic companies                         | Free-float cap‑weighted   |
| PNGX Market Index                  | **PNGXI**    | All listed companies                       | Free-float cap‑weighted   |
| PNGX Domestic Capitalisation Index | **PNGXDC**   | Domestic companies                         | Total market cap‑weighted |
| PNGX Market Capitalisation Index   | **PNGXIC**   | All listed companies                       | Total market cap‑weighted |
| PNGX Equal Weight Domestic Index   | **PNGXDE**   | Domestic companies                         | Equal-weighted            |
| PNGX Equal Weight Market Index     | **PNGXIE**   | All listed companies                       | Equal-weighted            |


Domestic companies are those incorporated in Papua New Guinea, while foreign companies are those incorporated outside of Papua New Guinea.
Domestic companies:

| Ticker | Company Name                   | Sector                     |
| ------ | ------------------------------ | -------------------------- |
| BSP    | Bank South Pacific Ltd         | Financials / Banking       |
| CPL    | City Pharmacy Ltd              | Consumer / Pharmaceuticals |
| COY    | Coppermoly Ltd                 | Mining / Resources         |
| CCP    | Credit Corporation (PNG) Ltd   | Financial Services         |
| KAM    | Kina Asset Management Ltd      | Asset Management           |
| KSL    | Kina Securities Ltd            | Financial Services         |
| CGA    | PNG Air Ltd                    | Transport / Aviation       |
| NGP    | New Guinea Islands Produce Ltd | Agriculture                |
| NIU    | Niuminco Group Ltd             | Mining / Exploration       |
| SST    | Steamships Trading Company Ltd | Conglomerate / Shipping    |

✅ These companies are included in all Domestic Indices (PNGXD, PNGXDC, PNGXDE), and also in Market Indices (PNGXI, PNGXIC, PNGXIE).


Foreign companies:

| Ticker | Company Name        | Country of Incorporation | Sector        |
| ------ | ------------------- | ------------------------ | ------------- |
| STO    | Santos Ltd          | Australia                | Oil & Gas     |
| NCM    | Newcrest Mining Ltd | Australia                | Mining / Gold |
| NEM    | Newmont Corporation | USA                      | Mining / Gold |

✅ These companies are only included in the Market Indices (PNGXI, PNGXIC, PNGXIE), and excluded from Domestic Indices.







npm run build

npm run test


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

Have a bug or a feature request? [Please open a new issue](https://github.com/bunkat/schedule/issues).

## Change Log

### Schedule v0.6.0

* First documented release.