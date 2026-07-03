-- ============================================================
-- PLACEMENT PREPARATION PORTAL - DATABASE SCHEMA
-- ============================================================

CREATE DATABASE IF NOT EXISTS placement_portal;
USE placement_portal;

-- ============================================================
-- TABLE: roles
-- ============================================================
CREATE TABLE roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

-- ============================================================
-- TABLE: users
-- ============================================================
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    usn VARCHAR(20) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role_id BIGINT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE,
    CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles(id)
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_usn ON users(usn);

-- ============================================================
-- TABLE: questions
-- ============================================================
CREATE TABLE questions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    question_text TEXT NOT NULL,
    option_a VARCHAR(500) NOT NULL,
    option_b VARCHAR(500) NOT NULL,
    option_c VARCHAR(500) NOT NULL,
    option_d VARCHAR(500) NOT NULL,
    correct_option CHAR(1) NOT NULL,
    explanation TEXT,
    category ENUM('APTITUDE','LOGICAL_REASONING','VERBAL_ABILITY','TECHNICAL','CODING') NOT NULL,
    company VARCHAR(100),
    difficulty ENUM('EASY','MEDIUM','HARD') DEFAULT 'MEDIUM',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE INDEX idx_questions_category ON questions(category);
CREATE INDEX idx_questions_company ON questions(company);
CREATE INDEX idx_questions_difficulty ON questions(difficulty);

-- ============================================================
-- TABLE: bookmarks
-- ============================================================
CREATE TABLE bookmarks (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    question_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_bookmark (user_id, question_id),
    CONSTRAINT fk_bookmarks_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_bookmarks_question FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
);

CREATE INDEX idx_bookmarks_user ON bookmarks(user_id);

-- ============================================================
-- TABLE: progress
-- ============================================================
CREATE TABLE progress (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    question_id BIGINT NOT NULL,
    selected_option CHAR(1) NOT NULL,
    is_correct BOOLEAN NOT NULL,
    category ENUM('APTITUDE','LOGICAL_REASONING','VERBAL_ABILITY','TECHNICAL','CODING') NOT NULL,
    attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_progress_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_progress_question FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
);

CREATE INDEX idx_progress_user ON progress(user_id);
CREATE INDEX idx_progress_category ON progress(category);

-- ============================================================
-- TABLE: mock_tests
-- ============================================================
CREATE TABLE mock_tests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    total_questions INT NOT NULL DEFAULT 30,
    correct_answers INT DEFAULT 0,
    wrong_answers INT DEFAULT 0,
    score DECIMAL(5,2) DEFAULT 0.00,
    time_taken INT DEFAULT 0 COMMENT 'in seconds',
    status ENUM('IN_PROGRESS','COMPLETED','EXPIRED') DEFAULT 'IN_PROGRESS',
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    CONSTRAINT fk_mock_tests_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_mock_tests_user ON mock_tests(user_id);

-- ============================================================
-- TABLE: mock_test_questions (junction)
-- ============================================================
CREATE TABLE mock_test_questions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    mock_test_id BIGINT NOT NULL,
    question_id BIGINT NOT NULL,
    selected_option CHAR(1),
    is_correct BOOLEAN,
    CONSTRAINT fk_mtq_test FOREIGN KEY (mock_test_id) REFERENCES mock_tests(id) ON DELETE CASCADE,
    CONSTRAINT fk_mtq_question FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
);

-- ============================================================
-- SEED DATA: roles
-- ============================================================
INSERT INTO roles (name) VALUES ('STUDENT'), ('ADMIN');

-- ============================================================
-- SEED DATA: admin user (password: admin123)
-- ============================================================
INSERT INTO users (name, email, usn, password, role_id)
VALUES ('Admin', 'admin@placement.com', 'ADMIN001',
        '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBpwTpyE7SyNKi', 2);

-- ============================================================
-- SEED DATA: sample questions
-- ============================================================
INSERT INTO questions (question_text, option_a, option_b, option_c, option_d, correct_option, explanation, category, company, difficulty) VALUES
-- APTITUDE
('A train 125m long passes a man, running at 5km/hr in the same direction in which the train is going, in 10 seconds. What is the speed of the train?',
 '45 km/hr','50 km/hr','54 km/hr','55 km/hr','B',
 'Speed of train relative to man = 125/10 = 12.5 m/s = 45 km/hr. Train speed = 45 + 5 = 50 km/hr.',
 'APTITUDE','TCS','MEDIUM'),

('What percentage of numbers from 1 to 70 have squares that end in the digit 1?',
 '1','14','20%','21%','C',
 'Numbers whose squares end in 1: 1,9,11,19,21,29,31,39,41,49,51,59,61,69 = 14 numbers. 14/70 * 100 = 20%.',
 'APTITUDE','Infosys','MEDIUM'),

