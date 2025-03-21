import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';


function HomePage(props) {
  const [classroom, setClassroom] = useState([]);
  const navigate = useNavigate();

  useEffect(() => { //Run on load
    const fetchClasses = async () => {
      let response = props.userData.role_name === "Professor" ? await getProfessorClasses(props.userData.user_id) : await getStudentClasses(props.userData.user_id);
      console.log(response);
      setClassroom(() => [...response.classrooms]);
    }
    fetchClasses();
  }, []);

  async function handleClick() {
    let data = props.userData;
    let response = await createNewClass(data);
    if(([1,2,3].includes(response))) {return;}
    setClassroom((prev) => [...prev, response.classroom]);
  }

  /*
  classroom: { 
    id: 1
    name: "My First Class"
    professor_id: 3
  }
  */
  return (
    <div>
        <h1>Welcome to Fedora Learning</h1>
        <div className="container">
            {props.userData.role_name === "Professor" ? (
              <button onClick={handleClick}>+</button>
            ) : (
              <div>
                <label htmlFor="course_id">Course ID: </label>
                <input type="text" name="course_id" id="course_id"/>
                <button>Enroll</button>
              </div>
            )}
            <button onClick={() => navigate('/')}>Logout</button>
            <div className="classes">
                {classroom.map(course => (
                        <div className="courseCard" key={course.id} onClick={() => navigate('/CoursePage')}>
                            <h2>{course.name}</h2>
                            <p>Professor ID: {course.professor_id}</p>
                        </div>
                    ))
                }
            </div>
        </div>
    </div>
  );
}

export default HomePage;


async function getStudentClasses(userId) {
  return new Promise((resolve, reject) => {
    fetch(`http://localhost:5100/api/classrooms/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Server error');
      }
      return response.json();
    })
    .then(data => {
      resolve(data);
    })
    .catch(error => {
      console.error('Error during class retrieval:', error);
      reject(error);
    });
  });
}

async function getProfessorClasses(userId) {
  return new Promise((resolve, reject) => {
    fetch(`http://localhost:5100/api/classrooms/professors/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Server error');
      }
      return response.json();
    })
    .then(data => {
      resolve(data);
    })
    .catch(error => {
      console.error('Error during class retrieval:', error);
      reject(error);
    });
  });
}

async function createNewClass(data){
  return new Promise((resolve, reject) => {
    fetch('http://localhost:5100/api/classrooms/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId: data.user_id,
        name: "My First Class",
        role_id: data.role_name === 'Professor' ? 1 : 2
      })
    })
    .then(response => {
      if(response.status === 400){
        return response.json().then(errorData => {
          console.error('Bad Request Error:', errorData);
          reject(errorData);
        });
      }
      if (!response.ok) {
        throw new Error('Server error');
      }
      return response.json();
    })
    .then(data => {
      resolve(data);
    })
    .catch(error => {
      console.error('Error during class creation:', error);
      reject(error);
    });
  });
}