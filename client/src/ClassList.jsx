import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const apiURL = import.meta.env.VITE_SERVER_URL;

function ClassList(){
    const navigate = useNavigate();
    const location = useLocation();

    const [classList, setClassList] = useState([]);

    useEffect(() => { //Run on load
        const fetchList = async () => {
          let response = await getClassList(location.state.id);
          console.log(response);
          if(([1,2,3].includes(response))){ return; }

          const sortedList = [...response.students].sort((a, b) => a.role_id - b.role_id);
          setClassList(sortedList);
        }
        fetchList();
    }, []);

    return (
        <div>
            <h1>{location.state.name} Class List</h1>
            <div className="container">
                <div style={{display: 'flex'}}>
                    <button type="button" style={{marginRight: 'auto'}} onClick={() => navigate('/CoursePage', {state: {name: location.state.name, id: location.state.id, user: location.state.user}})}>Return to Course</button>
                    <button onClick={() => navigate('/')}>Logout</button>
                </div>
                <h2>Enrolled Users</h2>
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
                            classList.filter((student) => student.role_id === 3).map((student) => (
                                <tr key={student.id}>
                                    <td>{student.name}</td>
                                    <td>FILL WITH GRADE</td>
                                    <td>
                                        {location.state.quizObject != null ? (
                                            <button onClick={() => navigate('/QuizPage' , {state: {quizObject: location.state.quizObject, name: location.state.name, id: location.state.id, user: location.state.user}})}>View Quiz</button>
                                        ) : (
                                            <button onClick={() => navigate('/QuestionPage', {state: {classQuestion: location.state.classQuestion, name: location.state.name, id: location.state.id, user: location.state.user}})}>View Question</button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default ClassList;


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

function convertIdToRole(roleId) {
    switch(roleId) {
      case 1: return "Professor";
      case 3: return "Student";
      case 2: return "TA";
      default: return "No Role";
    }
  }