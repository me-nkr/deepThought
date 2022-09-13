# deepThought Node JS Internship Assignment
</br>

<!-- 
TODO
- [x] Clean up controller
- [x] Functions to coverup similar actions like validation
- [x] Add sorting based on dates to getEvents
- [x] Error Handling
- [x] Test Error Handling
- [x] Test Sorting
- [ ] Final Testing

[ ] Task 1 documentation
[ ] Task 2 answering -->

# Task 1 - Events API

## Endpoints

|method|endpoint|query/params|payload|description|
|--|--|--|--|--|
|GET|/events/?id=|<table><tr><td>id</td><td>id of event</td></tr></table>|-|Fetch a single event with id|
|GET|/events/?type=latest&limit=5&page=2|<table><tr><td>type</td><td>type of sort</td></tr><tr><td>limit</td><td>number of events per page</td></tr><tr><td>page</td><td>page number</td></tr></table>|-|Get list of events|
|POST|/events/|-|[payload](#payload-structure-i)|Create a new event|
|PUT|/events/id|<table><tr><td>id</td><td>id of event</td></tr></table>|[payload](#payload-structure-i)|Update an event|
|DELETE|/events/id|<table><tr><td>id</td><td>id of event</td></tr></table>|-|Delete an event|

</br>

## Payload Structure I

**Content-Type: Multipart/form-data**

|fieldname|type|description|
|--|--|--|
|uid|text|12-byte BSON ObjectId of user|
|name|text|Name of event|
|tagline|text|Tagline for the event|
|images|files|Images related to the event (minimun 1 required)|
|description|text|Description of event|
|schedule|text|Date and Time of event (format: YYYY-MM-DDTHH:mm:ssZ)|
|moderator|text|12-byte BSON ObjectId of moderating user|
|category|text|Category of event|
|sub_category|text|Sub Category of event|
|rigor_rank|text|Rigor rank of event|

</br>

## Instructions

- Clone this repo using
```
git clone https://github.com/me-nkr/deepThought.git
```

- Make sure you have node and npm installed
- `cd` into the cloned directory
- Create a `.env` file and add the following variables and their values

|environment variable|description|
|--|--|
|MONGO_SCHEME|Mongodb server url scheme|
|MONGO_USER|Mongodb server user|
|MONGO_PASS|Mongodb server password|
|MONGO_HOST|Mongodb server host address|
|MONGO_DB|Mongodb database name|

- Install dependencies
```
npm i
```
- Run the server
```
node -r dotenv/config .
```
- Click the following button and try the API

[![Run in Postman](https://run.pstmn.io/button.svg)](https://app.getpostman.com/run-collection/23172124-a29d85b9-3fae-4218-a669-309e08c106f7?action=collection%2Ffork&collection-url=entityId%3D23172124-a29d85b9-3fae-4218-a669-309e08c106f7%26entityType%3Dcollection%26workspaceId%3D90269b9e-7bec-4a77-8873-fcad6a4ea15a)

</br>

## Notes

- uid is added in the payload since there was no mention of where uid can be found at.
- Server will be launched on port 3000.

</br></br>

# Task 2 - Nudge API Documentation

## Endpoints

**baseurl : `api/v3/app`**

|method|endpoint|query/params|payload|description|
|--|--|--|--|--|
|GET|/nudges/id|<table><tr><td>id</td><td>id of nudge</td></tr></table>|-|Fetch a single nudge with id|
|GET|/nudges/?tag=tagid&sort=latest&limit=5&page=2|<table><tr><td>tag</td><td>id of tagged asset</td></tr><tr><td>sort</td><td>criteria to sort</td></tr><tr><td>limit</td><td>number of events per page</td></tr><tr><td>page</td><td>page number</td></tr></table>|-|Get a list of nudges tagged with an asset|
|GET|/nudges/?type=event&sort=latest&limit=5&page=2|<table><tr><td>type</td><td>type of asset tagged with</td></tr></table><table><tr><td>rest is same as above</td></tr></table>|-|Get a list of nudges based on type of asset tagged with|
|POST|/nudges|-|[payload](#payload-structure-ii)|Create a nudge|
|PUT|/nudges/id|<table><tr><td>id</td><td>id of nudge</td></tr></table>|[payload](#payload-structure-ii)|Update a nudge|
|DELETE|/nudges/id|<table><tr><td>id</td><td>id of nudge</td></tr></table>|-|Delete a nudge|
|DELETE|/nudges/tag|<table><tr><td>tag</td><td>id of tagged asset</td></tr></table>|-|Delete nudges tagged with an asset|


</br>

## Payload Structure II

**content-type: multipart/form-data**

|field|type|description|
|--|--|--|
|type|text|Asset type|
|uid|text|id of the creator|
|tag|text|event or article id to tag with|
|title|text|Title of event|
|cover|file|Cover image, jpg or png|
|schedule|text|Date and Time (format `YYYY-MM-DDTHH:mm:ssZ`)|
|description|text|Description of nudge|
|icon|file|Icon image, jpeg or png|
|invitation|text|Invitation message|

</br>

## Object Data Model

|field|type|note|
|--|--|--|
|type|string|"event"|
|uid|ObjectId|userid|
|tag|ObjectId|eventid|
|title|string|60 char max|
|cover|string|link to image|
|schedule|DateTime|-|
|description|string|-|
|icon|string|link to image|
|invitation|string|-|

</br>

## Notes

- Either one of the `tag` or `type` should be present in query of GET endpoints, if both are present ignore the `type` and focus on the `tag`
- Store images on a filesystem either locally or on cloud. Rename the images to `nudgeid_[cover/icon].[jpg/png]`
- While writing to database create the nudge, get its id, and then update with the image.