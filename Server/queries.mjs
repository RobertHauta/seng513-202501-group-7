import usersQueries from './db_queries/usersQueries.mjs';
import classQueries from './db_queries/classroomQueries.mjs';
import classroomQuestionQueries from './db_queries/classroomQuestionQueries.mjs';

const queries = {
    users: usersQueries,
    classes: classQueries,
    classroomQuestions: classroomQuestionQueries
};

export default queries;