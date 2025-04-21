import React, { useState, useEffect } from 'react';

const apiURL = import.meta.env.VITE_SERVER_URL;

function Question(props){
    const [options, setOptions] = useState([]);
    const [activeOption, setActiveOption] = useState(null);
    const [studentAnswer, setStudentAnswer] = useState(null);

    useEffect(() => {
        const fetchOptions = async () => {
            try {
                let response;
                if (props.isClassQuestion === true) {
                    response = await getOptionsQuestion(props.objectData.id);
                } else {
                    response = await getOptionsQuiz(props.objectData.id);
                }
                setOptions(response.options);
            } catch (error) {
                console.error("Error fetching options:", error);
            }
        };
        fetchOptions();
    }, [props.isClassQuestion, props.objectData.id]);
    
    useEffect(() => {
        const handleGrading = async () => {
            try {
                if (props.isGrading === true) {
                    const response2 = props.isClassQuestion
                        ? await getAnsweredStudentClassQuest(props.objectData.id, props.studentId)
                        : await getAnsweredStudentQuiz(props.objectData.id, props.studentId);
    
                    if (options.length > 0) {
                        const index = options.findIndex(option => option.option_text === response2.answers[0].selected_answer);
                        setStudentAnswer(index);
                    } else {
                        const answer = response2.answers[0].selected_answer;
                        setStudentAnswer(answer);
                    }
                }
            } catch (error) {
                console.error("Error in handleGrading:", error);
            }
        };
        handleGrading();
    }, [props.isGrading, options, props.isClassQuestion, props.objectData.id, props.studentId]);
    
    return (
        <div className='container' style={{backgroundColor: '#5e5e5e'}}>
            <div>
                <h2>{props.isClassQuestion ? ("Question") : (`Question ${props.questionIndex + 1}`)}</h2>
                <hr/>
                <p>{props.objectData.question_text}</p>
                <div>
                    {props.objectData.type_id === 2 && (
                        <div className='optionsContainer'>
                            {options.map((option,index) => (
                                props.isGrading === true ? (
                                    <div className={option.is_correct ? "container correctOption" : "container"} style={{cursor: "auto"}} key={index}>
                                        {index === studentAnswer ? (
                                            <p>{option.option_text}<b>- STUDENT ANSWER</b></p>
                                        ) : (
                                            <p>{option.option_text}</p>
                                        )}
                                    </div>
                                ) : (
                                    <div className={activeOption === index ? "container hoverOption selectedOption" : "container hoverOption"} key={index} 
                                        onClick={() => {
                                            setActiveOption(index);
                                            if(props.isClassQuestion){
                                                props.onOptionSelect && props.onOptionSelect(option);
                                            }
                                            else{
                                                props.onOptionSelect && props.onOptionSelect(option, props.questionIndex);
                                            }
                                        }}>
                                        <p>{option.option_text}</p>
                                    </div>
                                )
                                ))
                            }
                        </div>
                    )}
                    {props.objectData.type_id === 3 && (
                        <div>
                            {props.isGrading === true ? (
                                <div className='optionsContainer'>
                                    <div className={props.objectData.correct_answer === "True" ? "container correctOption" : "container"} style={{cursor: "auto"}}>
                                        {studentAnswer === "True" ? (
                                            <p>True <b>- STUDENT ANSWER</b></p>
                                        ) : (
                                            <p>True</p>
                                        )}
                                    </div>
                                    <div className={props.objectData.correct_answer === "False" ? "container correctOption" : "container"} style={{cursor: "auto"}}>
                                        {studentAnswer === "False" ? (
                                            <p>False <b>- STUDENT ANSWER</b></p>
                                        ) : (
                                            <p>False</p>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className='optionsContainer'>
                                    <div className={activeOption === 1 ? "container hoverOption selectedOption" : "container hoverOption"} onClick={() => {
                                                    setActiveOption(1);
                                                    if(props.isClassQuestion){
                                                        props.onOptionSelect && props.onOptionSelect("True");
                                                    }
                                                    else{
                                                        props.onOptionSelect && props.onOptionSelect("True", props.questionIndex);
                                                    }
                                                }}>
                                        <p>True</p>
                                    </div>
                                    <div className={activeOption === 0 ? "container hoverOption selectedOption" : "container hoverOption"} onClick={() => {
                                                    setActiveOption(0);
                                                    if(props.isClassQuestion){
                                                        props.onOptionSelect && props.onOptionSelect("False");
                                                    }
                                                    else{
                                                        props.onOptionSelect && props.onOptionSelect("False", props.questionIndex);
                                                    }
                                                }}>
                                        <p>False</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Question;

async function getOptionsQuestion(id){
    return new Promise((resolve, reject) => {
        fetch(`${apiURL}/api/classquestions/options/${id}`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        ).then(res => {
                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }
                return res.json();
            })
           .then(data => resolve(data))
           .catch(error => reject(error));
    });
}

async function getOptionsQuiz(id){
    return new Promise((resolve, reject) => {
        fetch(`${apiURL}/api/quiz/question/options/${id}` ,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            })
           .then(res => {
                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }
                return res.json();
            })
           .then(data => resolve(data))
           .catch(error => reject(error));
    });
}

async function getAnsweredStudentQuiz(questionId, studentId){
    return new Promise((resolve, reject) => {
        fetch(`${apiURL}/api/quiz/question/student/${studentId}/${questionId}`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            })
           .then(res => {
                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }
                return res.json();
            })
           .then(data => resolve(data))
           .catch(error => reject(error));
    });
}

async function getAnsweredStudentClassQuest(questionId, studentId){
    return new Promise((resolve, reject) => {
        fetch(`${apiURL}/api/classquestions/answer/${studentId}/${questionId}`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            })
           .then(res => {
                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }
                return res.json();
            })
           .then(data => resolve(data))
           .catch(error => reject(error));
    });
}