import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Question from './Question';

function QuizPage(){
    const [questions, setQuestions] = useState([]);

    const navigate = useNavigate();
    const location = useLocation();

    function handleSubmit(){

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

                    </div>
                    <Question objectData={location.state.quizObject} isClassQuestion={false} />
                </div>
                <button onClick={handleSubmit}>Submit Quiz</button>
            </div>
        </div>
    )
}

export default QuizPage;