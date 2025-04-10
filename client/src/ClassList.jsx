import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function ClassList(){
    const navigate = useNavigate();
    const location = useLocation();

    const [classList, setClassList] = useState([]);

    useEffect(() => { //Run on load
        const fetchList = async () => {
          let response = await getClassList(location.state.id);
          console.log(response);
          if(([1,2,3].includes(response))){ return; }
          setClassList(() => [...response.students]);
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
                            <th>User Name</th>
                            <th>User Email</th>
                            <th>User Role</th>
                        </tr>
                    </thead>
                    <tbody>
                        {classList.filter((student) => student.role_id === 2).map((student) => (
                            <tr key={student.id}>
                                <td>{student.name}</td>
                                <td>{student.email}</td>
                                <td>{convertIdToRole(student.role_id)}</td>
                            </tr>
                        ))}
                        {classList.filter((student) => student.role_id === 3).map((student) => (
                            <tr key={student.id}>
                                <td>{student.name}</td>
                                <td>{student.email}</td>
                                <td>{convertIdToRole(student.role_id)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default ClassList;


async function getClassList(class_id) {
    return new Promise((resolve, reject) => {
        fetch(`http://localhost:5100/api/classrooms/classlist/${class_id}`, {
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