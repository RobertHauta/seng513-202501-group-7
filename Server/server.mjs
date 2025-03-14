import express from 'express';
import cors from 'cors';
import queries from './queries.mjs';
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
app.use(express.urlencoded({ extended: true })); // Parses URL-encoded data

app.get('/api', (req, res) => {
    res.json({ "users": [{ "id": 1, "name": "John Doe" }, { "id": 2, "name": "Jane Doe" }] });
});

app.post('/api/login', (request, response) => {
    queries.users.getUserByNamePass(request, response);
});

app.post('/api/register', (request, response) => {
    queries.users.createNewUser(request, response);
});

app.delete('/api/users',(request, response) => {
    queries.users.deleteUserByEmail(request, response);
});

app.post('/api/classes/create', (request, response) => {
    queries.classes.createClassroom(request, response);
});

app.listen(5000, () => {
    console.log('Server listening at http://localhost:5000');
});
