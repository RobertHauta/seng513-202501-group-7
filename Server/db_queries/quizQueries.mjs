import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import pg from 'pg';
const Pool = pg.Pool;
import dotenv from 'dotenv';
dotenv.config({
    override: true,
    path: path.join(__dirname, '../Environments/neon_dev.env')
});


// Database connection
const postgresPool = new Pool({
    connectionString: process.env.DATABASE_URL
});

const createQuiz = async (req, res) => {
    const { title,
      classroom_id,
      created_by,
      total_weight,
      release_date,
      due_date 
    } = req.body;
  
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    if (!classroom_id) {
      return res.status(400).json({ error: 'classroom_id is required' });
    }
    if (!created_by) {
      return res.status(400).json({ error: 'created_by is required' });
    }
    if (!due_date) {
      return res.status(400).json({ error: 'due_date is required' });
    }
  
    // Use total_weight or default to 0.0
    const effectiveTotalWeight = total_weight ?? 0.0;
    // Use release_date or default to current date/time in ISO format
    const effectiveReleaseDate = release_date || new Date().toISOString();
  
    const client = await postgresPool.connect();
    try {
      const query = `
        INSERT INTO Quizzes (title, classroom_id, created_by, total_weight, release_date, due_date)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `;
      const { rows } = await client.query(query, [
        title,
        classroom_id,
        created_by,
        effectiveTotalWeight,
        effectiveReleaseDate,
        due_date
      ]);
      return res.status(201).json({ quiz: rows[0] });
    } catch (error) {
      console.error('Error creating quiz:', error);
      return res.status(500).json({ error: 'Internal server error' });
    } finally {
      client.release();
    }
};

// Function to get quizzes
const getQuizzes = async (req, res) => {
    // Retrieve classroomId from the URL parameters
    const { classroomId } = req.params;
    if (!classroomId) {
      return res.status(400).json({ error: 'Classroom ID is required' });
    }
  
    const client = await postgresPool.connect();
    try {
      const query = `
        SELECT *
        FROM Quizzes
        WHERE classroom_id = $1
      `;
      const { rows } = await client.query(query, [classroomId]);
      return res.status(200).json({ quizzes: rows });
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      return res.status(500).json({ error: 'Internal server error' });
    } finally {
      client.release();
    }
};

