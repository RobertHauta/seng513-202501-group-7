import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const apiURL = import.meta.env.VITE_SERVER_URL;

function CoursePage() {
  const [quizzes, setQuizzes] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [grades, setGrades] = useState([]);
  const [totalGrade, setTotalGrade] = useState(0);

  const [isMobile, setIsMobile] = useState(window.matchMedia('(max-width: 768px)').matches);
  const [activeTab, setActiveTab] = useState("quizzes");

  useEffect(() => { //Run on load
      const mediaQuery = window.matchMedia('(max-width: 768px)');
      const handleResize = () => setIsMobile(mediaQuery.matches);
      mediaQuery.addEventListener('change', handleResize);

      const fetchQuizzes = async () => {
        let response_quiz = location.state.user.role_name === "Student" ? await getQuizzesStudents(location.state.id, location.state.user.user_id) : await getQuizzes(location.state.id);
        if([1,2,3].includes(response_quiz)) return;
        setQuizzes(() => [...response_quiz.quizzes]);
      }
      const fetchQuestions = async () => {
        let response_questions = location.state.user.role_name === "Student" ? await getClassQuestionsStudents(location.state.id, location.state.user.user_id) : await getClassQuestions(location.state.id);
        if([1,2,3].includes(response_questions)) return;
        setQuestions(() => [...response_questions.questions]);
      }
      const fetchGrades = async () => {
        let response_grades = location.state.user.role_name === "Student" ? await getGradeStudents(location.state.id, location.state.user.user_id) : await getGrade(location.state.id);
        if([1,2,3].includes(response_grades)) return;
        console.log(response_grades);
        setGrades(() => [...response_grades.grades]);
        setTotalGrade(response_grades.finalGrade);
      }
      fetchQuizzes();
      fetchQuestions();
      fetchGrades();
      return () => mediaQuery.removeEventListener('change', handleResize);
    }, []);

  const navigate = useNavigate();
  const location = useLocation();

  const showTab = () => {
    switch(activeTab){
      case "quizzes":
        return <Quizzes location={location} navigate={navigate} quizzes={quizzes} />;
      case "grades":
        return <Grades location={location} grades={grades} totalGrade={totalGrade} />;
      case "classQuestions":
        return <ClassQuestions location={location} navigate={navigate} questions={questions}/>;
      default:
        return <Quizzes location={location} navigate={navigate} quizzes={quizzes} />;
    }
  }

  if(isMobile){
    return (
      <div>
        <h1>{location.state.name}</h1>
        <div className="container">
            <div style={{display: 'flex'}}>
              <button type="button" onClick={() => navigate('/HomePage')}>Return to Home Page</button>
              <button type="button" style={{marginRight: 'auto'}} onClick={() => navigate('/ClassList', {state: {name: location.state.name, id: location.state.id, user: location.state.user, headers: ['Name','E-Mail','Role']}})}>View Class List</button>
              <button onClick={() => navigate('/')}>Logout</button>
            </div>
            <hr />
            <div className="tabs">
              <button onClick={() => setActiveTab('quizzes')}>Quizzes</button>
              <button onClick={() => setActiveTab('grades')}>Grades</button>
              <button onClick={() => setActiveTab('classQuestions')}>Class Questions</button>
            </div>

            <div>{showTab()}</div>
        </div>
      </div>
    );
  }
  else{
    return (
      <div>
        <h1>{location.state.name}</h1>
        <div className="container">
            <div style={{display: 'flex'}}>
              <button type="button" onClick={() => navigate('/HomePage')}>Return to Home Page</button>
              <button type="button" style={{marginRight: 'auto'}} onClick={() => navigate('/ClassList', {state: {name: location.state.name, id: location.state.id, user: location.state.user, headers: ['Name','E-Mail','Role']}})}>View Class List</button>
              <button onClick={() => navigate('/')}>Logout</button>
            </div>
            
            <div className="gridContainer">
              <Quizzes location={location} navigate={navigate} quizzes={quizzes} />
              <Grades location={location} grades={grades} totalGrade={totalGrade} />
              <ClassQuestions location={location} navigate={navigate} questions={questions}/>
            </div>
        </div>
      </div>
    );
  }
}

export default CoursePage;

