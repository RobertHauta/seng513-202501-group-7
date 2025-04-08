import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';


function HomePage(props) {
  const [classroom, setClassroom] = useState([]);
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => { //Run on load
    const fetchClasses = async () => {
      let response = props.userData.role_name === "Professor" ? await getProfessorClasses(props.userData.user_id) : await getStudentClasses(props.userData.user_id);
      console.log(response);
      setClassroom(() => [...response.classrooms]);
    }
    fetchClasses();
  }, []);

  async function makeCourse() {
    setIsPopupVisible(true);
    // let data = props.userData;
    // //data.course_name = ;
    // let response = await createNewClass(data);
    // if(([1,2,3].includes(response))) {return;}
    // setClassroom((prev) => [...prev, response.classroom]);
  }
  
  async function handleCourseCreation(courseName) {
    let data = { ...props.userData, course_name: courseName };
    let response = await createNewClass(data);
    if ([1, 2, 3].includes(response)) {
      return;
    }
    setClassroom((prev) => [...prev, response.classroom]);
    setIsPopupVisible(false);
  }

  async function makeEnrollment() {
    let course_id = document.getElementById("course_id").value;
    let role_id = convertRoleToId(props.userData.role_name);
    let response = await enrollStudentInClass(props.userData.user_id, course_id, role_id);

    if(([1,2,3].includes(response))) {return;}
    
    setClassroom((prev) => [...prev, response.membership]);
  }

  return (
    <div>
      <h1>Welcome to Fedora Learning</h1>
      <div className="container">
        {props.userData.role_name === "Professor" ? (
          <button onClick={makeCourse}>Create Course</button>
        ) : (
          <div>
            <label htmlFor="course_id">Course ID: </label>
            <input type="text" name="course_id" id="course_id"/>
            <button onClick={makeEnrollment}>Enroll</button>
          </div>
        )}
        <button onClick={() => navigate('/')}>Logout</button>
        <div className="classes">
          {classroom.map(course => (
            <div className="card" key={course.id} onClick={() => navigate('/CoursePage', {state: {name: course.name, id: course.id, user: props.userData}})}>
              <h2>{course.name}</h2>
              <p>Professor Name: {course.professor_name}</p>
              <p>Course ID: {course.id}</p>
            </div>
          ))}
        </div>
      </div>
      {isPopupVisible && (
        <CoursePopup
          onClose={() => setIsPopupVisible(false)}
          onSubmit={handleCourseCreation}
        />
      )}
    </div>
  );
}

function CoursePopup({ onClose, onSubmit }) {
  const [courseName, setCourseName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(courseName);
  };

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <h2>Create New Course</h2>
        <form onSubmit={handleSubmit}>
          <label htmlFor="course-name">Course Name:</label>
          <input
            type="text"
            id="course-name"
            value={courseName}
            onChange={(e) => setCourseName(e.target.value)}
            required
          />
          <div className="popup-buttons">
            <button type="submit">Create Course</button>
            <button type="button" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default HomePage;

function convertRoleToId(roleName) {
  switch(roleName) {
    case "Professor": return 1;
    case "Student": return 3;
    case "TA": return 2;
    default: return 0;
  }
}

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
        name: data.course_name,
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

async function enrollStudentInClass(user_id, class_id, role_id){
  return new Promise((resolve, reject) => {
    fetch(`http://localhost:5100/api/classrooms/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId: user_id,
        classroom_id: class_id,
        role_id: role_id
      })
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
      console.error('Error during enrollment:', error);
      reject(error);
    });
  });
}