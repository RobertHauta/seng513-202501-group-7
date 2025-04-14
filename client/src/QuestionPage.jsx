import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Question from './Question';

const apiURL = import.meta.env.VITE_SERVER_URL;

function QuestionPage(){
    const [classQuestion, setClassQuestion] = useState();
    const [optionSelected, setOptionSelected] = useState(null);

    const navigate = useNavigate();
    const location = useLocation();

    function handleSubmit(){
        const submitAnswer = async () => {
            try {
                const response = await getCorrectAnswerClassQuestion(location, optionSelected, location.state.user.user_id);
            } catch (error) {
                console.error('Error:', error);
            }
        }
        submitAnswer();

        navigate('/CoursePage', {state: {name: location.state.name, id: location.state.id, user: location.state.user}});
    }

    return (
        <div>
            <h1>{location.state.classQuestion.name}</h1>
            <div className='container'>
                <div style={{display: 'flex', marginBottom: "1em"}}>
                    <button type="button" style={{marginRight: 'auto'}} onClick={() => navigate('/CoursePage', {state: {name: location.state.name, id: location.state.id, user: location.state.user}})}>Return to Course Page</button>
                    <button onClick={() => navigate('/')}>Logout</button>
                </div>

                <Question objectData={location.state.classQuestion} student_id={location.state.user.user_id} isClassQuestion={true} isGrading={location.state.isGrading} 
                onOptionSelect={(option)=> {
                    setOptionSelected(option);
                }}/>

                <button onClick={handleSubmit}>Submit Question</button>
            </div>
        </div>
    )
}

export default QuestionPage;

async function getCorrectAnswerClassQuestion(location, option, studentId){
    try{
        const response = await fetch(`${apiURL}/api/classquestions/submit/${location.state.classQuestion.id}/${JSON.stringify(option)}/${studentId}`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
        if (!response.ok) {
            console.error(`HTTP error! status: ${response.status}`);
        }
        if (response.status === 200) {
            const data = await response.json();
            return data;
        }
    }
    catch (error) {
        console.error('Error fetching correct answer:', error);
        throw error;
    }
}