import React, { useState, useEffect } from 'react';

const apiURL = import.meta.env.VITE_SERVER_URL;

function Question(props){
    const [options, setOptions] = useState([]);
    const [activeOption, setActiveOption] = useState(null);

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
                            {options.map((option,index) => (
                                <div className={activeOption === index ? "container selectedOption" : "container"} key={index} onClick={() => setActiveOption(index)}>
                                    <p>{option.option_text}</p>
                                </div>
                                ))
                            }
                        </div>
                    )}
                    {props.objectData.type_id === 3 && (
                        <div className='optionsContainer'>
                            <div className={activeOption === 1 ? "container selectedOption" : "container"} onClick={() => setActiveOption(1)}>
                                <p>True</p>
                            </div>
                            <div className={activeOption === 0 ? "container selectedOption" : "container"} onClick={() => setActiveOption(0)}>
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
        fetch(`${apiURL}/` , //to be implemented
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