('The average of 20 numbers is zero. Of them, at most, how many may be greater than zero?',
 '0','1','10','19','D',
 'Average of 20 numbers is 0. So sum = 0. At most 19 can be positive and 1 negative to balance.',
 'APTITUDE','Wipro','EASY'),

('A and B together can do a piece of work in 12 days. A alone can do the work in 20 days. How many days will B take alone?',
 '25 days','30 days','28 days','35 days','B',
 'A+B = 1/12 per day. A = 1/20. B = 1/12 - 1/20 = 5/60 - 3/60 = 2/60 = 1/30. B alone = 30 days.',
 'APTITUDE','Accenture','MEDIUM'),

('Find the compound interest on Rs. 7500 at 4% per annum for 2 years.',
 'Rs. 600','Rs. 612','Rs. 624','Rs. 636','B',
 'CI = P[(1+r/100)^n - 1] = 7500[(1.04)^2 - 1] = 7500 * 0.0816 = Rs. 612.',
 'APTITUDE','Cognizant','MEDIUM'),

-- LOGICAL REASONING
('In a certain code, COMPUTER is written as RFUVQNPC. How is MEDICINE written in that code?',
 'EOJDJEFM','MFEJDJOE','EFJDEJOM','MFEJDEJOE','A',
 'Each letter is coded by reversing its position in reverse alphabet order.',
 'LOGICAL_REASONING','TCS','HARD'),

('If A + B means A is the mother of B; A - B means A is the brother of B; A * B means A is the father of B and A / B means A is the sister of B, which of the following shows P is the maternal uncle of Q?',
 'Q - N + M * P','P - M + N * Q','Q / N * M - P','P + S * N - Q','B',
 'P-M means P is brother of M. M+N means M is mother of N. N*Q means N is father of Q. So P is maternal uncle of Q.',
 'LOGICAL_REASONING','Infosys','HARD'),

('Pointing to a photograph, a man said, "I have no brother or sister but that man''s father is my father''s son." Whose photograph was it?',
 'His own','His son''s','His father''s','His nephew''s','B',
 'The man has no siblings. His father''s son = himself. So that man''s father = himself. The photo is of his son.',
 'LOGICAL_REASONING','Wipro','MEDIUM'),

-- VERBAL ABILITY
('Choose the word which is most similar in meaning to "EPHEMERAL".',
 'Permanent','Transitory','Eternal','Lasting','B',
 'Ephemeral means lasting for a very short time. Transitory means not permanent.',
 'VERBAL_ABILITY','Accenture','MEDIUM'),

('Select the correctly spelt word.',
 'Accomodation','Accommodation','Acommodation','Acomodation','B',
 'The correct spelling is Accommodation with double c and double m.',
 'VERBAL_ABILITY','Capgemini','EASY'),

-- TECHNICAL
('Which of the following is NOT a feature of Object-Oriented Programming?',
 'Encapsulation','Polymorphism','Compilation','Inheritance','C',
 'OOP features are Encapsulation, Inheritance, Polymorphism, and Abstraction. Compilation is not an OOP feature.',
 'TECHNICAL','TCS','EASY'),

('What is the time complexity of Binary Search?',
 'O(n)','O(n^2)','O(log n)','O(n log n)','C',
 'Binary search divides the search space in half each time, giving O(log n) time complexity.',
 'TECHNICAL','Infosys','EASY'),

('Which SQL keyword is used to retrieve unique values?',
 'UNIQUE','DISTINCT','DIFFERENT','SEPARATE','B',
 'The DISTINCT keyword is used in SQL to return only distinct (different) values.',
 'TECHNICAL','Wipro','EASY'),

('What is the output of: int x = 5; System.out.println(x++);',
 '5','6','4','Error','A',
 'x++ is post-increment. The current value (5) is printed first, then x becomes 6.',
 'TECHNICAL','Accenture','EASY'),

('Which data structure uses LIFO (Last In First Out) principle?',
 'Queue','Stack','Array','Linked List','B',
 'Stack follows LIFO principle - the last element inserted is the first to be removed.',
 'TECHNICAL','Cognizant','EASY'),

-- CODING
('What will be the output of the following code?\nfor(int i=0; i<3; i++) { System.out.print(i + " "); }',
 '0 1 2','1 2 3','0 1 2 3','1 2','A',
 'Loop runs for i=0,1,2. Prints 0, 1, 2 with spaces.',
 'CODING','TCS','EASY'),

('Which sorting algorithm has the best average-case time complexity?',
 'Bubble Sort','Selection Sort','Merge Sort','Insertion Sort','C',
 'Merge Sort has O(n log n) average-case complexity which is the best among comparison-based sorts.',
 'CODING','Infosys','MEDIUM'),

('What is recursion in programming?',
 'A loop that runs forever','A function that calls itself','A variable that stores functions','None of the above','B',
 'Recursion is a technique where a function calls itself directly or indirectly until a base condition is met.',
 'CODING','Wipro','EASY');