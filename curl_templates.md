# Creating New User
```
curl -X POST http://localhost:5000/api/register -H "Content-Type: application/json" -d "{\"name\": \"RobertTeat\", \"email\": \"robert@gmail.com\", \"password\": \"Robbie123\", \"role_id\": 1}"
```

# Login
```
curl -X GET http://localhost:5000/api/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\": \"robert@gmail.com\", \"password\": \"Robbie123\"}"

```

# Delete User
```
curl -X DELETE http://localhost:5000/api/users ^
  -H "Content-Type: application/json" ^
  -d "{\"email\": \"robert@gmail.com\"}"
```