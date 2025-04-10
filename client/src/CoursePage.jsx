import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';


function CoursePage() {
  const [quizzes, setQuizzes] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [grades, setGrades] = useState([]);

  useEffect(() => { //Run on load
      const fetchQuizzes = async () => {
        let response_quiz = await getQuizzes(location.state.id);
        setQuizzes(() => [...response_quiz.quizzes]);

        let response_questions = await getClassQuestions(location.state.id);
        setQuestions(() => [...response_questions.questions]);

        //TO DO: Fetch grades and update grades state
      }
      fetchQuizzes();
    }, []);

  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div>
      <h1>{location.state.name}</h1>
      <div className="container">
          <div style={{display: 'flex'}}>
            <button type="button" onClick={() => navigate('/HomePage')}>Return to Home Page</button>
            <button type="button" style={{marginRight: 'auto'}} onClick={() => navigate('/ClassList', {state: {name: location.state.name, id: location.state.id, user: location.state.user}})}>View Class List</button>
            <button onClick={() => navigate('/')}>Logout</button>
          </div>
          
          <div className="gridContainer">
            <div className='container' style={{gridRow: 'span 2', backgroundColor: '#5e5e5e'}}>
              {location.state.user.role_name === "Professor" ? (
                <div style={{display: 'flex', alignItems: 'center'}}>
                  <h2>Quizzes</h2>
                  <button>+</button>
                </div>
              ) : (
                <h2>Quizzes</h2>
              )}
              <div className="quizzes">
                {quizzes.map(quiz => (
                        <div style={{display: 'flex'}} key={quiz.id}>
                            <h3 className="container" style={{marginRight: '1em', backgroundColor: "#939393"}} onClick={() => navigate('/QuizPage')}>{quiz.title}</h3>
                            <p className="container" style={{backgroundColor: '#1a1a1a'}}>Due: {quiz.due_date.substring(0, 10)}</p>
                        </div>
                    ))
                }
              </div>
            </div>

            <div className='container' style={{backgroundColor: '#5e5e5e'}}>
              <div className='card' style={{backgroundColor: '#1a1a1a', width: 'fit-content', height: 'fit-content'}}>
                {location.state.user.role_name === "Student" ? (
                  <p style={{margin: '0'}}>Total Grade: {}</p>
                ) : (
                  <p style={{margin: '0'}}>Average Course Grade: {}</p>
                )}
              </div>
              <h2>Grades</h2>
              <table>
                <thead>
                  {location.state.user.role_name === "Student" ? (
                    <tr>
                      <th>Assignment Name</th>
                      <th>Grade Score</th>
                      <th>Weighted Score</th>
                    </tr>
                  ) : (
                    <tr>
                      <th>Assignment Name</th>
                      <th>Average Grade</th>
                      <th>Weighted Score</th>
                      <th>Students Completed</th>
                    </tr>
                  )}
                </thead>
                <tbody>
                </tbody>
              </table>
            </div>

            <div className='container' style={{backgroundColor: '#5e5e5e'}}>
              {location.state.user.role_name === "Professor" ? (
                <div style={{display: 'flex', alignItems: 'center'}}>
                  <h2>Class Questions</h2>
                  <button>+</button>
                </div>
              ) : (
                <h2>Class Questions</h2>
              )}
              <div className="questions">
                {questions.map(question => (
                        <div className="card" style={{backgroundColor: "#939393"}} key={question.id} onClick={() => navigate('/QuestionPage')}>
                            <h3>{question.Name}</h3>
                        </div>
                    ))
                }
              </div>
            </div>
          </div>
      </div>
    </div>
  );
}

export default CoursePage;

function getQuizzes(course_id){
  return new Promise((resolve, reject) => {
    fetch(`http://localhost:5100/api/quiz/${course_id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(response => {
      if (!response.ok) {
        reject(1);
        throw new Error('Server error');
      }
      return response.json();
    })
    .then(data => {
      resolve(data);
    })
    .catch(error => {
      console.error('Error during class retrieval:', error);
      reject(2);
    });
  });
}

function getClassQuestions(course_id){
  return new Promise((resolve, reject) => {
    fetch(`http://localhost:5100/api/classrooms/question/${course_id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(response => {
      if (!response.ok) {
        reject(1);
        throw new Error('Server error');
      }
      return response.json();
    })
    .then(data => {
      resolve(data);
    })
    .catch(error => {
      console.error('Error during class retrieval:', error);
      reject(2);
    });
  });
}