# Travel Agency
https://github.com/Paptop/TravelAgency
The main topic for tasks 1,2,3 is traveling website.
The program shows very simplistic usage of Mongoose + MongoDB  with a simple frontend.
## Installation
See the package.json for requirements

 "body-parser": "^1.19.0",
  "express": "^4.17.1",
  "express-handlebars": "^5.2.0",
  "mongoose": "^5.11.8"

The project uses MongoDB.

## SetUp
There are two scrips specified start_db.sh and clear_db.sh

start_db will lauch mongodb at current directory with {REPO_PATH}/var/db\
it is neccesary to launch the mongodb first

mongodb://localhost:27017

clear_db will delete the db

1. npm install
2. sudo sh start_db
3. Open another terminal
4. node populate.js. Will put some data into the db
5. node travelagency.js
 
## Structure
The project has two main files travelagency.js and model.js.\
The db schemes and calls are stored in model\
The application get and post requests are in the travelagency.js

The db consists of base model Tour and sub models Sightseeing and Cruise.\
The db also consists of the model Prices. The Tour model has a reference attribute for Price model.

## Usage
/tours/list - lists all the available tours\
/tours/insert - inserts the new instance to db

/tours/update - updates the child attributes of tours by specified id depending on their type.

Example: unique_id=5ff0bb1e8620e0b1d9ffec07
Depending on the type of the tour the override methods will be called to render proper view and update the proper tour
The unique_id is the object._id of the objects

/tours/search - search the tour by user id or name\
/tours/delete - delete the tour by specified unique id

/prices/list - lists all the available prices\
/prices/insert - inserts the new instance of prices to db\
/prices/set_tour - injects the price id to the tour object by specified id's\
/prices/find_tour - finds the tours by specified sku //3rd task
