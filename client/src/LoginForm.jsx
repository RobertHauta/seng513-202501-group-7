import React, { useState } from 'react';
import './LoginForm.css'

function LoginForm(props) {
  return (
    <div>
      <h1>Fedora Learning</h1>
      <div className="container">
        <h2>Log in to Fedora</h2>
        <form onSubmit={props.onSubmit}>
          <label htmlFor="email">Email: </label>
          <input type="text" id="email" name="email" required />
          <label htmlFor="password">Password:</label>
          <input type="password" id="password" name="password" required />
          <button type="submit">Submit</button>
        </form>
      </div>
    </div>
  );
}

export default LoginForm;

