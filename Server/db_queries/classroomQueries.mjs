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

// Function to create a new Classroom
const createClassroom = async (request, response) => {
    const { userId, name, role_id } = request.body;
    
    if (!userId) {
      response.status(400).json({ error: 'User ID is required' });
      return;
    }
    if (!name) {
      response.status(400).json({ error: 'Classroom name is required' });
      return;
    }
    if (!role_id) {
      response.status(400).json({ error: 'Role id is required' });
      return;
    }

    if(role_id != 1){
      response.status(400).json({ error: 'The user creating the classroom does not have the professor role' });
      return;
    }
    
    const client = await postgresPool.connect();
    try {
      const query = `
        INSERT INTO Classrooms (name, professor_id)
        VALUES ($1, $2)
        RETURNING *
      `;
      const { rows } = await client.query(query, [name, userId]);
      response.json({ classroom: rows[0] });
    } catch (error) {
      console.error('Error creating classroom:', error);
      response.status(500).json({ error: 'Internal server error' });
    } finally {
      client.release();
    }
  };

// Function to add a new classroom membership (adding a student to a class)
const addStudentToClass = async (request, response) => {
    const { userId, classroom_id, role_id } = request.body;
    
    if (!userId) {
      response.status(400).json({ error: 'User ID is required' });
      return;
    }
    if (!classroom_id) {
      response.status(400).json({ error: 'Classroom id is required' });
      return;
    }
    if (!role_id) {
      response.status(400).json({ error: 'Role id is required' });
      return;
    }
    
    const client = await postgresPool.connect();
    try {
      const query = `
        INSERT INTO "classroommembers" (user_id, classroom_id, role_id)
        VALUES ($1, $2, $3)
        RETURNING *
      `;
      const { rows } = await client.query(query, [userId, classroom_id, role_id]);
      response.json({ membership: rows[0] });
    } catch (error) {
      console.error('Error inserting classroom membership:', error);
      response.status(500).json({ error: 'Internal server error' });
    } finally {
      client.release();
    }
};


export default {
    createClassroom,
    addStudentToClass
};

