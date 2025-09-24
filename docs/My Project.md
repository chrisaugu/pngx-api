---
title: My Project v1.0.0
language_tabs:
  - shell: Shell
  - http: HTTP
  - javascript: JavaScript
  - ruby: Ruby
  - python: Python
  - php: PHP
  - java: Java
  - go: Go
toc_footers: []
includes: []
search: true
code_clipboard: true
highlight_theme: darkula
headingLevel: 2
generator: "@tarslib/widdershins v4.0.17"
---

# My Project

> v1.0.0

Base URLs:

# Authentication

# NUKU-API/pet

<a id="opIdupdatePet"></a>

## PUT Update an existing pet

PUT /pet

Update an existing pet by Id

> Body Parameters

```yaml
id: "10"
name: doggie
category: string
photoUrls: []
tags: []
status: string
```

### Params

| Name        | Location | Type    | Required | Description             |
| ----------- | -------- | ------- | -------- | ----------------------- |
| body        | body     | object  | no       | none                    |
| » id        | body     | integer | no       | none                    |
| » name      | body     | string  | yes      | none                    |
| » category  | body     | string  | no       | none                    |
| » photoUrls | body     | array   | yes      | none                    |
| » tags      | body     | array   | no       | none                    |
| » status    | body     | string  | no       | pet status in the store |

> Response Examples

> 200 Response

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<pet>
  <id>10</id>
  <name>doggie</name>
  <category>
    <id>1</id>
    <name>Dogs</name>
  </category>
  <photoUrls>string</photoUrls>
  <tags>
    <id>0</id>
    <name>string</name>
  </tags>
  <status>available</status>
</pet>
```

### Responses

| HTTP Status Code | Meaning                                                                 | Description          | Data schema       |
| ---------------- | ----------------------------------------------------------------------- | -------------------- | ----------------- |
| 200              | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)                 | Successful operation | [Pet](#schemapet) |
| 400              | [Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)        | Invalid ID supplied  | Inline            |
| 404              | [Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)          | Pet not found        | Inline            |
| 405              | [Method Not Allowed](https://tools.ietf.org/html/rfc7231#section-6.5.5) | Validation exception | Inline            |

### Responses Data Schema

<a id="opIdaddPet"></a>

## POST Add a new pet to the store

POST /pet

Add a new pet to the store

> Body Parameters

```yaml
id: "10"
name: doggie
category: string
photoUrls: []
tags: []
status: string
```

### Params

| Name        | Location | Type    | Required | Description             |
| ----------- | -------- | ------- | -------- | ----------------------- |
| body        | body     | object  | no       | none                    |
| » id        | body     | integer | no       | none                    |
| » name      | body     | string  | yes      | none                    |
| » category  | body     | string  | no       | none                    |
| » photoUrls | body     | array   | yes      | none                    |
| » tags      | body     | array   | no       | none                    |
| » status    | body     | string  | no       | pet status in the store |

> Response Examples

> 200 Response

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<pet>
  <id>10</id>
  <name>doggie</name>
  <category>
    <id>1</id>
    <name>Dogs</name>
  </category>
  <photoUrls>string</photoUrls>
  <tags>
    <id>0</id>
    <name>string</name>
  </tags>
  <status>available</status>
</pet>
```

### Responses

