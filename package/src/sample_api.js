var myHeaders = new Headers();
myHeaders.append("apikey", "OB030miTWcDD58KR8yeLIAMK9j9hVaYQ");

var requestOptions = {
  method: 'GET',
  redirect: 'follow',
  headers: myHeaders
};

fetch("https://api.apilayer.com/bank_data/banks_by_country?country_code=PG", requestOptions)
  .then(response => response.text())
  .then(result => console.log(result))
  .catch(error => console.log('error', error));


let data = {
  "data": [
    {
      "id": 29570,
      "name": "AUSTRALIA AND NEW ZEALAND BANKING GROUP (PNG) LTD."
    },
    {
      "id": 29571,
      "name": "BANK OF PAPUA NEW GUINEA"
    },
    {
      "id": 29572,
      "name": "BRITISH AMERICAN TOBACCO (PNG) LIMITED"
    },
    {
      "id": 29573,
      "name": "FIRST INVESTMENT FINANCE LIMITED"
    },
    {
      "id": 29574,
      "name": "KINA BANK LIMITED"
    },
    {
      "id": 29575,
      "name": "WESTPAC BANK - PNG - LIMITED"
    }
  ],
  "links": {
    "first": "https://api.apilayer.com/bank_data/banks_by_country?page=1",
    "last": "https://api.apilayer.com/bank_data/banks_by_country?page=1",
    "next": null,
    "prev": null
  },
  "meta": {
    "current_page": 1,
    "from": 1,
    "last_page": 1,
    "links": [
      {
        "active": false,
        "label": "« Previous",
        "url": null
      },
      {
        "active": true,
        "label": "1",
        "url": "https://api.apilayer.com/bank_data/banks_by_country?page=1"
      },
      {
        "active": false,
        "label": "Next »",
        "url": null
      }
    ],
    "path": "https://api.apilayer.com/bank_data/banks_by_country",
    "per_page": 10,
    "to": 6,
    "total": 6
  }
}