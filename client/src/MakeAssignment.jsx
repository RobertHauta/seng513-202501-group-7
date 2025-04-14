import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const apiURL = import.meta.env.VITE_SERVER_URL;

function MakeAssignment(){
    const [questions, setQuestions] = useState([]);
    const formRefs = useRef([]);

    const navigate = useNavigate();
    const location = useLocation();

    const handleSaveQuestion = async (data) => {
        data[0].name = document.getElementById('assName').value;
        data[0].weight = parseInt(document.getElementById('weight').value);
        data[0].posted_at = document.getElementById('rel').value + "T00:00:00";
        data[0].expiry_time = document.getElementById('due').value + "T00:00:00";
        data[0].classroom_id = location.state.id;
        data[0].userId = location.state.user.user_id;
        data[0].role_id = convertRoleToId(location.state.user.role_name);
        console.log(data);
        const response = await createClassQuestion(data[0]);
        console.log(response);
    }

    const createOptionsArray = (question) => {
        let options = [];
        if(question.type_id !== 2){
            return null;
        }
        options.push({"option_text": question.option_text1, "is_correct": question.is_correct1});
        options.push({"option_text": question.option_text2, "is_correct": question.is_correct2});
        options.push({"option_text": question.option_text3, "is_correct": question.is_correct3});
        options.push({"option_text": question.option_text4, "is_correct": question.is_correct4});
        return options;
    }

    const handleSaveQuiz = async (data) => {
        let mes = {};
        mes.title = document.getElementById('assName').value;
        mes.total_weight = parseInt(document.getElementById('weight').value);
        mes.release_date = document.getElementById('rel').value + "T00:00:00";
        mes.due_date = document.getElementById('due').value + "T00:00:00";
        mes.classroom_id = location.state.id;
        mes.created_by = location.state.user.user_id;
        mes.questions = [];
        data.forEach((question)=>{
            mes.questions.push({
               question_text: question.question_text,
               type_id: question.type_id,
               marks: 1,
               correct_answer: question.correct_answer,
               options: createOptionsArray(question) 
            });
        })
        console.log(mes);
        const response = await createQuiz(mes);
        console.log(response);
    }   

    const handleSubmitAll = () => {
        let data = [];
        formRefs.current.forEach((formRef, i) => {
            if (formRef && typeof formRef.submitForm === 'function') {
                data.push(formRef.submitForm());
                console.log(`Question ${i + 1}:`, data);
            } else {
                console.warn(`Form ref ${i} is missing or invalid`);
            }
        });

        if (location.state.type === "quiz") {
            handleSaveQuiz(data);
        } else if (location.state.type === "question"){
            handleSaveQuestion(data);
        }
    };

    const handleRemove = (event) => {
        event.target.closest(".container").remove();
    }

    function addQuestionForm(){
        setQuestions((prev) => [...prev, {}]);
    }

    return (
        <div>
            <h1>Create an Assignment</h1>
            <div className='container'>
                <div style={{display: "flex"}}>
                    <button style={{marginRight: "auto"}} onClick={() => navigate('/CoursePage', {state: {name: location.state.name, id: location.state.id, user: location.state.user}})}>Return to Course</button>
                    <button onClick={() => navigate('/')}>Log Out</button>
                </div>
                <div style={{display: "flex", justifyContent: "space-around", marginTop: "1em"}}>
                    <div>
                        <label>Release Date:</label>
                        <input id="rel" type="date"></input>
                    </div>
                    <div>
                        <label>Due Date:</label>
                        <input id="due" type="date"></input>
                    </div>
                    <div>
                        <label>Weight:</label>
                        <input id='weight' type="number"></input>
                    </div>
                    <div>
                        <label>Assignment Name</label>
                        <input id='assName' type="text"></input>
                    </div>
                </div>
                <div>
                    {location.state.type === "quiz" ? (
                        <div>
                            {questions.map((_, index) => (
                                <div key={index} className='container' style={{backgroundColor: '#5e5e5e'}}>
                                    <button onClick={handleRemove}>Delete</button>
                                    <QuestionForm ref={(el) => (formRefs.current[index] = el)} />
                                </div>
                            ))}
                            <div style={{display: "flex", marginTop: "1em"}}>
                                <button id="addQuestion" style={{marginRight: "auto"}} onClick={addQuestionForm}>+</button>
                                <button onClick={handleSubmitAll}>Create Assignment</button>
                            </div>
                        </div>
                    ) : (
                        <div className='container' style={{backgroundColor: '#5e5e5e'}}>
                            <QuestionForm ref={(el) => (formRefs.current[0] = el)}/>
                            <button onClick={handleSubmitAll}>Create Assignment</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default MakeAssignment;

const QuestionForm = forwardRef((props, ref) => {
    const [type, setType] = useState('');
    const formRef = useRef();

    useImperativeHandle(ref, () => ({
        submitForm: () => {
            const e = formRef.current;
            const formData = new FormData(e);
            const type = formData.get("question");
            let data = {};

            if (type === "MC") {
                data.option_text1 = formData.get("option1");
                data.option_text2 = formData.get("option2");
                data.option_text3 = formData.get("option3");
                data.option_text4 = formData.get("option4");
                data.type_id = 2;
                data.correct_answer = "SELECTED";


                const correct = formData.get("correctOption");
                if(correct === null){
                    return 0;
                }
                data.is_correct1 = correct === "option1";
                data.is_correct2 = correct === "option2";
                data.is_correct3 = correct === "option3";
                data.is_correct4 = correct === "option4";
            }
            else if (type === "TF") {
                data.type_id = 3;
                data.correct_answer = formData.get("correctOption");
            }

            data.question_text = formData.get("text");

            return data;
        }
    }));

    const handleChange = (event) => {
        setType(event.target.value);
    };

    return (
        <form ref={formRef} onSubmit={(e) => {
            e.preventDefault(); // Prevent default behavior
        }}>
            <label htmlFor="text">Question Text: </label>
            <input type="text" id="text" name="text" required />
            <fieldset>
                <legend>Select type of question:</legend>
                <label>
                <input type="radio" name="question" value="MC" onChange={handleChange} required />
                Multiple Choice
                </label>
                <label>
                <input type="radio" name="question" value="TF" onChange={handleChange} required />
                True or False
                </label>
                <label>
                <input type="radio" name="question" value="Match" onChange={handleChange} required />
                Matching
                </label>
            </fieldset>

            {type === "MC" && (
              <div>
                <div>
                  <input type="radio" name="correctOption" value="option1" required />
                  <label>Option 1: </label>
                  <input type="text" name="option1" required />
                </div>
                <div>
                  <input type="radio" name="correctOption" value="option2" />
                  <label>Option 2: </label>
                  <input type="text" name="option2" required />
                </div>
                <div>
                  <input type="radio" name="correctOption" value="option3" />
                  <label>Option 3: </label>
                  <input type="text" name="option3" required />
                </div>
                <div>
                  <input type="radio" name="correctOption" value="option4" />
                  <label>Option 4: </label>
                  <input type="text" name="option4" required />
                </div>
              </div>
            )}

            {type === "TF" && (
                <div>
                    <input type="radio" name="correctOption" value="True" />
                    <label>True</label>
                    <input type="radio" name="correctOption" value="False" />
                    <label>False</label>
                </div>
            )}

            {type === "Match" && (
                <div>
                    <div>
                        <label>Matching Pair 1: </label>
                        <input type="text" name="pair11" required />
                        <input type="text" name="pair21" required />
                    </div>
                    <div>
                        <label>Matching Pair 2: </label>
                        <input type="text" name="pair12" required />
                        <input type="text" name="pair22" required />
                    </div>
                    <div>
                        <label>Matching Pair 3: </label>
                        <input type="text" name="pair13" required />
                        <input type="text" name="pair23" required />
                    </div>
                    <div>
                        <label>Matching Pair 4: </label>
                        <input type="text" name="pair14" required />
                        <input type="text" name="pair24" required />
                    </div>
                </div>
                
            )}
        </form>       
    )
});

function convertRoleToId(roleName) {
    switch(roleName) {
      case "Professor": return 1;
      case "Student": return 3;
      case "TA": return 2;
      default: return 0;
    }
  }

async function createClassQuestion(data){
    return new Promise((resolve, reject) => {
        fetch(`${apiURL}/api/classrooms/question`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        }).then(response => {
            if(response.ok){
                return response.json();
            } else {
                throw new Error('Failed to create assignment');
            }
        }).then(result => {
            resolve(result);
        }).catch(error => {
            reject(error);
        });
    });
}

async function createQuiz(data){
    return new Promise((resolve, reject) => {
        fetch(`${apiURL}/api/quiz/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        }).then(response => {
            if(response.ok){
                return response.json();
            } else {
                throw new Error('Failed to create assignment');
            }
        }).then(result => {
            resolve(result);
        }).catch(error => {
            reject(error);
        });
    });
}