import React, { useState } from 'react';

function HomePage(props) {
  const [classroom, setClassroom] = useState([]);

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
            <button onClick={handleClick}>+</button>
            <button onClick={props.onLogout}>Logout</button>
            <div className="classes">
                {classroom.map(course => (
                        <div className="courseCard" key={course.id}>
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

async function createNewClass(data){
  return new Promise((resolve, reject) => {fetch('http://localhost:5000/api/classes/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        user_id: data.user_id,
        name: "My First Class",
        role_id: data.role_name === 'Professor' ? 1 : 2
      })
    })
    .then(response => {
      if(response.status === 400){
        reject(1); // Error creating class
      }

      if (!response.ok) {
        reject(2); // Server error
      }
      return response.json();
    })
    .then(data => {
      resolve(data);
    })
    .catch(error => {
      console.error('Error during login:', error);
      reject(3);
    });
  });
}