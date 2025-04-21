import React from 'react';
import { useNavigate } from 'react-router-dom';

const apiURL = import.meta.env.VITE_SERVER_URL;

function RegisterForm() {
  const navigate = useNavigate();

  async function handleRegister(e){
    e.preventDefault();
    
    const enteredName = e.target.username.value;
    const enteredEmail = e.target.email.value;
    const enteredPassword = e.target.password.value;
    const repeatPassword = e.target.password_repeat.value;
    const enteredRole = e.target.role.value;
    if(enteredPassword !== repeatPassword){
      alert("Passwords do not match");
      return;
    }
    let response = await createUser(enteredName, enteredEmail, enteredPassword, enteredRole);
    if(response === 0){
      navigate('/');
    }
    else if(response === 1){
      alert("Email already registered to an existing user");
      return;
    }
  }
  
  return (
    <div>
      <h1>Fedora Learning</h1>
      <div className="container">
        <form onSubmit={handleRegister}>
          <label htmlFor="name">Name: </label>
          <input type="text" id="username" name="username" required />
          <label htmlFor="email">Email: </label>
          <input type="text" id="email" name="email" required />
          <label htmlFor="password">Password:</label>
          <input type="password" id="password" name="password" required />
          <label htmlFor="password">Repeat Password:</label>
          <input type="password" id="password_repeat" name="password_repeat" required />
          <fieldset>
            <legend>Select your role:</legend>
            <label>
              <input type="radio" name="role" value="Student" required />
              Student
            </label>
            <label>
              <input type="radio" name="role" value="TA" required />
              Teaching Assistant
            </label>
            <label>
              <input type="radio" name="role" value="Professor" required />
              Professor
            </label>
          </fieldset>
          <div>
            <button type="submit">Submit</button>
            <button type="button" onClick={() => navigate('/')}>Cancel</button>
          </div>
          
        </form>
      </div>
    </div>
  );
}

export default RegisterForm;


async function createUser(name, email, password, role){
  if(role === 'Professor'){
    role = 1;
  }
  else if(role === 'TA'){
    role = 2;
  }
  else if(role === 'Student'){
    role = 3;
  }
    
  return new Promise((resolve, reject) => {
    fetch(`${apiURL}/api/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: name,
        email: email,
        password: password,
        role_id: role
      })
    })
    .then(response => {
      if(response.status === 409) {
       resolve(1); 
      }
      if (!response.ok) {
        throw new Error('Server error');
      }
      return;
    })
    .then(() => {
      resolve(0);
    })
    .catch(error => {

      console.error('Error during class retrieval:', error);
      reject(error);
    });
  });
}