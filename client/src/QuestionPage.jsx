import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Question from './Question';

const apiURL = import.meta.env.VITE_SERVER_URL;

function QuestionPage(){
    const [optionSelected, setOptionSelected] = useState(null);

    const navigate = useNavigate();
    const location = useLocation();

    async function handleSubmit(){
        if(optionSelected === null){ return alert("Please answer the question before submitting."); }

        const submitAnswer = async () => {
            try {
                const response = await getCorrectAnswerClassQuestion(location, optionSelected, location.state.user.user_id);
            } catch (error) {
                console.error('Error:', error);
            }
        }
        await submitAnswer();

        navigate('/CoursePage', {state: {name: location.state.name, id: location.state.id, user: location.state.user}});
    }

    return (
        <div>
            {location.state.isGrading ? (
                <h1>{location.state.student_name} - {location.state.classQuestion.name}</h1>
            ) : (
                <h1>{location.state.classQuestion.name}</h1>
            )}
            <div className='container'>
                <div style={{display: 'flex', marginBottom: "1em"}}>
                    <button type="button" style={{marginRight: 'auto'}} onClick={() => navigate('/CoursePage', {state: {name: location.state.name, id: location.state.id, user: location.state.user}})}>Return to Course Page</button>
                    <button onClick={() => navigate('/')}>Logout</button>
                </div>

                <Question objectData={location.state.classQuestion} student_id={location.state.user.user_id} isClassQuestion={true} isGrading={location.state.isGrading} studentId={location.state.student_id}
                onOptionSelect={(option)=> {
                    setOptionSelected(option);
                }}/>

                {location.state.isGrading ? (
                    <button onClick={() => navigate('/ClassList', {state: {classQuestion: location.state.classQuestion, name: location.state.name, id: location.state.id, user: location.state.user, headers: ['Student Name','Achieved Grade', null]}})}>Return to Grades</button>
                ) : (
                    <button onClick={handleSubmit}>Submit Question</button>
                )}
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