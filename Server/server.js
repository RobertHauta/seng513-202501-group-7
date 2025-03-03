const express = require('express');
const cors = require('cors');
const app = express();
const path = require('path');
require('dotenv').config({
    override: true,
    path: path.join(__dirname, 'development.env')
});
const {Pool, Client} = require('pg');

// Database connection
const pool = new Pool({
    user: process.env.USER,
    host: process.env.HOST,
    database: process.env.DATABASE,
    password: process.env.PASSWORD,
    port: process.env.PORT
});
var currUser = "";
// Create a client
(async () => {
    const client = await pool.connect();
    try {
        const {rows} = await client.query('SELECT * FROM "Test_Schema"."Test_Table"')
        currUser = JSON.stringify(rows);//rows[0]["current_user"];
        console.log(currUser);
    } catch (error) {
        console.error('Error connecting to the database:', error);
    } finally{
        client.release();
    }
})();

// Enable CORS for all routes
app.use(cors());
app.get('/api', (req, res) => {
    res.json({ "users": [currUser, "user2", "user3"] });
});

app.listen(5000, () => {
    console.log('Server listening at http://localhost:5000');
});
