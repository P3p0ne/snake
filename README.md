# snake
FOM Projekt

## Build
### Frontend
* Clone this repository
* `cd` into snake-ui
* Run `npm install` to install depencencies
* Run `npm run build` to build the angular project

#### Docker Container
* Run `docker build . --build-arg host=localhost` to create the docker image
* `host` -> Hostname you will take to access UI/Backend

### Backend
* Clone this repository
* `cd` into snake-srv
* Create a `config.yaml` file
* Run `npm install` to install depencencies
* Run `tsc` to compile typescript files

#### Docker Container
* Run `docker build . ` to create the docker image

## Run
### Frontend
* Run `npm run start` to start the application (for development purposes)

### Backend
* Run `npm run start` to start the application

## Build and run using `docker-compose`
* Run `docker-compose up -d --build` to build all images and start all containers
* Run `docker-compose stop/start` to stop/start all containers
* Run `docker-compose down` to destroy all containers/networks/... associated with the project

## Requirements
* Node >= 12