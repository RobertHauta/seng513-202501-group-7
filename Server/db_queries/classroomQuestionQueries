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

// Function to create a new Classroom Question
const createClassroomQuestion = async (request, response) => {
    const {
      userId,
      role_id,
      classroom_id,
      question_text,
      type_id,
      correct_answer,
      posted_at,
      weight,
      expiry_time
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
  
    const client = await postgresPool.connect();
    try {
      const effectivePostedAt = posted_at || new Date().toISOString();
  
      const query = `
        INSERT INTO ClassQuestions (classroom_id, question_text, type_id, correct_answer, posted_at, weight, expiry_time)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `;
      const { rows } = await client.query(query, [
        classroom_id,
        question_text,
        type_id,
        correct_answer,
        effectivePostedAt,
        weight ?? 0,
        expiry_time
      ]);
      return response.json({ classQuestion: rows[0] });
    } catch (error) {
      console.error('Error creating classroom question:', error);
      return response.status(500).json({ error: 'Internal server error' });
    } finally {
      client.release();
    }
  };

export default {
    createClassroomQuestion
};

