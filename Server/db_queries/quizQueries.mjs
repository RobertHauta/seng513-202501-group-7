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
  const { title, classroom_id, created_by, total_weight, release_date, due_date, questions } = req.body;

  const client = await postgresPool.connect();
  try {
    // Start a transaction
    await client.query('BEGIN');

    // Insert the quiz
    const quizQuery = `
      INSERT INTO Quizzes (title, classroom_id, created_by, total_weight, release_date, due_date)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id
    `;
    const quizResult = await client.query(quizQuery, [title, classroom_id, created_by, total_weight, release_date, due_date]);
    const quizId = quizResult.rows[0].id;

    // Insert questions and options
    for (const question of questions) {
      // Insert question
      const questionQuery = `
        INSERT INTO Questions (quiz_id, question_text, type_id, marks, correct_answer)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id
      `;
      const questionResult = await client.query(questionQuery, [
        quizId,
        question.question_text,
        question.type_id,
        question.marks,
        question.correct_answer
      ]);
      const questionId = questionResult.rows[0].id;

      // Insert options if they exist
      if (question.options && question.options.length > 0) {
        const optionQuery = `
          INSERT INTO Options (question_id, option_text, is_correct)
          VALUES ($1, $2, $3)
        `;
        for (const option of question.options) {
          await client.query(optionQuery, [questionId, option.option_text, option.is_correct]);
        }
      }
    }

    // Commit the transaction
    await client.query('COMMIT');

    res.json({ message: 'Quiz created successfully', quizId });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating quiz:', error);
    res.status(500).json({ error: 'Internal server error' });
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
      console.log(rows);
      return res.json({ quizzes: rows });
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

const gradeQuiz = async (req, res) => {
  const {quizId, studentId, answers} = req.body;
  if (!quizId) {
    return res.status(400).json({ error: 'Quiz ID is required' });
  }
  if (!studentId) {
    return res.status(400).json({ error: 'Student ID is required' });
  }
  if (!answers.length) {
    return res.status(400).json({ error: 'Answers are required' });
  }
  const client = await postgresPool.connect();

  try {
    await client.query('BEGIN');
    
    let totMarks = 0;
    let earnedMarks = 0;

    for (const answer of answers) {
      const {question_id, option_text, id, isMC} = answer;
      if (!question_id) {
        return res.status(400).json({ error: 'Question ID is required' });
      }
      if (!option_text &&!id) {
        return res.status(400).json({ error: 'Answer text or option ID is required' });
      }
      if (isMC &&!id) {
        return res.status(400).json({ error: 'MC answer option ID is required' });
      }

      let isCorrect = null;

      if(isMC){
        const correctAnswerQuery = `
          SELECT is_correct
          FROM Options
          WHERE question_id = $1 AND id = $2
          `;
        const { rows } = await client.query(correctAnswerQuery, [question_id, id]);
        isCorrect = rows[0] ? rows[0].is_correct : null;
        if (isCorrect === null) {
          return res.status(400).json({ error: 'Invalid option ID for the given question' });
        }
      }
      else{
        const correctAnswerQuery = `
          SELECT correct_answer
          FROM Questions
          WHERE id = $1
          `;
        const { rows } = await client.query(correctAnswerQuery, [question_id]);
        isCorrect = rows[0] ? rows[0].correct_answer === answer.option_text : null;
        if (isCorrect === null) {
          return res.status(400).json({ error: 'Invalid answer ID for the given question' });
        }
      }
      totMarks++;
      if (isCorrect) {
        earnedMarks++;
      }

      const queryText = `
        INSERT INTO StudentAnswers (question_id, student_id, selected_answer, is_correct, submitted_at)
        VALUES ($1, $2, $3, $4, NOW())
      `;
      await client.query(queryText, [question_id, studentId, option_text, isCorrect]);
    }

    const gradeQuizQuery = `
        INSERT INTO Grades (student_id, quiz_id, score)
        VALUES ($1, $2, $3)
        RETURNING score
        `;
    const { rows1: gradeRows } = await client.query(gradeQuizQuery, [studentId, quizId, earnedMarks/totMarks]);

    await client.query('COMMIT');
    return res.status(200).json({ grade: {earnedMarks, totMarks} });
    } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error grading quiz:', error);
    return res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
}

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
      WHERE question_id = $1
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


const quizQueries = {
    getQuizzes,
    getUnfinishedQuizzesForStudent,
    createQuiz,
    createQuizQuestion,
    getQuestionsForQuiz,
    gradeQuiz,
    getQuestionOptions
};

export default quizQueries;