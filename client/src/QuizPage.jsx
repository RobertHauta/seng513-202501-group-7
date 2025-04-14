import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Question from './Question';

function QuizPage(){
    const [questions, setQuestions] = useState([]);

    const navigate = useNavigate();
    const location = useLocation();

    function handleSubmit(){

    }

    function handleNext(){

    }

    return (
        <div>
            <h1>{location.state.quizObject.title}</h1>
            <div className='container'>
                <div style={{display: 'flex', marginBottom: "1em"}}>
                    <button type="button" style={{marginRight: 'auto'}} onClick={() => navigate('/CoursePage', {state: {name: location.state.name, id: location.state.id, user: location.state.user}})}>Return to Course Page</button>
                    <button onClick={() => navigate('/')}>Logout</button>
                </div>

                <div className='gridContainer' style={{gridTemplateRows: "1fr", margin: "1em auto"}}>
                    <div className='container' style={{backgroundColor: '#5e5e5e'}}>
                        <div className="classes">
                            {questions.map((_, index) => (
                                <div className="card" style={{cursor: "pointer", backgroundColor: "#1a1a1a", textAlign: "center"}} key={index}>
                                    <h2>{index + 1}</h2>
                                </div>
                            ))}
                        </div>
                    </div>
                    <Question objectData={questions[0]} isClassQuestion={false} />
                </div>
                <button style={{marginRight: "auto"}} onClick={handleSubmit}>Submit Quiz</button>
                <button onClick={handleNext}>Next Question</button>
            </div>
        </div>
    )
}

export default QuizPage;