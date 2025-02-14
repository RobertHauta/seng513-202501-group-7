const express = require('express');
const cors = require('cors');
const app = express();

// Enable CORS for all routes
app.use(cors());

app.get('/api', (req, res) => {
    res.json({ "users": ["user1", "user2", "user3"] });
});

app.listen(5000, () => {
    console.log('Server listening at http://localhost:5000');
});