//Retrieves unfinished quizzes for a student based on classroomid and studentId
const getUnfinishedQuizzesForStudent = async (req, res) => {
  const { classroomId, studentId } = req.params;

  if (!classroomId || !studentId) {
    return res.status(400).json({ error: 'Classroom ID and student ID are required' });
  }

  const client = await postgresPool.connect();
  try {
    const query = `
      SELECT q.*
      FROM Quizzes q
      WHERE q.classroom_id = $1
        AND EXISTS (
          SELECT 1
          FROM Questions qt
          WHERE qt.quiz_id = q.id
            AND NOT EXISTS (
              SELECT 1
              FROM StudentAnswers sa
              WHERE sa.question_id = qt.id
                AND sa.student_id = $2
            )
        )
    `;
    const { rows } = await client.query(query, [classroomId, studentId]);
    return res.status(200).json({ quizzes: rows });
  } catch (error) {
    console.error('Error fetching unfinished quizzes:', error);
    return res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
};

//Function to create a question for a quiz
const createQuizQuestion = async (req, res) => {
  const { 
    quiz_id, 
    question_text, 
    type_id, marks, 
    correct_answer 
  } = req.body;

  if (!quiz_id) {
    return res.status(400).json({ error: 'Quiz ID is required' });
  }
  if (!question_text) {
    return res.status(400).json({ error: 'Question text is required' });
  }
  if (!type_id) {
    return res.status(400).json({ error: 'Question type id is required' });
  }
  if (!correct_answer) {
    return res.status(400).json({ error: 'Correct answer is required' });
  }

  const client = await postgresPool.connect();
  try {
    const queryText = `
      INSERT INTO Questions (quiz_id, question_text, type_id, marks, correct_answer)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const { rows } = await client.query(queryText, [quiz_id, question_text, type_id, marks, correct_answer]);
    return res.status(201).json({ question: rows[0] });
  } catch (error) {
    console.error('Error creating question:', error);
    return res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
};

const getQuestionsForQuiz = async (req, res) => {
  const { quizId } = req.params;
  if (!quizId) {
    return res.status(400).json({ error: 'Quiz ID is required' });
  }
  
  const client = await postgresPool.connect();
  try {
    const queryText = `
      SELECT *
      FROM Questions
      WHERE quiz_id = $1
    `;
    const { rows } = await client.query(queryText, [quizId]);
    return res.status(200).json({ questions: rows });
  } catch (error) {
    console.error('Error fetching questions for quiz:', error);
    return res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
};

const getQuizClassList = async (req, res) => {
  const { quizId, classroomId } = req.params;

  if (!quizId) {
    return res.status(400).json({ error: 'Quiz ID is required' });
  }
  if (!classroomId) {
    return res.status(400).json({ error: 'Classroom ID is required' });
  }
  
  const client = await postgresPool.connect();
  try {
    const queryText = `
      SELECT u.id, u.name, g.score
      FROM Users u
      JOIN ClassroomMembers cm ON cm.user_id = u.id
      LEFT JOIN Grades g ON g.student_id = u.id AND g.quiz_id = $1
      WHERE u.role_id = 3 AND cm.classroom_id = $2
    `;
    const { rows } = await client.query(queryText, [quizId, classroomId]);
    return res.status(200).json({ quizStudents: rows });
  } catch (error) {
    console.error('Error fetching students grades:', error);
    return res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
};

const checkStudentSubmitted = async (req, res) => {
  const { quizId, studentId } = req.params;

  if (!quizId) {
    return res.status(400).json({ error: 'Quiz ID is required' });
  }
  if (!studentId) {
    return res.status(400).json({ error: 'Student ID is required' });
  }
  
  const client = await postgresPool.connect();
  try {
    const queryText = `
      SELECT count(*)
      FROM Grades
      WHERE quiz_id = $1 and student_id = $2
    `;
    const { rows } = await client.query(queryText, [quizId, studentId]);
    const count = parseInt(rows[0].count, 10);
    return res.status(200).json({ submittedQuiz: count > 0 });
  } catch (error) {
    console.error('Error fetching if student has submitted:', error);
    return res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
};

const getSubmittedQuiz = async (req, res) => {
  const { quizId, studentId } = req.params;

  if (!quizId) {
    return res.status(400).json({ error: 'Quiz ID is required' });
  }
  if (!studentId) {
    return res.status(400).json({ error: 'Student ID is required' });
  }
  
  const client = await postgresPool.connect();
  try {
    const queryText = `
      SELECT 
        q.id AS question_id,
        q.question_text,
        q.marks,
        q.correct_answer,
        jsonb_agg(DISTINCT jsonb_build_object(
          'option_id', o.id,
          'option_text', o.option_text,
          'is_correct', o.is_correct
        )) FILTER (WHERE o.id IS NOT NULL) AS options,
        jsonb_agg(DISTINCT sa.selected_answer) FILTER (WHERE sa.selected_answer IS NOT NULL) AS student_answers
      FROM questions q
      LEFT JOIN StudentAnswers sa 
        ON sa.question_id = q.id AND sa.student_id = $2
      LEFT JOIN Options o 
        ON o.question_id = q.id
      WHERE q.quiz_id = $1
      GROUP BY q.id, q.question_text, q.marks, q.correct_answer
    `;
    const { rows } = await client.query(queryText, [quizId, studentId]);
    return res.status(200).json({ submittedQuizQuestions: rows });
  } catch (error) {
    console.error('Error fetching students submitted quiz:', error);
    return res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
};

const getUnansweredQuiz = async (req, res) => {
  const { quizId } = req.params;

  if (!quizId) {
    return res.status(400).json({ error: 'Quiz ID is required' });
  }
  
  const client = await postgresPool.connect();
  try {
    const queryText = `
      SELECT 
        q.id AS question_id,
        q.question_text,
        q.marks,
        q.correct_answer,
        jsonb_agg(DISTINCT jsonb_build_object(
          'option_id', o.id,
          'option_text', o.option_text,
          'is_correct', o.is_correct
        )) FILTER (WHERE o.id IS NOT NULL) AS options
      FROM questions q
      LEFT JOIN Options o 
        ON o.question_id = q.id
      WHERE q.quiz_id = $1
      GROUP BY q.id, q.question_text, q.marks, q.correct_answer
    `;
    const { rows } = await client.query(queryText, [quizId]);
    return res.status(200).json({ quizQuestions: rows });
  } catch (error) {
    console.error('Error fetching quiz details (not submitted):', error);
    return res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
};


const quizQueries = {
    getQuizzes,
    getUnfinishedQuizzesForStudent,
    createQuiz,
    createQuizQuestion,
    getQuestionsForQuiz,
    getQuizClassList,
    checkStudentSubmitted,
    getSubmittedQuiz,
    getUnansweredQuiz
};

export default quizQueries;