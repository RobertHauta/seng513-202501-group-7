import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import HomePage from './HomePage';
import CoursePage from './CoursePage';
import ClassList from './ClassList';

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
          <Route path="/ClassList" element={<ClassList />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;