const Quizzes = ({location, navigate, quizzes}) => {
  return (
    <div className='container' style={{gridRow: 'span 2', backgroundColor: '#5e5e5e'}}>
      {location.state.user.role_name === "Professor" ? (
        <div style={{display: 'flex', alignItems: 'center'}}>
          <h2>Quizzes</h2>
          <button onClick={() => navigate('/MakeAssignment', {state: {type: "quiz", name: location.state.name, id: location.state.id, user: location.state.user}})}>+</button>
        </div>
      ) : (
        <h2>Quizzes</h2>
      )}
      <div className="quizzes">
        {quizzes.map(quiz => (
          <div style={{display: 'flex'}} key={quiz.id}>
            {location.state.user.role_name === "Student" ? (
              <h3 className="container" style={{marginRight: '1em', backgroundColor: "#939393", cursor: "pointer"}} onClick={() => navigate('/QuizPage' , {state: {quizObject: quiz, isGrading: false, name: location.state.name, id: location.state.id, user: location.state.user}})}>{quiz.title}</h3>
            ) : (
              <h3 className="container" style={{marginRight: '1em', backgroundColor: "#939393", cursor: "pointer"}} onClick={() => navigate('/ClassList', {state: {quizObject: quiz, name: location.state.name, id: location.state.id, user: location.state.user, headers: ['Student Name','Achieved Grade', null]}})}>{quiz.title}</h3>
            )}
            <p className="container" style={{backgroundColor: '#1a1a1a'}}>Due: {quiz.due_date.substring(0, 10)}</p>
          </div>
          ))
        }
      </div>
    </div>
  );
}

const Grades = ({location, grades, totalGrade}) => {
  return (
    <div className='container' style={{backgroundColor: '#5e5e5e'}}>
      <div className='card' style={{backgroundColor: '#1a1a1a', width: 'fit-content', height: 'fit-content', border: 0}}>
        {location.state.user.role_name === "Student" ? (
          <p style={{margin: '0'}}>Total Grade: {totalGrade}</p>
        ) : (
          <p style={{margin: '0'}}>Average Course Grade: {totalGrade}</p>
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
          {location.state.user.role_name === "Student" ? 
            grades.map(grade => (
              <tr>
                <td>{grade.name}</td>
                <td>{grade.score}</td>
                <td>{grade.weight}</td>
              </tr>
            )) : 
              grades.map(grade => (
                <tr>
                  <td>{grade.name}</td>
                  <td>{grade.average}</td>
                  <td>{grade.weighted}</td>
                  <td>{grade.count}</td>
                </tr>
              )
            )}
        </tbody>
      </table>
    </div>
  );
}

const ClassQuestions = ({location, navigate, questions}) => {
  return (
    <div className='container' style={{backgroundColor: '#5e5e5e'}}>
      {location.state.user.role_name === "Professor" ? (
        <div style={{display: 'flex', alignItems: 'center'}}>
          <h2>Class Questions</h2>
          <button onClick={() => navigate('/MakeAssignment', {state: {type: "question", name: location.state.name, id: location.state.id, user: location.state.user}})}>+</button>
        </div>
      ) : (
        <h2>Class Questions</h2>
      )}
      <div className="classes">
        {questions.map(question => (
                location.state.user.role_name === "Student" ? (
                  <div className="card" style={{backgroundColor: "#939393", cursor: "pointer"}} key={question.id} onClick={() => navigate('/QuestionPage', {state: {classQuestion: question, isGrading: false, name: location.state.name, id: location.state.id, user: location.state.user}})}>
                    <h3>{question.name}</h3>
                    <p>{question.posted_at.substring(0, 10)}</p>
                  </div>
                ) : (
                  <div className="card" style={{backgroundColor: "#939393", cursor: "pointer"}} key={question.id} onClick={() => navigate('/ClassList', {state: {classQuestion: question, name: location.state.name, id: location.state.id, user: location.state.user, headers: ['Student Name','Achieved Grade', null]}})}>
                    <h3>{question.name}</h3>
                    <p>{question.posted_at.substring(0, 10)}</p>
                  </div>
                )
            ))
        }
      </div>
    </div>
  );
}

function getQuizzes(course_id){
  return new Promise((resolve, reject) => {
    fetch(`${apiURL}/api/quiz/${course_id}`, {
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

function getQuizzesStudents(course_id, student_id){
  return new Promise((resolve, reject) => {
    fetch(`${apiURL}/api/quizzes/unfinished/${course_id}/${student_id}`, {
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
    fetch(`${apiURL}/api/classrooms/question/${course_id}`, {
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

function getClassQuestionsStudents(course_id, student_id){
  return new Promise((resolve, reject) => {
    fetch(`${apiURL}/api/classquestions/unfinished/${course_id}/${student_id}`, {
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

function getGradeStudents(course_id, student_id){
  return new Promise((resolve, reject) => {
    fetch(`${apiURL}/api/classrooms/grades/${course_id}/${student_id}`, {
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

function getGrade(course_id){
  return new Promise((resolve, reject) => {
    fetch(`${apiURL}/api/classrooms/average/${course_id}`, {
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