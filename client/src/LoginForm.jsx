import React from 'react';
import { useNavigate } from 'react-router-dom';

const apiURL = import.meta.env.VITE_SERVER_URL;

function LoginForm(props) {
  const navigate = useNavigate();

  async function handleSubmit(e){
    e.preventDefault();
    const enteredEmail = e.target.email.value;
    const enteredPassword = e.target.password.value;
    let response = await getUser(enteredEmail, enteredPassword);
    if(!([1,2,3].includes(response))){
      localStorage.setItem('userData', JSON.stringify(response));
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
      <div className='container' style={{textAlign: 'center', width:'fit-content'}}>
        <h2>About Us</h2>
        <br />
        <p>Fedora is commited to making learning easier through 3 simple steps:</p>
        <div style={{ display: 'flex', justifyContent: 'center', textAlign: 'left'}}>
          <ul>
            <li>Connecting students and instructors across distances</li>
            <li>Increasing classroom engagement</li>
            <li>Building a foundation for students to learn better</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default LoginForm;

async function getUser(email, password) {
  return new Promise((resolve, reject) => {fetch(`${apiURL}/api/login`, {
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
        alert("Invalid email or password. Please try again.");
        reject(2);
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

