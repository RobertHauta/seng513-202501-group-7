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

const buildMultipleChoicesQuery = async (request, response) => {
  console.log(request.body);
  const {
    userId,
    role_id,
    classroom_id,
    question_text,
    type_id,
    correct_answer,
    posted_at,
    weight,
    expiry_time,
    option_text1,
    is_correct1,
    option_text2,
    is_correct2,
    option_text3,
    is_correct3,
    option_text4,
    is_correct4,
    name
  } = request.body;

  if (!userId) {
    return response.status(400).json({ error: 'User ID is required' });
  }
  if (!role_id) {
    return response.status(400).json({ error: 'Role id is required' });
  }
  if (role_id != 1) {
    return response.status(400).json({ error: 'The user creating the classroom question does not have the professor role' });
  }
  if (!classroom_id) {
    return response.status(400).json({ error: 'Classroom ID is required' });
  }
  if (!question_text) {
    return response.status(400).json({ error: 'Question text is required' });
  }
  if (!type_id) {
    return response.status(400).json({ error: 'Question type id is required' });
  }
  if (!correct_answer) {
    return response.status(400).json({ error: 'Correct answer is required' });
  }
  if (!expiry_time) {
    return response.status(400).json({ error: 'Expiry time is required' });
  }
  if (!weight && weight < 0) {
    return response.status(400).json({ error: 'Weight must be a non-negative number' });
  }
  if (!option_text1) {
    return response.status(400).json({ error: 'Option text 1 is required' });
  }
  if (typeof is_correct1!== 'boolean') {
    return response.status(400).json({ error: 'Is correct 1 must be a boolean' });
  }
  if (!option_text2) {
    return response.status(400).json({ error: 'Option text 2 is required' });
  }
  if (typeof is_correct2!== 'boolean') {
    return response.status(400).json({ error: 'Is correct 2 must be a boolean' });
  }
  if (!option_text3) {
    return response.status(400).json({ error: 'Option text 3 is required' });
  }
  if (typeof is_correct3!== 'boolean') {
    return response.status(400).json({ error: 'Is correct 3 must be a boolean' });
  }
  if (!option_text4) {
    return response.status(400).json({ error: 'Option text 4 is required' });
  }
  if (typeof is_correct4!== 'boolean') {
    return response.status(400).json({ error: 'Is correct 4 must be a boolean' });
  }
  if (!name) {
    return response.status(400).json({ error: 'Classroom name is required' });
  }

  const client = await postgresPool.connect();
    try {
      const effectivePostedAt = posted_at || new Date().toISOString();
      const query = `
        WITH parent AS (
            INSERT INTO ClassQuestions (name, classroom_id, question_text, type_id, correct_answer, posted_at, weight, expiry_time)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING id
        )
        INSERT INTO options (class_question_id, option_text, is_correct)
        SELECT parent.id, $9, $10::BOOLEAN FROM parent
        UNION ALL
        SELECT parent.id, $11, $12::BOOLEAN FROM parent
        UNION ALL
        SELECT parent.id, $13, $14::BOOLEAN FROM parent
        UNION ALL
        SELECT parent.id, $15, $16::BOOLEAN FROM parent;
      `;
      const { rows } = await client.query(query, [
        name,
        classroom_id,
        question_text,
        type_id,
        correct_answer,
        effectivePostedAt,
        weight ?? 0,
        expiry_time,
        option_text1,
        is_correct1,
        option_text2,
        is_correct2,
        option_text3,
        is_correct3,
        option_text4,
        is_correct4
      ]);
      return response.json({ classQuestion: rows[0] });
    } catch (error) {
      console.error('Error creating classroom question:', error);
      return response.status(500).json({ error: 'Internal server error' });
    } finally {
      client.release();
    }
}

