# Node and NPM Versions
Node: v22.14.0
npm: 11.1.0

### Run Code with No Docker Development Mode
## Run Server
To Run Server in dev mode enter the following command from the server directory
```
npm run dev
```
## Run Client
To Run Client in dev mode enter the follwoing command from the client directory
```
npm run dev
```

Then Access localhost:3000

### Run Code With Docker Development Mode
# Ensure you are in top directory
```
docker-compose -f ./docker-compose-dev.yml up --build
```

Then Access localhost:3000

### Run Code With Docker Production Mode
# Ensure you are in top directory and run this from terminal
```
docker-compose -f ./docker-compose-prod.yml up --build
```

Then Access localhost:3000

### Note: Make Sure to have docker desktop open
