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






// ClassroomQuestions endpoints
app.post('/api/classrooms/question', (req, res) => {
    queries.classroomQuestions.createClassroomQuestion(req, res);
}); 


app.get('/api/classrooms/classlist/:classroomId', (req, res) => {
    queries.classes.getAllStudentsInClassroom(req, res);
});


app.get('/api/classrooms/question/:classroomId', (req, res) => {
    //This is for getting all classroom questions for a specific classroom (doesn't only get unfinished classroom questions)
    // Retrieves * from classroomQuestions
    // Pass in: classroomId
    // For classroom question details when pressing a specific classroom question from home page, use (Insert API here)

    queries.classroomQuestions.getClassroomQuestions(req, res);
});

app.get('/api/classrooms/grades/:classroomId/:userId', (req, res) => {
    //This is for getting the grades for a specific student in a specific classroom
    // Retrieves * from grades
    // Pass in: classroomId, studentId
    queries.users.getStudentGrades(req, res);
});

app.get('/api/classrooms/classlist/grades/:classroomId/:pageType/:id', (req, res) => {
    //This is for getting the classlist for a specific classroom
    // Retrieves * from users
    // Pass in: classroomId, pageType (quiz or class question), id (quiz or class question id)
    queries.classes.getClassroomGrades(req, res);
});

app.get('/api/classrooms/average/:classroomId', (req, res) => {
    //This is for getting the average grade for a specific classroom
    // Retrieves * from grades
    // Pass in: classroomId
    queries.users.getClassGrades(req, res);
});

app.get('/api/classquestions/unfinished/:classroomId/:studentId', (req, res) => {
    //This is for displaying on classroom home page for a student. 
    //Gets all unfinished classroomQuestions for a specific student in a specific classroom
    // Pass in: classroomId, studentId
    queries.classroomQuestions.getUnfinishedClassQuestionsForStudent(req, res);
});

app.get('/api/classquestions/options/:questionId', (req, res) => {
    //This is for getting all options for a specific question
    // Retrieves * from options
    // Pass in: questionId
    queries.classroomQuestions.getQuestionOptions(req, res);
});

app.get('/api/classquestions/submit/:questionId/:selectedOption/:studentId', (req, res) => {
    //This is for submitting a question answer for a specific question
    // Pass in: questionId, selectedOptionId, studentId
    queries.classroomQuestions.validateCorrectAnswer(req, res);
});

app.get('/api/classquestions/answer/:studentId/:questionId', (req, res) => {
    //This is for getting the answer for a specific question for a specific student
    // Retrieves * from answers
    // Pass in: studentId, questionId
    queries.classroomQuestions.getStudentAnswer(req, res);
});

app.post('/api/assignments/update', (req, res) => {
    //This is for updating assignment details
    //Pass in: assignment_id, title, due_date for body
    queries.classes.editStudentGrade(req, res);
});

//Quiz endpoints
app.post('/api/quiz/create', (req, res) => {
    //BEFORE CALLING THIS, IN THE MIDDLEWARE, MAKE SURE TO CALL verifyUserRole aka '/api/verifyRole' to verify the professor is the one creating a quiz
    //Creates a quiz, not the questions for the quiz so call this before calling this api: /api/quizzes/question/create
    //Pass In: title, classroom_id, created_by, total_weight (default 0), release_date (default 0), due_date for body
    queries.quiz.createQuiz(req, res);
});

app.get('/api/quiz/question/options/:questionId', (req, res) => {
    //This is for getting all options for a specific question
    // Retrieves * from options
    // Pass in: questionId
    queries.quiz.getQuestionOptions(req, res);
});

app.post('/api/quiz/question/create', (req, res) => {
    //Creates a question for a quiz, doesn't work for class questions since that is in a different table. 
    //Check if professor is the one calling with /api/verifyRole first
    //Pass In: quiz_id, question_text, type_id, marks, correct_answer for body
    queries.quiz.createQuizQuestion(req, res);
});

app.get('/api/quiz/:classroomId', (req, res) => { 
    // This is for getting all quizzes for a classroom (doesn't only get unfinished quizzes)
    // Retrieves * from quizzes
    // Pass In: classroomId
    // For quiz details when pressing a specific quiz from home page, use '/api/quiz/questions/:quizId'
    queries.quiz.getQuizzes(req, res);
});

app.get('/api/quizzes/unfinished/:classroomId/:studentId', (req, res) => {
    //This is for displaying on classroom home page for a student. 
    //Pass In: classroomId, studentId
    //Gets all the quizzes for that classroom that have questions that the student has not finished
    queries.quiz.getUnfinishedQuizzesForStudent(req, res);
});

app.get('/api/quiz/question/student/:studentId/:questionId', (req, res) => {
    //This is for displaying on the quiz page for a student. 
    //Pass In: studentId, questionId
    //Gets the question details for a specific student in a specific quiz
    queries.quiz.getStudentAnswers(req, res);
});

app.get('/api/quiz/questions/:quizId', (req, res) => {
    // This is for the quiz page to display questions. Only for unfinished questions
    // Retrieves * from Questions that are associated with a specific quiz id.
    // Pass In: quizId

    queries.quiz.getQuestionsForQuiz(req, res);
});

app.post('/api/quiz/submit', (req, res) => {
    //This is for submitting a quiz answer for a specific quiz
    // Pass In: quiz_id, student_id, selected_answer for body
    queries.quiz.gradeQuiz(req, res);
});



app.listen(5100, () => {
    console.log('Server listening at http://localhost:5100');

});