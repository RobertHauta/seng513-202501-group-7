import React, { useState } from 'react';
import { Link } from 'react-router-dom';


function RegisterForm() {

  return (
    <div>
      <h1>Fedora Learning</h1>
      <div className="container">
        <form>
          <label htmlFor="email">Email: </label>
          <input type="text" id="email" name="email" required />
          <label htmlFor="password">Password:</label>
          <input type="password" id="password" name="password" required />
          <Link to="/">
            <button type="submit">Submit</button>
          </Link>
        </form>
      </div>
    </div>
  );
}

export default RegisterForm;