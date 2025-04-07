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
const getQuizzesForStudent = async (req, res) => {
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

//Function to create a question for a quiz
const createQuestion = async (req, res) => {
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

const quizQueries = {
    getQuizzesForStudent,
    createQuiz,
    createQuestion
};

export default quizQueries;
