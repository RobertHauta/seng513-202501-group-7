import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';


function LoginForm(props) {
  const navigate = useNavigate();

  async function handleSubmit(e){
    e.preventDefault();
    const enteredEmail = e.target.email.value;
    const enteredPassword = e.target.password.value;
    let response = await getUser(enteredEmail, enteredPassword);
    if(!([1,2,3].includes(response))){
      console.log(response);
      props.setUser(response);
      navigate('/HomePage');
    }
  }

  return (
    <div>
      <h1>Fedora Learning</h1>
      <div className="container">
        <form onSubmit={handleSubmit}>
          <label htmlFor="email">Email: </label>
          <input type="text" id="email" name="email" required />
          <label htmlFor="password">Password:</label>
          <input type="password" id="password" name="password" required />
          <div>
            <button type="submit">Submit</button>
            <button type="button" onClick={() => navigate('/RegisterForm')}>Register</button>
          </div>
        </form>
      </div>
    </div>
  );
}

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

export default LoginForm;

