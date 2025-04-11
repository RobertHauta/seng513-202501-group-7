import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Question from './Question';

function QuestionPage(){
    const [classQuestion, setClassQuestion] = useState();

    const navigate = useNavigate();
    const location = useLocation();

    function handleSubmit(){

    }

    return (
        <div>
            <h1>{location.state.classQuestion.name}</h1>
            <div className='container'>
                <div style={{display: 'flex', marginBottom: "1em"}}>
                    <button type="button" style={{marginRight: 'auto'}} onClick={() => navigate('/CoursePage', {state: {name: location.state.name, id: location.state.id, user: location.state.user}})}>Return to Course Page</button>
                    <button onClick={() => navigate('/')}>Logout</button>
                </div>

                <Question objectData={location.state.classQuestion} isClassQuestion={true} />

                <button onClick={handleSubmit}>Submit Question</button>
            </div>
        </div>
    )
}

export default QuestionPage;