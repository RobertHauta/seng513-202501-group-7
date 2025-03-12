import express from 'express';
import cors from 'cors';
import db from './queries.mjs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

dotenv.config({
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

app.delete('/api/users',(request, response) => {
    db.default.users.deleteUserByEmail(request, response);
});

app.listen(5000, () => {
    console.log('Server listening at http://localhost:5000');
});
