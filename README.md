# snake
FOM Project: _"Snake - Webanwendung im MEAN-Stack"_

## Build
### Frontend
* Clone this repository
* `cd` into snake-ui
* Run `npm install` to install dependencies
* Run `npm run build` to build the angular project

#### Docker Container
* Run `docker build . --build-arg host=localhost` to create the docker image
* `host` -> Hostname you will use to access UI/Backend

### Backend
* Clone this repository
* `cd` into snake-srv
* Run `npm install` to install dependencies
* Run `tsc` to compile typescript files

#### Docker Container
* Copy config_defaults.yaml to config.yaml
* Change the connectionString in config.yaml to `mongodb://mongo-db:27017/snake`
* Create a random base64 string `base64 /dev/urandom | head -c 32` and change the JWT secret value in config.yaml
* Run `docker build . ` to create the docker image

## Run
### Frontend
* Run `npm run start` to start the application (for development purposes)

### Backend
* Run `npm run start` to start the application
* Note: A MongoDB instance (declared in your config_defaults.yaml or config.yaml) is required to run the snake-srv backend!

## Build and run using docker-compose
* Define the build-var `host` in docker-compose.yaml (Hostname you will use to access UI/Backend)
* Run `docker-compose up -d --build` to build all images and run all containers
* Run `docker-compose stop/start` to stop/start all containers
* Run `docker-compose down` to destroy all containers/networks/... associated with the project

## Requirements
* Node >= 12