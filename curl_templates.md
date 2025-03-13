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
# Get User Classrooms
curl -X GET "http://localhost:5000/api/classrooms?userId=42" -H "Content-Type: application/json"

# Add Student to Class
curl -X POST http://localhost:5000/api/classrooms \
  -H "Content-Type: application/json" \
  -d "{\"userId\": 42, \"classroom_id\": 101, \"role_id\": 3}"