import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const apiURL = import.meta.env.VITE_SERVER_URL;

function ClassList(){
    const navigate = useNavigate();
    const location = useLocation();

    const [classList, setClassList] = useState([]);
    const [isPopupVisible, setIsPopupVisible] = useState(false);
    const [previousGrade, setPreviousGrade] = useState("");
    const [currentStudentIndex, setCurrentStudentIndex] = useState(null);

    useEffect(() => { //Run on load
        const fetchList = async () => {
        
          if(location.state.quizObject !== undefined && location.state.classQuestion === undefined) {
            let response = await getGradesList(location.state.id, 1, location.state.quizObject.id);
            console.log(response);
            if(([1,2,3].includes(response))){ return; }
            setClassList(response.students);

          } else if(location.state.quizObject === undefined && location.state.classQuestion!== undefined) {
            let response = await getGradesList(location.state.id, 2, location.state.classQuestion.id);
            console.log(response);
            if(([1,2,3].includes(response))){ return; }
            setClassList(response.students);

          } else if(location.state.quizObject === undefined && location.state.classQuestion === undefined) {
            let response = await getClassList(location.state.id);
            console.log(response);
            if(([1,2,3].includes(response))){ return; }

            const sortedList = [...response.students].sort((a, b) => a.role_id - b.role_id);
            setClassList(sortedList);
          } else{
            console.error('Invalid state');
          }
        }
        fetchList();
    }, []);

    async function handleGradeChange(grade) {
        if(grade < 0 || grade > 100) {
            alert('Invalid grade. Grade must be between 0 and 100.');
            return;
        }

        try {
            const pageType = location.state.quizObject ? 1 : 2;
            const assignmentId = location.state.quizObject ? location.state.quizObject.id : location.state.classQuestion.id;
            const studentId = classList[currentStudentIndex].id;
            let response = await updateGrade(assignmentId, pageType, studentId, parseFloat(grade)/100);
            console.log(response);
            if(([1,2,3].includes(response))){ return; }
            const newClassList = classList.map((student, index) => {
                if (index === currentStudentIndex) {
                    return {
                        ...student,
                        score: `${parseFloat(grade).toFixed(2)}%`, // Update score to match the display format
                    };
                }
                return student;
            });
            setClassList(() => [...newClassList]);
            setIsPopupVisible(false);
        } catch (error) {
            console.error('Error updating grade', error);
        }
    }

    function makeVisible(grade, index) {
        setIsPopupVisible(true);
        setCurrentStudentIndex(index);
        setPreviousGrade(grade);
    }

    return (
        <div>
            {location.state.headers[2] === null ? (
                location.state.quizObject ? (
                    <h1>{location.state.quizObject.title} Grades List</h1>
                ) : (
                    <h1>{location.state.classQuestion.name} Grades List</h1>
                )
            ) : (
                <h1>{location.state.name} Class List</h1>
            )}
            <div className="container">
                <div style={{display: 'flex'}}>
                    <button type="button" style={{marginRight: 'auto'}} onClick={() => navigate('/CoursePage', {state: {name: location.state.name, id: location.state.id, user: location.state.user}})}>Return to Course</button>
                    <button onClick={() => navigate('/')}>Logout</button>
                </div>
    
                {location.state.headers[2] === null ? (
                    <h2>Student Grades</h2>
                ) : (
                    <h2>Enrolled Users</h2>
                )}

                <table>
                    <thead>
                        <tr>
                            <th>{location.state.headers[0]}</th>
                            <th>{location.state.headers[1]}</th>
                            <th>{location.state.headers[2]}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {location.state.headers[2] === "Role" ? (
                            classList.map((user) => (
                                <tr key={user.id}>
                                    <td>{user.name}</td>
                                    <td>{user.email}</td>
                                    <td>{convertIdToRole(user.role_id)}</td>
                                </tr>
                            ))
                        ) : (
                            classList.map((student, index) => (
                                <tr key={student.id}>
                                    <td>{student.name}</td>
                                    <td>
                                        <div className="quizTableEdit">
                                            {student.score}
                                            {location.state.quizObject ? (
                                                student.score !== "Not Submitted" ? (<button onClick={() => makeVisible(parseFloat(student.score.substring(0, student.score.length-1)), index)}>Edit Grade</button>) : (null)
                                            ) : (null)}
                                        </div>
                                    </td>
                                    <td>
                                        {student.score !== "Not Submitted" ? (
                                            location.state.quizObject != null ? (
                                                <button onClick={() => navigate('/QuizPage' , {state: {quizObject: location.state.quizObject, isGrading: true, name: location.state.name, id: location.state.id, user: location.state.user, student_id: student.id, student_name: student.name}})}>View Quiz</button>
                                            ) : (
                                                <button onClick={() => navigate('/QuestionPage', {state: {classQuestion: location.state.classQuestion, isGrading: true, name: location.state.name, id: location.state.id, user: location.state.user, student_id: student.id, student_name: student.name}})}>View Question</button>
                                            )
                                        ) : (null)}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            {isPopupVisible && (
                <GradesPopup
                onClose={() => setIsPopupVisible(false)}
                onSubmit={handleGradeChange}
                prevGrade={previousGrade}
                />
            )}
        </div>
    )
}

export default ClassList;

function GradesPopup({ onClose, onSubmit, prevGrade}) {
  const [newGrade, setNewGrade] = useState(prevGrade);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(newGrade);
  };

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <h2>Update Grade</h2>
        <form onSubmit={handleSubmit}>
          <label htmlFor="new-grade">New Grade:</label>
          <input
            type="number"
            id="new-grade"
            value={newGrade}
            onChange={(e) =>setNewGrade(e.target.value)}
            required
          />
          <div className="popup-buttons">
            <button type="submit">Change Grade</button>
            <button type="button" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

async function getClassList(class_id) {
    return new Promise((resolve, reject) => {
        fetch(`${apiURL}/api/classrooms/classlist/${class_id}`, {
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

async function getGradesList(class_id, pageType, id) {
    return new Promise((resolve, reject) => {
        fetch(`${apiURL}/api/classrooms/classlist/grades/${class_id}/${pageType}/${id}`, {
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
            console.error('Error during grades retrieval:', error);
            reject(2);
          });
    });
}

async function updateGrade(assignmentId, pageType, studentId, score) {
    return new Promise((resolve, reject) => {
        fetch(`${apiURL}/api/assignments/update`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ assignmentId: assignmentId, pageType: pageType, studentId: studentId, score: score })
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
            console.error('Error during grade update:', error);
            reject(2);
          });
    });
}

function convertIdToRole(roleId) {
    switch(roleId) {
      case 1: return "Professor";
      case 3: return "Student";
      case 2: return "TA";
      default: return "No Role";
    }
  }