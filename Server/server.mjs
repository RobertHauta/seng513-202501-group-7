import express from 'express';
import cors from 'cors';
import queries from './queries.mjs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

try {
    dotenv.config({
        override: true,
        path: path.join(__dirname, 'Environments/neon_dev.env')
    });
} catch (error) {
    console.error('Error loading environment variables:', error);
    process.exit(1);
}

// Enable CORS for all routes
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Parses URL-encoded data

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

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
  
app.get('/api/verifyRole', (req, res) => {
    queries.users.verifyUserRole(req, res);
});

// Classroom endpoints
app.post('/api/classrooms/create', (req, res) => {
    queries.classes.createClassroom(req, res);
});

app.get('/api/classrooms/:userId', (req, res) => {
    // This function should handle retrieving a user's classrooms.
    queries.users.getUserClassrooms(req, res);
});

app.get('/api/classrooms/professors/:userId', (req, res) => {
    // This function should handle retrieving a user's classrooms.
    queries.users.getProfessorClassrooms(req, res);
});

app.post('/api/classrooms/add', (req, res) => {
    // This function should handle adding a student to a class.
    queries.classes.addStudentToClass(req, res);
});

app.post('/api/classrooms/question', (req, res) => {
    queries.classroomQuestions.createClassroomQuestion(req, res);
}); 

app.listen(5100, () => {
    console.log('Server listening at http://localhost:5100');

});