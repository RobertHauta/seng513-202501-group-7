import React, { useState, useEffect } from 'react';

function Question(props){
    const [options, setOptions] = useState([]);

    useEffect(() => { //Run on load
        const fetchOptions = async () => {
            if(props.isClassQuestion === true){
                const response = await getOptionsQuestion(props.objectData.id);
                setOptions(() => [...response.options]);
            }else{
                const response = await getOptionsQuiz(props.objectData.id);
                setOptions(() => [...response.options]);
            }
        }
        fetchOptions();
    }, []);
    
    return (
        <div className='container' style={{backgroundColor: '#5e5e5e'}}>
            <div>
                <h2>Question</h2>
                <hr/>
                <p>{props.objectData.question_text}</p>
                <div>
                    {props.objectData.type_id === 1 && (
                        <div className='optionsContainer'></div>
                    )}
                    {props.objectData.type_id === 2 && (
                        <div className='optionsContainer'>
                            {options.map(option => (
                                <div className='container'>
                                    <p>{option.option_text}</p>
                                </div>
                                ))
                            }
                        </div>
                    )}
                    {props.objectData.type_id === 3 && (
                        <div className='optionsContainer'>
                            <div className='container'>
                                <p>True</p>
                            </div>
                            <div className='container'>
                                <p>False</p>
                            </div>
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
        console.log(id);

        fetch(`http://localhost:5100/api/classquestions/options/${id}`,
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
        fetch(`http://localhost:5100/` , //to be implemented
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
           })
           .then(data => resolve(data))
           .catch(error => reject(error));
}