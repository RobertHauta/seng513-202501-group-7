import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Question from './Question';

const apiURL = import.meta.env.VITE_SERVER_URL;
function QuizPage(){
    const [questions, setQuestions] = useState([]);
    const [optionsSelected, setOptionsSelected] = useState([]);

    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => { //Run on load
        console.log('Quiz Page loaded');
        const fetchQuestions = async () => {
            let response = await getQuestions(location.state.quizObject.id);
            console.log(response);
            
            setQuestions(() => [...response.questions]);
          }
          fetchQuestions();

          setOptionsSelected(Array(questions.length).fill(null));
      }, []);

    async function handleSubmit(){
        console.log(optionsSelected);
        if(optionsSelected.includes(null)){ return alert('Please select an answer for all questions.'); }
        if(optionsSelected.includes(undefined)){ return alert('Please select an answer for all questions.'); }
        if(optionsSelected.length !== questions.length){ return alert('Please select an answer for all questions.'); }

        const submitQuiz = async () => {
            try {
                let data = {};
                data.quizId = location.state.quizObject.id;
                data.studentId = location.state.user.user_id;
                data.answers = [];
                for (let i = 0; i < questions.length; i++) {
                    if(["True", "False"].includes(optionsSelected[i])){
                        data.answers.push({question_id: questions[i].id, option_text: optionsSelected[i], id: "NAN", isMC: false});
                    } else {
                        data.answers.push({question_id: questions[i].id, option_text: optionsSelected[i].option_text, id: optionsSelected[i].id, isMC: true});
                    }
                }
                console.log(data);
                const response = await submitQuizApi(data);
                console.log(response);
            } catch (error) {
                console.error('Error:', error);
            }
        }
        await submitQuiz();
        navigate('/CoursePage', {state: {name: location.state.name, id: location.state.id, user: location.state.user}});
    }

    return (
        <div>
            <h1>{location.state.quizObject.title}</h1>
            <div className='container'>
                <div style={{display: 'flex', marginBottom: "1em"}}>
                    <button type="button" style={{marginRight: 'auto'}} onClick={() => navigate('/CoursePage', {state: {name: location.state.name, id: location.state.id, user: location.state.user}})}>Return to Course Page</button>
                    <button onClick={() => navigate('/')}>Logout</button>
                </div>

                <div>
                    {questions.map((_, index) => (
                            <Question objectData={questions[index]} questionIndex={index} isClassQuestion={false} isGrading={location.state.isGrading} key={index}
                            onOptionSelect={(option, ind) => {
                                setOptionsSelected((prev) => {
                                    const newOptions = [...prev];
                                    console.log(newOptions);
                                    console.log(ind);
                                    newOptions[ind] = option;
                                    return newOptions;
                                });
                            }}/>
                    ))}
                </div>
                    
                <button onClick={handleSubmit}>Submit Quiz</button>
            </div>
        </div>
    )
}

export default QuizPage;

async function getQuestions(id){
    const response = await fetch(`${apiURL}/api/quiz/questions/${id}`,
        {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
    if (!response.ok) {
        console.error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
}

async function submitQuizApi(data){
    const response = await fetch(`${apiURL}/api/quiz/submit`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
    if (!response.ok) {
        console.error(`HTTP error! status: ${response.status}`);
    }
    const result = await response.json();
    return result;
}