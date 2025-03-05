CREATE TABLE IF NOT EXISTS Roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS  Users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role_id INT REFERENCES Roles(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS  Classrooms (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    professor_id INT REFERENCES Users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS  ClassroomMembers (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES Users(id) ON DELETE CASCADE,
    classroom_id INT REFERENCES Classrooms(id) ON DELETE CASCADE,
    role_id INT REFERENCES Roles(id) ON DELETE CASCADE, -- TA or Student
    UNIQUE(user_id, classroom_id)
);

CREATE TABLE IF NOT EXISTS  Quizzes (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    classroom_id INT REFERENCES Classrooms(id) ON DELETE CASCADE,
    created_by INT REFERENCES Users(id) ON DELETE SET NULL,
    total_weight FLOAT NOT NULL DEFAULT 0.0, -- Moved from QuizWeights table
    release_date TIMESTAMP,
    due_date TIMESTAMP
);

CREATE TABLE IF NOT EXISTS  QuestionTypes (
    id SERIAL PRIMARY KEY,
    type_name VARCHAR(50) UNIQUE NOT NULL -- Matching, Multiple Choice, True/False
);

CREATE TABLE IF NOT EXISTS  Questions (
    id SERIAL PRIMARY KEY,
    quiz_id INT REFERENCES Quizzes(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL, -- Will serialize for matching
    type_id INT REFERENCES QuestionTypes(id) ON DELETE CASCADE,
    marks INT,
    correct_answer TEXT NOT NULL -- Stores the correct answer -- Serialize for matching
);

CREATE TABLE IF NOT EXISTS  ClassQuestions (
    id SERIAL PRIMARY KEY,
    classroom_id INT REFERENCES Classrooms(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    type_id INT REFERENCES QuestionTypes(id) ON DELETE CASCADE,
    correct_answer TEXT NOT NULL,
    posted_at TIMESTAMP DEFAULT NOW(),
    weight INT,
    expiry_time TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS  Options (
    id SERIAL PRIMARY KEY,
    question_id INT REFERENCES Questions(id) ON DELETE CASCADE,
    class_question_id INT REFERENCES ClassQuestions(id) ON DELETE CASCADE,
    option_text TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT chk_question_source CHECK (
        (question_id IS NOT NULL AND class_question_id IS NULL) OR 
        (question_id IS NULL AND class_question_id IS NOT NULL)
    )
);

CREATE TABLE IF NOT EXISTS  StudentAnswers (
    id SERIAL PRIMARY KEY,
    student_id INT REFERENCES Users(id) ON DELETE CASCADE,
    question_id INT REFERENCES Questions(id) ON DELETE CASCADE,
    class_question_id INT REFERENCES ClassQuestions(id) ON DELETE CASCADE,
    selected_answer TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL,
    submitted_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT chk_answer_source CHECK (
        (question_id IS NOT NULL AND class_question_id IS NULL) OR 
        (question_id IS NULL AND class_question_id IS NOT NULL)
    )
);


CREATE TABLE IF NOT EXISTS  Grades (
    id SERIAL PRIMARY KEY,
    student_id INT REFERENCES Users(id) ON DELETE CASCADE,
    quiz_id INT REFERENCES Quizzes(id) ON DELETE CASCADE,
    score FLOAT NOT NULL,
    graded_by INT REFERENCES Users(id) -- TA or Professor
);

-- Insert default roles
INSERT INTO Roles (name) VALUES
    ('Professor'),
    ('TA'),
    ('Student');

-- Insert default question types
INSERT INTO QuestionTypes (type_name) VALUES
    ('Matching'),
    ('Multiple Choice'),
    ('True/False');

