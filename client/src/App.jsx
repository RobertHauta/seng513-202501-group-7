import React, { useState } from 'react';
import LoginForm from './LoginForm';
import HomePage from './HomePage';

function App() {
  const [login, setLogin] = useState(false);
  const [user, setUser] = useState(null);

  async function handleSubmit(e){
    e.preventDefault();
    const enteredEmail = e.target.email.value;
    const enteredPassword = e.target.password.value;
    let response = await getUser(enteredEmail, enteredPassword);
    if(!([1,2,3].includes(response))){
      console.log(response);
      setLogin(true);
      setUser(response);
    }
  }

  function handleLogout(){
    setLogin(false);
  }

  return (
    <div>
      {login ? (
        <HomePage onLogout={handleLogout} userData={user}/>
      ) : (
        <LoginForm onSubmit={handleSubmit} />
      )
      }
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