import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';


function CoursePage() {
  const [quizzes, setQuizzes] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [grades, setGrades] = useState([]);

  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div>
      <h1>{location.state.name}</h1>
      <div className="container">
          <button type="button" onClick={() => navigate('/HomePage')}>Return to Home Page</button>
          <button onClick={() => navigate('/')}>Logout</button>
          
          <div className="gridContainer">
            <div className='container' style={{gridRow: 'span 2', backgroundColor: '#5e5e5e'}}>
              {location.state.user.role_name === "Professor" ? (
                <div style={{display: 'inline'}}>
                  <h2>Quizzes</h2>
                  <button>+</button>
                </div>
              ) : (
                <h2>Quizzes</h2>
              )}
              <div className="quizzes">
                {quizzes.map(quiz => (
                        <div className="card" key={quiz.id} onClick={() => navigate('/QuizPage')}>
                            <h3>{quiz.name}</h3>
                            <p>Due: {quiz.date}</p>
                        </div>
                    ))
                }
              </div>
            </div>

            <div className='container' style={{backgroundColor: '#5e5e5e'}}>
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
                  <tr>
                    <td>ayo</td>
                    <td>we</td>
                    <td>ballin</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className='container' style={{backgroundColor: '#5e5e5e'}}>
              {location.state.user.role_name === "Professor" ? (
                <div style={{display: 'inline'}}>
                  <h2>Class Questions</h2>
                  <button>+</button>
                </div>
              ) : (
                <h2>Class Questions</h2>
              )}
              <div className="questions">
                {questions.map(question => (
                        <div className="card" key={question.id} onClick={() => navigate('/QuestionPage')}>
                            <h3>{question.name}</h3>
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

function getQuizzes(cour){

}