| HTTP Status Code | Meaning                                                                 | Description          | Data schema       |
| ---------------- | ----------------------------------------------------------------------- | -------------------- | ----------------- |
| 200              | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)                 | Successful operation | [Pet](#schemapet) |
| 405              | [Method Not Allowed](https://tools.ietf.org/html/rfc7231#section-6.5.5) | Invalid input        | Inline            |

### Responses Data Schema

<a id="opIdfindPetsByStatus"></a>

## GET Finds Pets by status

GET /pet/findByStatus

Multiple status values can be provided with comma separated strings

### Params

| Name   | Location | Type   | Required | Description                                         |
| ------ | -------- | ------ | -------- | --------------------------------------------------- |
| status | query    | string | no       | Status values that need to be considered for filter |

> Response Examples

> 200 Response

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<id>10</id>
<name>doggie</name>
<category>
  <id>1</id>
  <name>Dogs</name>
</category>
<photoUrls>string</photoUrls>
<tags>
  <id>0</id>
  <name>string</name>
</tags>
<status>available</status>
```

### Responses

| HTTP Status Code | Meaning                                                          | Description          | Data schema |
| ---------------- | ---------------------------------------------------------------- | -------------------- | ----------- |
| 200              | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)          | successful operation | Inline      |
| 400              | [Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1) | Invalid status value | Inline      |

### Responses Data Schema

HTTP Status Code **200**

| Name        | Type                        | Required | Restrictions | Title | description             |
| ----------- | --------------------------- | -------- | ------------ | ----- | ----------------------- |
| _anonymous_ | [[Pet](#schemapet)]         | false    | none         |       | none                    |
| » id        | integer(int64)              | false    | none         |       | none                    |
| » name      | string(string)              | true     | none         |       | none                    |
| » category  | [Category](#schemacategory) | false    | none         |       | none                    |
| »» id       | integer(int64)              | false    | none         |       | none                    |
| »» name     | string                      | false    | none         |       | none                    |
| » photoUrls | [string]                    | true     | none         |       | none                    |
| » tags      | [[Tag](#schematag)]         | false    | none         |       | none                    |
| »» id       | integer(int64)              | false    | none         |       | none                    |
| »» name     | string                      | false    | none         |       | none                    |
| » status    | string(string)              | false    | none         |       | pet status in the store |

#### Enum

| Name   | Value     |
| ------ | --------- |
| status | available |
| status | pending   |
| status | sold      |

<a id="opIdfindPetsByTags"></a>

## GET Finds Pets by tags

GET /pet/findByTags

Multiple tags can be provided with comma separated strings. Use tag1, tag2, tag3 for testing.

### Params

| Name | Location | Type          | Required | Description       |
| ---- | -------- | ------------- | -------- | ----------------- |
| tags | query    | array[string] | no       | Tags to filter by |

> Response Examples

> 200 Response

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<id>10</id>
<name>doggie</name>
<category>
  <id>1</id>
  <name>Dogs</name>
</category>
<photoUrls>string</photoUrls>
<tags>
  <id>0</id>
  <name>string</name>
</tags>
<status>available</status>
```

### Responses

| HTTP Status Code | Meaning                                                          | Description          | Data schema |
| ---------------- | ---------------------------------------------------------------- | -------------------- | ----------- |
| 200              | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)          | successful operation | Inline      |
| 400              | [Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1) | Invalid tag value    | Inline      |

### Responses Data Schema

HTTP Status Code **200**

| Name        | Type                        | Required | Restrictions | Title | description             |
| ----------- | --------------------------- | -------- | ------------ | ----- | ----------------------- |
| _anonymous_ | [[Pet](#schemapet)]         | false    | none         |       | none                    |
| » id        | integer(int64)              | false    | none         |       | none                    |
| » name      | string(string)              | true     | none         |       | none                    |
| » category  | [Category](#schemacategory) | false    | none         |       | none                    |
| »» id       | integer(int64)              | false    | none         |       | none                    |
| »» name     | string                      | false    | none         |       | none                    |
| » photoUrls | [string]                    | true     | none         |       | none                    |
| » tags      | [[Tag](#schematag)]         | false    | none         |       | none                    |
| »» id       | integer(int64)              | false    | none         |       | none                    |
| »» name     | string                      | false    | none         |       | none                    |
| » status    | string(string)              | false    | none         |       | pet status in the store |

#### Enum

| Name   | Value     |
| ------ | --------- |
| status | available |
| status | pending   |
| status | sold      |

<a id="opIdgetPetById"></a>

## GET Find pet by ID

GET /pet/{petId}

Returns a single pet

### Params

| Name  | Location | Type    | Required | Description         |
| ----- | -------- | ------- | -------- | ------------------- |
| petId | path     | integer | yes      | ID of pet to return |

> Response Examples

> 200 Response

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<pet>
  <id>10</id>
  <name>doggie</name>
  <category>
    <id>1</id>
    <name>Dogs</name>
  </category>
  <photoUrls>string</photoUrls>
  <tags>
    <id>0</id>
    <name>string</name>
  </tags>
  <status>available</status>
</pet>
```

### Responses

| HTTP Status Code | Meaning                                                          | Description          | Data schema       |
| ---------------- | ---------------------------------------------------------------- | -------------------- | ----------------- |
| 200              | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)          | successful operation | [Pet](#schemapet) |
| 400              | [Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1) | Invalid ID supplied  | Inline            |
| 404              | [Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)   | Pet not found        | Inline            |

### Responses Data Schema

<a id="opIdupdatePetWithForm"></a>

## POST Updates a pet in the store with form data

POST /pet/{petId}

### Params

| Name   | Location | Type    | Required | Description                            |
| ------ | -------- | ------- | -------- | -------------------------------------- |
| petId  | path     | integer | yes      | ID of pet that needs to be updated     |
| name   | query    | string  | no       | Name of pet that needs to be updated   |
| status | query    | string  | no       | Status of pet that needs to be updated |

> Response Examples

> 405 Response

```json
{}
```

### Responses

| HTTP Status Code | Meaning                                                                 | Description   | Data schema |
| ---------------- | ----------------------------------------------------------------------- | ------------- | ----------- |
| 405              | [Method Not Allowed](https://tools.ietf.org/html/rfc7231#section-6.5.5) | Invalid input | Inline      |

### Responses Data Schema

<a id="opIddeletePet"></a>

## DELETE Deletes a pet

DELETE /pet/{petId}

delete a pet

### Params

| Name    | Location | Type    | Required | Description      |
| ------- | -------- | ------- | -------- | ---------------- |
| petId   | path     | integer | yes      | Pet id to delete |
| api_key | header   | string  | no       | none             |

> Response Examples

> 400 Response

```json
{}
```

### Responses

| HTTP Status Code | Meaning                                                          | Description       | Data schema |
| ---------------- | ---------------------------------------------------------------- | ----------------- | ----------- |
| 400              | [Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1) | Invalid pet value | Inline      |

### Responses Data Schema

<a id="opIduploadFile"></a>

## POST uploads an image

POST /pet/{petId}/uploadImage

> Body Parameters

```yaml
string
```

### Params

| Name               | Location | Type           | Required | Description         |
| ------------------ | -------- | -------------- | -------- | ------------------- |
| petId              | path     | integer        | yes      | ID of pet to update |
| additionalMetadata | query    | string         | no       | Additional Metadata |
| body               | body     | string(binary) | no       | none                |

> Response Examples

> 200 Response

```json
{
  "code": 0,
  "type": "string",
  "message": "string"
}
```

### Responses

| HTTP Status Code | Meaning                                                 | Description          | Data schema                       |
| ---------------- | ------------------------------------------------------- | -------------------- | --------------------------------- |
| 200              | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1) | successful operation | [ApiResponse](#schemaapiresponse) |

# NUKU-API/store

<a id="opIdgetInventory"></a>

## GET Returns pet inventories by status

GET /store/inventory

Returns a map of status codes to quantities

> Response Examples

> 200 Response

```json
{
  "property1": 0,
  "property2": 0
}
```

### Responses

| HTTP Status Code | Meaning                                                 | Description          | Data schema |
| ---------------- | ------------------------------------------------------- | -------------------- | ----------- |
| 200              | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1) | successful operation | Inline      |

### Responses Data Schema

HTTP Status Code **200**

| Name                       | Type           | Required | Restrictions | Title | description |
| -------------------------- | -------------- | -------- | ------------ | ----- | ----------- |
| » **additionalProperties** | integer(int32) | false    | none         |       | none        |

<a id="opIdplaceOrder"></a>

## POST Place an order for a pet

POST /store/order

Place a new order in the store

> Body Parameters

```yaml
id: "10"
petId: "198772"
quantity: "7"
shipDate: string
status: approved
complete: string
```

### Params

| Name       | Location | Type    | Required | Description  |
| ---------- | -------- | ------- | -------- | ------------ |
| body       | body     | object  | no       | none         |
| » id       | body     | integer | no       | none         |
| » petId    | body     | integer | no       | none         |
| » quantity | body     | integer | no       | none         |
| » shipDate | body     | string  | no       | none         |
| » status   | body     | string  | no       | Order Status |
| » complete | body     | string  | no       | none         |

> Response Examples

> 200 Response

```json
{
  "id": 10,
  "petId": 198772,
  "quantity": 7,
  "shipDate": "2019-08-24T14:15:22Z",
  "status": "approved",
  "complete": true
}
```

### Responses

| HTTP Status Code | Meaning                                                                 | Description          | Data schema           |
| ---------------- | ----------------------------------------------------------------------- | -------------------- | --------------------- |
| 200              | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)                 | successful operation | [Order](#schemaorder) |
| 405              | [Method Not Allowed](https://tools.ietf.org/html/rfc7231#section-6.5.5) | Invalid input        | Inline                |

### Responses Data Schema

<a id="opIdgetOrderById"></a>

## GET Find purchase order by ID

GET /store/order/{orderId}

For valid response try integer IDs with value <= 5 or > 10. Other values will generate exceptions.

### Params

| Name    | Location | Type    | Required | Description                          |
| ------- | -------- | ------- | -------- | ------------------------------------ |
| orderId | path     | integer | yes      | ID of order that needs to be fetched |

> Response Examples

> 200 Response

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<order>
  <id>10</id>
  <petId>198772</petId>
  <quantity>7</quantity>
  <shipDate>2019-08-24T14:15:22Z</shipDate>
  <status>approved</status>
  <complete>true</complete>
</order>
```

### Responses

| HTTP Status Code | Meaning                                                          | Description          | Data schema           |
| ---------------- | ---------------------------------------------------------------- | -------------------- | --------------------- |
| 200              | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)          | successful operation | [Order](#schemaorder) |
| 400              | [Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1) | Invalid ID supplied  | Inline                |
| 404              | [Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)   | Order not found      | Inline                |

### Responses Data Schema

<a id="opIddeleteOrder"></a>

## DELETE Delete purchase order by ID

DELETE /store/order/{orderId}

For valid response try integer IDs with value < 1000. Anything above 1000 or nonintegers will generate API errors

### Params

| Name    | Location | Type    | Required | Description                              |
| ------- | -------- | ------- | -------- | ---------------------------------------- |
| orderId | path     | integer | yes      | ID of the order that needs to be deleted |

> Response Examples

> 400 Response

```json
{}
```

### Responses

| HTTP Status Code | Meaning                                                          | Description         | Data schema |
| ---------------- | ---------------------------------------------------------------- | ------------------- | ----------- |
| 400              | [Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1) | Invalid ID supplied | Inline      |
| 404              | [Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)   | Order not found     | Inline      |

### Responses Data Schema

# NUKU-API/user

<a id="opIdcreateUser"></a>

## POST Create user

POST /user

This can only be done by the logged in user.

> Body Parameters

```yaml
id: "10"
username: theUser
firstName: John
lastName: James
email: john@email.com
password: "12345"
phone: "12345"
userStatus: "1"
```

### Params

| Name         | Location | Type    | Required | Description |
| ------------ | -------- | ------- | -------- | ----------- |
| body         | body     | object  | no       | none        |
| » id         | body     | integer | no       | none        |
| » username   | body     | string  | no       | none        |
| » firstName  | body     | string  | no       | none        |
| » lastName   | body     | string  | no       | none        |
| » email      | body     | string  | no       | none        |
| » password   | body     | string  | no       | none        |
| » phone      | body     | string  | no       | none        |
| » userStatus | body     | integer | no       | User Status |

> Response Examples

> 200 Response

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<user>
  <id>10</id>
  <username>theUser</username>
  <firstName>John</firstName>
  <lastName>James</lastName>
  <email>john@email.com</email>
  <password>12345</password>
  <phone>12345</phone>
  <userStatus>1</userStatus>
</user>
```

### Responses

| HTTP Status Code | Meaning                                                 | Description          | Data schema         |
| ---------------- | ------------------------------------------------------- | -------------------- | ------------------- |
| 200              | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1) | successful operation | [User](#schemauser) |

<a id="opIdcreateUsersWithListInput"></a>

## POST Creates list of users with given input array

POST /user/createWithList

Creates list of users with given input array

> Body Parameters

```json
[
  {
    "id": 10,
    "username": "theUser",
    "firstName": "John",
    "lastName": "James",
    "email": "john@email.com",
    "password": "12345",
    "phone": "12345",
    "userStatus": 1
  }
]
```

### Params

| Name | Location | Type                | Required | Description |
| ---- | -------- | ------------------- | -------- | ----------- |
| body | body     | [User](#schemauser) | no       | none        |

> Response Examples

> 200 Response

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<user>
  <id>10</id>
  <username>theUser</username>
  <firstName>John</firstName>
  <lastName>James</lastName>
  <email>john@email.com</email>
  <password>12345</password>
  <phone>12345</phone>
  <userStatus>1</userStatus>
</user>
```

### Responses

| HTTP Status Code | Meaning                                                                    | Description          | Data schema         |
| ---------------- | -------------------------------------------------------------------------- | -------------------- | ------------------- |
| 200              | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)                    | Successful operation | [User](#schemauser) |
| 500              | [Internal Server Error](https://tools.ietf.org/html/rfc7231#section-6.6.1) | successful operation | Inline              |

### Responses Data Schema

<a id="opIdloginUser"></a>

## GET Logs user into the system

GET /user/login

### Params

| Name     | Location | Type   | Required | Description                          |
| -------- | -------- | ------ | -------- | ------------------------------------ |
| username | query    | string | no       | The user name for login              |
| password | query    | string | no       | The password for login in clear text |

> Response Examples

> 200 Response

### Responses

| HTTP Status Code | Meaning                                                          | Description                        | Data schema |
| ---------------- | ---------------------------------------------------------------- | ---------------------------------- | ----------- |
| 200              | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)          | successful operation               | string      |
| 400              | [Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1) | Invalid username/password supplied | Inline      |

### Responses Data Schema

<a id="opIdlogoutUser"></a>

## GET Logs out current logged in user session

GET /user/logout

> Response Examples

> 200 Response

```json
{}
```

### Responses

| HTTP Status Code | Meaning                                                 | Description          | Data schema |
| ---------------- | ------------------------------------------------------- | -------------------- | ----------- |
| 200              | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1) | successful operation | Inline      |

### Responses Data Schema

<a id="opIdgetUserByName"></a>

## GET Get user by user name

GET /user/{username}

### Params

| Name     | Location | Type   | Required | Description                                               |
| -------- | -------- | ------ | -------- | --------------------------------------------------------- |
| username | path     | string | yes      | The name that needs to be fetched. Use user1 for testing. |

> Response Examples

> 200 Response

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<user>
  <id>10</id>
  <username>theUser</username>
  <firstName>John</firstName>
  <lastName>James</lastName>
  <email>john@email.com</email>
  <password>12345</password>
  <phone>12345</phone>
  <userStatus>1</userStatus>
</user>
```

### Responses

| HTTP Status Code | Meaning                                                          | Description               | Data schema         |
| ---------------- | ---------------------------------------------------------------- | ------------------------- | ------------------- |
| 200              | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)          | successful operation      | [User](#schemauser) |
| 400              | [Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1) | Invalid username supplied | Inline              |
| 404              | [Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)   | User not found            | Inline              |

### Responses Data Schema

<a id="opIdupdateUser"></a>

## PUT Update user

PUT /user/{username}

This can only be done by the logged in user.

> Body Parameters

```yaml
id: "10"
username: theUser
firstName: John
lastName: James
email: john@email.com
password: "12345"
phone: "12345"
userStatus: "1"
```

### Params

| Name         | Location | Type    | Required | Description                  |
| ------------ | -------- | ------- | -------- | ---------------------------- |
| username     | path     | string  | yes      | name that need to be deleted |
| body         | body     | object  | no       | none                         |
| » id         | body     | integer | no       | none                         |
| » username   | body     | string  | no       | none                         |
| » firstName  | body     | string  | no       | none                         |
| » lastName   | body     | string  | no       | none                         |
| » email      | body     | string  | no       | none                         |
| » password   | body     | string  | no       | none                         |
| » phone      | body     | string  | no       | none                         |
| » userStatus | body     | integer | no       | User Status                  |

> Response Examples

> 200 Response

```json
{}
```

### Responses

| HTTP Status Code | Meaning                                                 | Description          | Data schema |
| ---------------- | ------------------------------------------------------- | -------------------- | ----------- |
| 200              | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1) | successful operation | Inline      |

### Responses Data Schema

<a id="opIddeleteUser"></a>

## DELETE Delete user

DELETE /user/{username}

This can only be done by the logged in user.

### Params

| Name     | Location | Type   | Required | Description                       |
| -------- | -------- | ------ | -------- | --------------------------------- |
| username | path     | string | yes      | The name that needs to be deleted |

> Response Examples

> 400 Response

```json
{}
```

### Responses

| HTTP Status Code | Meaning                                                          | Description               | Data schema |
| ---------------- | ---------------------------------------------------------------- | ------------------------- | ----------- |
| 400              | [Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1) | Invalid username supplied | Inline      |
| 404              | [Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)   | User not found            | Inline      |

### Responses Data Schema

# NUKU-API/stocks

<a id="opIdgetStockById"></a>

## GET Get todays stocks

GET /stocks

Get todays stocks

> Response Examples

> 200 Response

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<stock>
  <id>10</id>
  <date>2023-12-15T00:00:00.000Z</date>
  <code>BSP</code>
  <short_name>BSP</short_name>
  <bid>10</bid>
  <offer>0</offer>
  <last>0</last>
  <close>0</close>
  <high>0</high>
  <low>0</low>
  <open>0</open>
  <chg_today>0</chg_today>
  <vol_today>0</vol_today>
  <num_trades>0</num_trades>
</stock>
```

### Responses

| HTTP Status Code | Meaning                                                          | Description          | Data schema             |
| ---------------- | ---------------------------------------------------------------- | -------------------- | ----------------------- |
| 200              | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)          | successful operation | [Stocks](#schemastocks) |
| 400              | [Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1) | Invalid ID supplied  | Inline                  |
| 404              | [Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)   | Stocks not found     | Inline                  |

### Responses Data Schema

# Data Schema

<h2 id="tocS_ApiResponse">ApiResponse</h2>

<a id="schemaapiresponse"></a>
<a id="schema_ApiResponse"></a>
<a id="tocSapiresponse"></a>
<a id="tocsapiresponse"></a>

```json
{
  "code": 0,
  "type": "string",
  "message": "string"
}
```

### Attribute

| Name    | Type           | Required | Restrictions | Title | Description |
| ------- | -------------- | -------- | ------------ | ----- | ----------- |
| code    | integer(int32) | false    | none         |       | none        |
| type    | string         | false    | none         |       | none        |
| message | string         | false    | none         |       | none        |

<h2 id="tocS_Order">Order</h2>

<a id="schemaorder"></a>
<a id="schema_Order"></a>
<a id="tocSorder"></a>
<a id="tocsorder"></a>

```json
{
  "id": 10,
  "petId": 198772,
  "quantity": 7,
  "shipDate": "2019-08-24T14:15:22Z",
  "status": "approved",
  "complete": true
}
```

### Attribute

| Name     | Type              | Required | Restrictions | Title | Description  |
| -------- | ----------------- | -------- | ------------ | ----- | ------------ |
| id       | integer(int64)    | false    | none         |       | none         |
| petId    | integer(int64)    | false    | none         |       | none         |
| quantity | integer(int32)    | false    | none         |       | none         |
| shipDate | string(date-time) | false    | none         |       | none         |
| status   | string(string)    | false    | none         |       | Order Status |
| complete | boolean(boolean)  | false    | none         |       | none         |

#### Enum

| Name   | Value     |
| ------ | --------- |
| status | placed    |
| status | approved  |
| status | delivered |

<h2 id="tocS_User">User</h2>

<a id="schemauser"></a>
<a id="schema_User"></a>
<a id="tocSuser"></a>
<a id="tocsuser"></a>

```json
{
  "id": 10,
  "username": "theUser",
  "firstName": "John",
  "lastName": "James",
  "email": "john@email.com",
  "password": "12345",
  "phone": "12345",
  "userStatus": 1
}
```

### Attribute

| Name       | Type           | Required | Restrictions | Title | Description |
| ---------- | -------------- | -------- | ------------ | ----- | ----------- |
| id         | integer(int64) | false    | none         |       | none        |
| username   | string(string) | false    | none         |       | none        |
| firstName  | string(string) | false    | none         |       | none        |
| lastName   | string(string) | false    | none         |       | none        |
| email      | string(string) | false    | none         |       | none        |
| password   | string(string) | false    | none         |       | none        |
| phone      | string(string) | false    | none         |       | none        |
| userStatus | integer(int32) | false    | none         |       | User Status |

<h2 id="tocS_Stocks">Stocks</h2>

<a id="schemastocks"></a>
<a id="schema_Stocks"></a>
<a id="tocSstocks"></a>
<a id="tocsstocks"></a>

```json
{
  "id": 10,
  "date": "2023-12-15T00:00:00.000Z",
  "code": "BSP",
  "short_name": "BSP",
  "bid": 10,
  "offer": 0,
  "last": 0,
  "close": 0,
  "high": 0,
  "low": 0,
  "open": 0,
  "chg_today": 0,
  "vol_today": 0,
  "num_trades": 0
}
```

### Attribute

| Name       | Type              | Required | Restrictions | Title | Description |
| ---------- | ----------------- | -------- | ------------ | ----- | ----------- |
| id         | integer(int64)    | false    | none         |       | none        |
| date       | string(date-time) | false    | none         |       | none        |
| code       | string            | false    | none         |       | none        |
| short_name | string            | false    | none         |       | none        |
| bid        | integer           | false    | none         |       | none        |
| offer      | integer           | false    | none         |       | none        |
| last       | integer           | false    | none         |       | none        |
| close      | integer           | false    | none         |       | none        |
| high       | integer           | false    | none         |       | none        |
| low        | integer           | false    | none         |       | none        |
| open       | integer           | false    | none         |       | none        |
| chg_today  | integer           | false    | none         |       | none        |
| vol_today  | integer           | false    | none         |       | none        |
| num_trades | integer           | false    | none         |       | none        |

<h2 id="tocS_Pet">Pet</h2>

<a id="schemapet"></a>
<a id="schema_Pet"></a>
<a id="tocSpet"></a>
<a id="tocspet"></a>

```json
{
  "id": 10,
  "name": "doggie",
  "category": {
    "id": 1,
    "name": "Dogs"
  },
  "photoUrls": ["string"],
  "tags": [
    {
      "id": 0,
      "name": "string"
    }
  ],
  "status": "available"
}
```

### Attribute

| Name      | Type                        | Required | Restrictions | Title | Description             |
| --------- | --------------------------- | -------- | ------------ | ----- | ----------------------- |
| id        | integer(int64)              | false    | none         |       | none                    |
| name      | string(string)              | true     | none         |       | none                    |
| category  | [Category](#schemacategory) | false    | none         |       | none                    |
| photoUrls | [string]                    | true     | none         |       | none                    |
| tags      | [[Tag](#schematag)]         | false    | none         |       | none                    |
| status    | string(string)              | false    | none         |       | pet status in the store |

#### Enum

| Name   | Value     |
| ------ | --------- |
| status | available |
| status | pending   |
| status | sold      |

<h2 id="tocS_Tag">Tag</h2>

<a id="schematag"></a>
<a id="schema_Tag"></a>
<a id="tocStag"></a>
<a id="tocstag"></a>

```json
{
  "id": 0,
  "name": "string"
}
```

### Attribute

| Name | Type           | Required | Restrictions | Title | Description |
| ---- | -------------- | -------- | ------------ | ----- | ----------- |
| id   | integer(int64) | false    | none         |       | none        |
| name | string         | false    | none         |       | none        |

<h2 id="tocS_Category">Category</h2>

<a id="schemacategory"></a>
<a id="schema_Category"></a>
<a id="tocScategory"></a>
<a id="tocscategory"></a>

```json
{
  "id": 1,
  "name": "Dogs"
}
```

### Attribute

| Name | Type           | Required | Restrictions | Title | Description |
| ---- | -------------- | -------- | ------------ | ----- | ----------- |
| id   | integer(int64) | false    | none         |       | none        |
| name | string         | false    | none         |       | none        |
