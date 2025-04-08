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

const sha256 = async function sha256(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

const getUserByNamePass = async (request, response) => {
    const client = await postgresPool.connect();
    const {email, password} = request.body;
    const hash = await sha256(password);
    try {
        const { rows } = await client.query(
            `SELECT users.name AS user_name, roles.name AS role_name, users.password_hash AS password_hash, users.id as user_id
             FROM users
             JOIN roles ON roles.id = users.role_id
             WHERE users.email = $1`,
            [email]
        );
        
        if (rows.length === 0) {
            response.status(400).send('User not found');
            return;
        }
        const user = rows[0];  
        const isMatch = hash === user.password_hash;
        
        if (!isMatch) {
            response.status(401).send('Invalid credentials');
            return;
        }

        delete user.password_hash;
        response.json(user);
    } catch (error) {
        console.error('Error connecting to the database:', error);
        response.status(500).send('Error connecting to the database');
        return;
    } finally {
        client.release();
    }
}

const createNewUser = async (request, response) => {
    const client = await postgresPool.connect();

    const { name, email, password, role_id } = request.body;
    const passwordHash = await sha256(password);

    try{
        const { rows } = await client.query(
            `SELECT * FROM users WHERE email = $1`,
            [email]
        );
        
        if (rows.length > 0) {
            response.status(409).send('User with this email already exists');
            return;
        }
    }catch (error) {
        request.status(500).send('Error creating user');
        console.error('Error connecting to the database:', error);
        return;
    }

    try {
        await client.query(
            `INSERT INTO users (name, email, password_hash, role_id)
             VALUES ($1, $2, $3, $4)`,
            [name, email, passwordHash, role_id]
        );

        response.status(201).send('User created');
    } catch (error) {
        response.status(500).send('Error creating user');
        console.error('Error connecting to the database:', error);
        return;
    } finally {
        client.release();
    }
}

const deleteUserByEmail = async (request, response) => {
    const client = await postgresPool.connect();
    const {email} = request.body;

    try {
        await client.query(
            `DELETE FROM users WHERE email = $1`,
            [email]
        );

        response.status(200).send('User deleted');
    } catch (error) {
        response.status(500).send('Error deleting user');
        console.error('Error connecting to the database:', error);
        return;
    } finally {
        client.release();
    }
}

// Function to retrieve classrooms for a given user ID (from query parameters)
const getUserClassrooms = async (request, response) => {
    const userId = request.params.userId; 
    console.log(request.params);
    console.log(`Getting classrooms for user ID: ${userId}`);
    if (!userId) {
      response.status(400).json({ error: 'User ID is required' });
      return;
    }
  
    const client = await postgresPool.connect();
    try {
      const query = `
        SELECT cm.user_id, c.professor_id AS professor_id, c.name AS name, u.name AS professor_name
        FROM classroommembers cm
        JOIN classrooms c ON c.id = cm.classroom_id
        JOIN users u ON u.id = c.professor_id
        WHERE cm.user_id = $1
      `;
      const { rows } = await client.query(query, [userId]);
      console.log('Retrieved classrooms:', rows);
      response.json({ classrooms: rows });
    } catch (error) {
      console.error('Error fetching classrooms:', error);
      response.status(500).json({ error: 'Internal server error' });
    } finally {
      client.release();
    }
};

// Function to retrieve classrooms for a given user ID (from query parameters)
const getProfessorClassrooms = async (request, response) => {
    const userId = request.params.userId; 
    console.log(request.params);
    console.log(`Getting classrooms for user ID: ${userId}`);
    if (!userId) {
      response.status(400).json({ error: 'User ID is required' });
      return;
    }
  
    const client = await postgresPool.connect();
    try {
      const query = `
        SELECT classrooms.id AS id, classrooms.name AS name, professor_id, u.name AS professor_name
        FROM classrooms
        JOIN users u ON u.id = classrooms.professor_id
        WHERE professor_id = $1
      `;
      const { rows } = await client.query(query, [userId]);
      console.log('Retrieved classrooms:', rows);
      response.json({ classrooms: rows });
    } catch (error) {
      console.error('Error fetching classrooms:', error);
      response.status(500).json({ error: 'Internal server error' });
    } finally {
      client.release();
    }
};

const verifyUserRole = async (req, res) => {
    const { userId, expectedRoleId } = req.query; 
  
    if (!userId || !expectedRoleId) {
      return res.status(400).json({ error: 'User ID and expected role ID are required' });
    }
  
    const client = await postgresPool.connect();
    try {
      const query = `
        SELECT role_id
        FROM Users
        WHERE id = $1
      `;
      const { rows } = await client.query(query, [userId]);
  
      if (rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      const actualRoleId = rows[0].role_id;
  
      // Check if the actual role matches the expected role
      if (parseInt(expectedRoleId, 10) === actualRoleId) {
        return res.status(200).json({ valid: true, role: actualRoleId });
      } else {
        return res.status(403).json({ valid: false, role: actualRoleId, error: 'User does not have the expected role' });
      }
    } catch (error) {
      console.error('Error verifying user role:', error);
      return res.status(500).json({ error: 'Internal server error' });
    } finally {
      client.release();
    }
};

const userQueries = {
    getUserByNamePass,
    createNewUser,
    deleteUserByEmail,
    getUserClassrooms,
    verifyUserRole,
    getProfessorClassrooms
};

export default userQueries;
