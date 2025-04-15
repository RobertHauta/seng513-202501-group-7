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
    console.log('Creating classroom:', { userId, name, role_id });
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
         WITH inserted AS ( 
          INSERT INTO Classrooms (name, professor_id)
          VALUES ($1, $2)
          RETURNING professor_id, id, name
        )
        SELECT
          i.professor_id AS professor_id,  
          i.id AS id,  
          i.name AS name,
          u.name AS professor_name
        FROM inserted i
        JOIN users u ON u.id = i.professor_id
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
        WITH inserted AS (
          INSERT INTO classroommembers (user_id, classroom_id, role_id)
          VALUES ($1, $2, $3)
          RETURNING user_id, classroom_id
        )
        SELECT 
          i.user_id AS user_id,  
          c.professor_id AS professor_id,  
          c.name AS name, 
          c.id AS id, 
          u.name AS professor_name
        FROM 
          inserted i
        JOIN 
          classrooms c ON c.id = i.classroom_id
        JOIN 
          users u ON u.id = c.professor_id
      `;
      const { rows } = await client.query(query, [userId, classroom_id, role_id]);
      console.log(rows);
      response.json({ membership: rows[0] });
    } catch (error) {
      console.error('Error inserting classroom membership:', error);
      response.status(500).json({ error: 'Internal server error' });
    } finally {
      client.release();
    }
};

const getClassQuestGrades = async (request, response) => {
  const { classroomId, pageType, id } = request.params;
  const client = await postgresPool.connect();
  try{
    const query = `
      SELECT
        cm.user_id AS id,
        u.name AS name,
        u.email AS email,
        sa.is_correct AS is_correct
      FROM
        classroommembers cm
      JOIN
        users u ON u.id = cm.user_id
      LEFT JOIN StudentAnswers sa ON sa.student_id = cm.user_id AND sa.question_id = $2
      WHERE
        cm.classroom_id = $1 AND cm.role_id = 3
    `;
    const { rows } = await client.query(query, [classroomId, id]);
    rows.forEach(row => {
      if(row.is_correct === null || row.is_correct === undefined || isNaN(row.is_correct)){
        row.score = "Not Submitted";
      }
      else{
        row.score = row.is_correct ? "100.00%" : "0.00%";
      }
    });
    response.json({ students: rows });
  }
  catch (error) {
    console.error('Error fetching classroom students:', error);
    response.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
}

const getQuizGrades = async (request, response) => {
  const { classroomId, pageType, id } = request.params;
  const client = await postgresPool.connect();
  try{
    const query = `
      SELECT
        cm.user_id AS id,
        u.name AS name,
        u.email AS email,
        cm.role_id AS role_id,
        g.score AS score
      FROM
        classroommembers cm
      JOIN
        users u ON u.id = cm.user_id
      LEFT JOIN Grades g on g.student_id = cm.user_id AND g.quiz_id = $2
      WHERE
        cm.classroom_id = $1 AND cm.role_id = 3
    `;
    const { rows } = await client.query(query, [classroomId, id]);
    rows.forEach(row => {
      if(row.score === null || row.score === undefined || isNaN(row.score)){
        row.score = "Not Submitted";
      }
      else{
        row.score = (row.score * 100).toFixed(2) + "%";
      }
    });
    response.json({ students: rows });
  }
  catch (error) {
    console.error('Error fetching classroom students:', error);
    response.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
}

const getAllStudentsInClassroom = async (request, response) => {
  const { classroomId } = request.params;
  console.log('Getting students in classroom:', classroomId);
  if (!classroomId) {
    response.status(400).json({ error: 'Classroom id is required' });
    return;
  }

  const client = await postgresPool.connect();
  try{
    const query = `
      SELECT
        cm.user_id AS id,
        u.name AS name,
        u.email AS email,
        cm.role_id AS role_id
      FROM
        classroommembers cm
      JOIN
        users u ON u.id = cm.user_id
      WHERE
        cm.classroom_id = $1
    `;
    const { rows } = await client.query(query, [classroomId]);

    const query2 = `
      SELECT
        c.professor_id AS professor_id,
        u.name AS name,
        u.email AS email,
        u.role_id AS role_id
      FROM classrooms c
      JOIN users u ON u.id = c.professor_id
      WHERE c.id = $1
    `;

    const { rows: rows2 } = await client.query(query2, [classroomId]);


    response.json({ students: [...rows2, ...rows] });
  }
  catch (error) {
    console.error('Error fetching classroom students:', error);
    response.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
};

const getClassroomGrades = async (request, response) => {
  const { classroomId, pageType, id } = request.params;
  console.log('Getting students in classroom:', classroomId);
  if (!classroomId) {
    response.status(400).json({ error: 'Classroom id is required' });
    return;
  }
  if([1,2].includes(parseInt(pageType)) === false){
    response.status(400).json({ error: 'Page type should be either 1, 2 or 3' });
    return;
  }
  if(!id){
    response.status(400).json({ error: 'Student id is required' });
    return;
  }

  if(pageType == 1){
    getQuizGrades(request, response);
  } else if(pageType == 2){
    getClassQuestGrades(request, response);
  }
};

const editQuizGrade = async (request, response) => {
  const { assignmentId, pageType, studentId, score } = request.body;
  
  const client = await postgresPool.connect();
  try{
    const query = `
      UPDATE Grades
      SET score = $2
      WHERE student_id = $3 AND quiz_id = $1
      RETURNING *
    `;
    const { rows } = await client.query(query, [assignmentId, score, studentId]);
    response.json({ grade: rows[0] });
  }catch (error) {
    console.error('Error updating grade:', error);
    response.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
};

const editClassQuestGrade = async (request, response) => {
  const { assignmentId, pageType, studentId, score } = request.body;
  
  const client = await postgresPool.connect();
  try{
    const query = `
      UPDATE StudentAnswers
      SET is_correct = $2
      WHERE student_id = $3 AND question_id = $1
      RETURNING *
    `;
    const { rows } = await client.query(query, [assignmentId, score, studentId]);
    response.json({ grade: rows[0] });
  } catch (error) {
    console.error('Error updating grade:', error);
    response.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
};

const editStudentGrade = async (request, response) => {
  const { assignmentId, pageType, studentId, score } = request.body;
  if (!assignmentId) {
    response.status(400).json({ error: 'Classroom id is required' });
    return;
  }
  if([1,2].includes(parseInt(pageType)) === false){
    response.status(400).json({ error: 'Page type should be either 1, 2 or 3' });
    return;
  }
  if(!studentId){
    response.status(400).json({ error: 'Student id is required' });
    return;
  }
  if(!score){
    response.status(400).json({ error: 'Score is required' });
    return;
  }

  if(pageType == 1){
    editQuizGrade(request, response);
  } else if(pageType == 2){
    editClassQuestGrade(request, response);
  }
};

const classQueries = {
    createClassroom,
    addStudentToClass,
    getAllStudentsInClassroom,
    getClassroomGrades,
    editStudentGrade
};

export default classQueries;

