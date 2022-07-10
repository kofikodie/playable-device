# Node.js coding challenge
This project built using docker and there are three components:
1. **Redis**: caching layer for the application. To store all device that can stream contents on the website per user.
2. **MongoDB**: database layer for the application. To store all device that can stream contents on the website per user.
3. **Backend API**: RESTful API for the application.

## Getting started
To get started, you need to:

 - Create your own docker-compose.override.yml file by
    ```bash
    cp docker-compose.override.yml.dist docker-compose.override.yml
    ```
    you can change the redis and mongodb port and the backend api port in the docker-compose.override.yml file.

 - Create an env file to store your express port and the redis and mongodb credentials.
    ```bash
    cp .env.dist .env
    ```

 - Run the following command to build the project:
   ```bash
   docker-compose build 
   ```

 - Build the dependencies needed for the project:
   ```bash
   docker-compose run --rm app npm install
   ```

 - Run the project:
   ```bash
   docker-compose up -d
   ```

## Behaviour
The backend API is built using Express.js and exposed four endpoints:
1. GET /health - returns 200 if the service is up and running
2. POST /create - create a device in the Mongodb database and returns the user id if the device does not exist, otherwise return an error message
3. POST /retrieve - save a device to Redis registering it as playable and able to stream contents 
4. POST /delete - unregister a device from Redis thus making it unavailable to stream contents

## Tests
To run the tests, you need to:
```bash
docker-compose run --rm app npm test
```
For manual testing, you can use the postman collection in the project root folder postman

## TODO
1. Add a new endpoint /update to update the device name
2. Add a new endpoint /delete to delete the device from the database