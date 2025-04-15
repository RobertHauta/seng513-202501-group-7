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

//The next 3 apis should be called in order
//Call the check submission first to see if the quiz has been submitted by the student first
//It will return a boolean for if it was submitted or not
app.get('/api/quiz/check-submission/:quizId/:studentId', (req, res) => {
    queries.quiz.checkStudentSubmitted(req, res);
});

//If it was submitted, then use this api, it will recieve the a whole bunch of stuff, take a look at what is selected
//it will basically retrieve the questions along with the options of the questions and also the submitted answers for the student for each question
//Should work no matter what type of question it is like matching or true/false or written (hopefully)
//Example output as below (I think)
// {
//     "submittedQuizQuestions": [
//       {
//         "question_id": 1,
//         "question_text": "What is the capital of France?",
//         "marks": 5,
//         "correct_answer": "Paris",
//         "options": [
//           { "option_id": 1, "option_text": "Paris", "is_correct": true },
//           { "option_id": 2, "option_text": "London", "is_correct": false },
//           { "option_id": 3, "option_text": "Berlin", "is_correct": false }
//         ],
//         "student_answers": [ "Paris" ]
//       },
//       {
//         "question_id": 2,
//         "question_text": "Which is a fruit",
//         "marks": 3,
//         "correct_answer": "Orange, Apple",
//         "options": [
//           { "option_id": 4, "option_text": "Orange", "is_correct": true },
//           { "option_id": 5, "option_text": "Apple", "is_correct": true }.
//           { "option_id": 6, "option_text": "A shirt", "is_correct": false }
//         ],
//         "student_answers": [ "orange, apple" ]
//       }
//     ]
// }
// Careful about "correct_answer": "Orange, Apple", as that is from Questions.correct_answer, which just holds a string, for questions with multiple answers,
// We need to make sure to input both answers. Same for the api below
app.get('/api/quiz/submitted/:quizId/:studentId', (req, res) => {
    queries.quiz.getSubmittedQuiz(req, res);
});

//If it was not submitted, we just get the questions and the options for the quiz, please check yourself to see what is selected
// Example output as below (I think)
// {
//     "quizQuestions": [
//       {
//         "question_id": 1,
//         "question_text": "What is the capital of France?",
//         "marks": 5,
//         "correct_answer": "Paris",
//         "options": [
//           { "option_id": 1, "option_text": "Paris", "is_correct": true },
//           { "option_id": 2, "option_text": "London", "is_correct": false },
//           { "option_id": 3, "option_text": "Berlin", "is_correct": false }
//         ]
//       },
//       {
//         "question_id": 2,
//         "question_text": "What is 9 + 10?",
//         "marks": 6,
//         "correct_answer": "21",
//         "options": [
//           { "option_id": 4, "option_text": "19", "is_correct": false },
//           { "option_id": 5, "option_text": "21", "is_correct": true }
//         ]
//       }
//     ]
// }
app.get('/api/quiz/unansweredQuiz/:quizId', (req, res) => {
    queries.quiz.getUnansweredQuiz(req, res);
});


app.get('/api/quiz/:quizId/:classroomId', (req, res) => {
    // This is for when a professor or a TA clicks on a quiz, taking them to a page where they see a class list with the students scores
    // Retrieves the students id as u.id, students name as u.name, and students grade as g.score (will be null if the quiz is not done)
    // Pass In: quizId, classroomId
    queries.quiz.getQuizClassList(req, res);
});

app.listen(5100, () => {
    console.log('Server listening at http://localhost:5100');
});