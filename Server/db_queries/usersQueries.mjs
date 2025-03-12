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
            `SELECT users.name AS user_name, roles.name AS role_name, users.password_hash AS password_hash
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

export default {
    getUserByNamePass,
    createNewUser,
    deleteUserByEmail
};