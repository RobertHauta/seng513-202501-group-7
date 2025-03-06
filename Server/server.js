const express = require('express');
const cors = require('cors');
const db = require('./queries.js');
const app = express();
const path = require('path');
const { request } = require('http');
require('dotenv').config({
    override: true,
    path: path.join(__dirname, 'Environments/neon_dev.env')
});

// Enable CORS for all routes
app.use(cors());
app.use(express.json());
app.get('/api', (req, res) => {
    res.json({ "users": [{ "id": 1, "name": "John Doe" }, { "id": 2, "name": "Jane Doe" }] });
});

app.get('/api/login', (request, response) => {
    db.default.users.getUserByNamePass(request, response);
});

app.post('/api/register', (request, response) => {
    db.default.users.createNewUser(request, response);
});

app.delete('/api/users/:email',(request, response) => {
    db.default.users.deleteUserByEmail(request, response);
});

app.listen(5000, () => {
    console.log('Server listening at http://localhost:5000');
});
