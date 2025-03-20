import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import HomePage from './HomePage';
import CoursePage from './CoursePage';

function App() {
  const [user, setUser] = useState(null);

  async function handleSubmit(e){
    e.preventDefault();
    const enteredEmail = e.target.email.value;
    const enteredPassword = e.target.password.value;
    let response = await getUser(enteredEmail, enteredPassword);
    if(!([1,2,3].includes(response))){
      console.log(response);
      setUser(response);
    }
  }

  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginForm onSubmit={handleSubmit} />} />
          <Route path="/RegisterForm" element={<RegisterForm />} />
          <Route path="/HomePage" element={<HomePage userData={user}/>} />
          <Route path="/CoursePage" element={<CoursePage />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;

async function getUser(email, password) {
  return new Promise((resolve, reject) => {fetch('http://localhost:5000/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: email,
        password: password
      })
    })
    .then(response => {
      if(response.status === 401){
        reject(1); // Invalid credentials
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