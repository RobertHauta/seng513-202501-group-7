import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import HomePage from './HomePage';
import CoursePage from './CoursePage';
import ClassList from './ClassList';
import MakeAssignment from './MakeAssignment';
import QuizPage from './QuizPage';
import QuestionPage from './QuestionPage';

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
          <Route path="/MakeAssignment" element={<MakeAssignment />} />
          <Route path="/QuizPage" element={<QuizPage />} />
          <Route path="/QuestionPage" element={<QuestionPage />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;