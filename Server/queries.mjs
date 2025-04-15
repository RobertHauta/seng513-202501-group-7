import usersQueries from './db_queries/usersQueries.mjs';
import classQueries from './db_queries/classroomQueries.mjs';
import classroomQuestionQueries from './db_queries/classroomQuestionQueries.mjs';
import quizQueries from './db_queries/quizQueries.mjs';

const queries = {
    users: usersQueries,
    classes: classQueries,
    classroomQuestions: classroomQuestionQueries,
    quiz: quizQueries
};

export default queries;