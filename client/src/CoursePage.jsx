import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';


function CoursePage() {
  const navigate = useNavigate();

  return (
    <div>
      <h1>Welcome to Course</h1>
      <div className="container">
          <button type="button" onClick={() => navigate('/HomePage')}>Go back</button>
      </div>
    </div>
  );
}

export default CoursePage;