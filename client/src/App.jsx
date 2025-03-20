import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import HomePage from './HomePage';
import CoursePage from './CoursePage';

function App() {
  const [user, setUser] = useState(null);

  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginForm setUser={setUser} />} />
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
  return new Promise((resolve, reject) => {fetch('http://localhost:5100/api/login', {
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
        console.log('Invalid credentials');
        reject(1);
      }
      
      if (!response.ok) {
        console.error('Server error:', response.statusText);
        reject(2);
      }
      console.log('Login successful');
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