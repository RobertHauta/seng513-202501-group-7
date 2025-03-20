import React, { useState } from 'react';
import { Link } from 'react-router-dom';


function LoginForm(props) {

  return (
    <div>
      <h1>Fedora Learning</h1>
      <div className="container">
        <form onSubmit={props.onSubmit}>
          <label htmlFor="email">Email: </label>
          <input type="text" id="email" name="email" required />
          <label htmlFor="password">Password:</label>
          <input type="password" id="password" name="password" required />
          <div>
            <Link to="/HomePage">
              <button type="submit">Submit</button>
            </Link>
            <Link to="/RegisterPage">
              <button type="submit">Register</button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoginForm;

