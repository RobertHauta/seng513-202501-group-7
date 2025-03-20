import React, { useState } from 'react';
import { Link } from 'react-router-dom';


function CoursePage() {

  return (
    <div>
      <h1>Welcome to Course</h1>
      <div className="container">
          <Link to="/HomePage">
            <button type="submit">Go back</button>
          </Link>
      </div>
    </div>
  );
}

export default CoursePage;