const buildTrueFalseQuestionQuery = async (request, response) => {
  console.log(request.body);
  const {
    userId,
    role_id,
    classroom_id,
    question_text,
    type_id,
    correct_answer,
    posted_at,
    weight,
    expiry_time,
    name
  } = request.body;

  if (!userId) {
    return response.status(400).json({ error: 'User ID is required' });
  }
  if (!role_id) {
    return response.status(400).json({ error: 'Role id is required' });
  }
  if (role_id != 1) {
    return response.status(400).json({ error: 'The user creating the classroom question does not have the professor role' });
  }
  if (!classroom_id) {
    return response.status(400).json({ error: 'Classroom ID is required' });
  }
  if (!question_text) {
    return response.status(400).json({ error: 'Question text is required' });
  }
  if (!type_id) {
    return response.status(400).json({ error: 'Question type id is required' });
  }
  if (!correct_answer) {
    return response.status(400).json({ error: 'Correct answer is required' });
  }
  if (!expiry_time) {
    return response.status(400).json({ error: 'Expiry time is required' });
  }
  if (!weight && weight < 0) {
    return response.status(400).json({ error: 'Weight must be a non-negative number' });
  }
  if (!name) {
    return response.status(400).json({ error: 'Classroom name is required' });
  }

  const client = await postgresPool.connect();
    try {
      const effectivePostedAt = posted_at || new Date().toISOString();
      const query = `
        INSERT INTO ClassQuestions (name, classroom_id, question_text, type_id, correct_answer, posted_at, weight, expiry_time)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id
      `;
      const { rows } = await client.query(query, [
        name,
        classroom_id,
        question_text,
        type_id,
        correct_answer,
        effectivePostedAt,
        weight ?? 0,
        expiry_time,
      ]);
      return response.json({ classQuestion: rows[0] });
    } catch (error) {
      console.error('Error creating classroom question:', error);
      return response.status(500).json({ error: 'Internal server error' });
    } finally {
      client.release();
    }
}

// Function to create a new Classroom Question
const createClassroomQuestion = async (request, response) => {
    if(request.body.type_id === 1) {
      return buildMatchingQuestionQuery(request, response);
    } else if (request.body.type_id === 2) {
      return buildMultipleChoicesQuery(request, response);
    } else if(request.body.type_id === 3){ 
      return buildTrueFalseQuestionQuery(request, response);
    } else{
      return response.status(400).json({ error: 'Invalid question type' });
    }
  };


// Function to retrieve classroom questions for a given classroom
const getClassroomQuestions = async (req, res) => {
  const { classroomId } = req.params;
  if (!classroomId) {
    return res.status(400).json({ error: 'Classroom ID is required' });
  }

  const client = await postgresPool.connect();
  try {
    const query = `
      SELECT *
      FROM ClassQuestions
      WHERE classroom_id = $1
    `;
    const { rows } = await client.query(query, [classroomId]);
    return res.status(200).json({ questions: rows });
  } catch (error) {
    console.error('Error retrieving classroom questions:', error);
    return res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
};

const getUnfinishedClassQuestionsForStudent = async (req, res) => {
  const { classroomId, studentId } = req.params;

  if (!classroomId) {
    return res.status(400).json({ error: 'Classroom ID is required' });
  }
  if (!studentId) {
    return res.status(400).json({ error: 'Student ID is required' });
  }

  const client = await postgresPool.connect();
  try {
    const query = `
      SELECT cq.*
      FROM ClassQuestions cq
      WHERE cq.classroom_id = $1
        AND NOT EXISTS (
          SELECT 1
          FROM StudentAnswers sa
          WHERE sa.class_question_id = cq.id
            AND sa.student_id = $2
        )
    `;
    const { rows } = await client.query(query, [classroomId, studentId]);
    return res.status(200).json({ classQuestions: rows });
  } catch (error) {
    console.error('Error fetching unfinished class questions:', error);
    return res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
};

const getQuestionOptions = async (req, res) => {
  const { questionId } = req.params;
  if (!questionId) {
    return res.status(400).json({ error: 'Question ID is required' });
  }
  const client = await postgresPool.connect();

  try{
    const query = `
      SELECT *
      FROM Options
      WHERE class_question_id = $1
    `;
    const { rows } = await client.query(query, [questionId]);
    return res.status(200).json({ options: rows });
  } catch (error) {
    console.error('Error fetching question options:', error);
    return res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
};

export default {
    createClassroomQuestion,
    getClassroomQuestions,
    getUnfinishedClassQuestionsForStudent,
    getQuestionOptions
};
