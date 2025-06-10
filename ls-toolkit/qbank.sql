-- =====================================================
-- FUTURE-PROOF QUESTION BANK SCHEMA
-- Supports multiple books, boards, grades, and subjects
-- =====================================================

-- Question Types Configuration
CREATE TABLE Question_Types (
    question_type_pk SERIAL PRIMARY KEY,
    type_code VARCHAR(20) NOT NULL UNIQUE, -- MCQ, SHORT, LONG, NUMERICAL, TRUE_FALSE, FILL_BLANK
    type_name VARCHAR(50) NOT NULL,
    is_exam_pattern BOOLEAN DEFAULT TRUE, -- TRUE for MCQ/Short/Long, FALSE for practice types
    marks_range VARCHAR(20), -- e.g., "1", "2", "4-5"
    typical_time_minutes INTEGER,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Cognitive Levels (Bloom's Taxonomy)
CREATE TABLE Cognitive_Levels (
    cognitive_level_pk SERIAL PRIMARY KEY,
    level_code VARCHAR(20) NOT NULL UNIQUE, -- REMEMBER, UNDERSTAND, APPLY, ANALYZE
    level_name VARCHAR(50) NOT NULL,
    level_order INTEGER NOT NULL,
    description TEXT
);

-- Difficulty Levels
CREATE TABLE Difficulty_Levels (
    difficulty_pk SERIAL PRIMARY KEY,
    difficulty_code VARCHAR(20) NOT NULL UNIQUE, -- VERY_EASY, EASY, MEDIUM, HARD, VERY_HARD
    difficulty_name VARCHAR(50) NOT NULL,
    difficulty_value INTEGER NOT NULL CHECK (difficulty_value BETWEEN 1 AND 5),
    description TEXT
);

-- Assessment Patterns (Punjab Board, Federal Board, Cambridge, etc.)
CREATE TABLE Assessment_Patterns (
    pattern_pk SERIAL PRIMARY KEY,
    pattern_code VARCHAR(50) NOT NULL UNIQUE,
    pattern_name VARCHAR(100) NOT NULL,
    board_fk INTEGER REFERENCES Boards(board_pk),
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE
);

-- Question Pattern Rules (defines what types of questions appear in which pattern)
CREATE TABLE Assessment_Pattern_Rules (
    rule_pk SERIAL PRIMARY KEY,
    pattern_fk INTEGER NOT NULL REFERENCES Assessment_Patterns(pattern_pk),
    question_type_fk INTEGER NOT NULL REFERENCES Question_Types(question_type_pk),
    section_name VARCHAR(100), -- "Section A - MCQs", "Section B - Short Questions"
    marks_per_question INTEGER,
    quantity INTEGER, -- How many questions of this type
    is_compulsory BOOLEAN DEFAULT TRUE
);

-- Main Questions Table with denormalized fields for performance
CREATE TABLE Questions (
    question_pk SERIAL PRIMARY KEY,
    -- Direct relationships
    topic_fk INTEGER NOT NULL REFERENCES Topics(topic_pk) ON DELETE CASCADE,
    question_type_fk INTEGER NOT NULL REFERENCES Question_Types(question_type_pk),
    cognitive_level_fk INTEGER NOT NULL REFERENCES Cognitive_Levels(cognitive_level_pk),
    difficulty_fk INTEGER NOT NULL REFERENCES Difficulty_Levels(difficulty_pk),

    -- Denormalized fields for fast filtering
    book_fk INTEGER NOT NULL REFERENCES Books(book_pk),
    chapter_fk INTEGER NOT NULL REFERENCES Chapters(chapter_pk),
    board_fk INTEGER REFERENCES Boards(board_pk),
    grade_fk INTEGER REFERENCES Grades(grade_pk),
    subject VARCHAR(100) NOT NULL,

    -- Question content
    question_text TEXT NOT NULL,
    question_text_urdu TEXT, -- For bilingual support
    marks INTEGER NOT NULL,
    estimated_time_minutes INTEGER,

    -- Metadata
    is_important_for_exam BOOLEAN DEFAULT FALSE,
    is_frequently_asked BOOLEAN DEFAULT FALSE,
    year_appeared INTEGER[], -- Array of years this appeared in board exams
    exam_references TEXT[], -- Array of exam references like "Punjab Board 2023 Q5"

    -- Search and categorization
    tags TEXT[], -- Array of tags for flexible categorization
    keywords TEXT[], -- For better search

    -- Status and versioning
    status VARCHAR(20) DEFAULT 'ACTIVE', -- ACTIVE, ARCHIVED, DRAFT
    version INTEGER DEFAULT 1,
    created_by INTEGER, -- Reference to user who created
    reviewed_by INTEGER, -- Reference to user who reviewed
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Key Terms/Concepts for memorization
CREATE TABLE Key_Terms (
    key_term_pk SERIAL PRIMARY KEY,
    topic_fk INTEGER NOT NULL REFERENCES Topics(topic_pk) ON DELETE CASCADE,
    book_fk INTEGER NOT NULL REFERENCES Books(book_pk), -- Denormalized
    chapter_fk INTEGER NOT NULL REFERENCES Chapters(chapter_pk), -- Denormalized

    term TEXT NOT NULL,
    definition TEXT NOT NULL,
    definition_urdu TEXT,

    -- Additional learning aids
    formula TEXT, -- If it's a formula
    unit TEXT, -- SI unit if applicable
    value TEXT, -- Constant value if applicable
    mnemonic_hint TEXT, -- Memory aids
    visual_aid_url TEXT, -- Link to diagram/image

    importance_level INTEGER CHECK (importance_level BETWEEN 1 AND 3), -- 1=Must know
    term_type VARCHAR(50), -- DEFINITION, FORMULA, CONSTANT, LAW, PRINCIPLE

    -- Cross-references
    related_terms INTEGER[], -- Array of related key_term_pks

    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(topic_fk, term)
);

-- Question Answers/Solutions
CREATE TABLE Question_Answers (
    answer_pk SERIAL PRIMARY KEY,
    question_fk INTEGER NOT NULL REFERENCES Questions(question_pk) ON DELETE CASCADE,

    -- Answer content
    answer_text TEXT NOT NULL,
    answer_text_urdu TEXT,

    -- Structured marking scheme
    answer_points JSONB, -- JSON array of points with marks
    total_marks INTEGER NOT NULL,

    -- Additional help
    explanation TEXT, -- Detailed explanation
    solution_steps JSONB, -- For numerical problems
    diagram_url TEXT, -- If answer needs diagram
    common_mistakes TEXT,
    examiner_notes TEXT,

    -- Alternative answers
    alternative_answers TEXT[], -- Other acceptable answers

    created_at TIMESTAMP DEFAULT NOW()
);

-- MCQ Options
CREATE TABLE MCQ_Options (
    option_pk SERIAL PRIMARY KEY,
    question_fk INTEGER NOT NULL REFERENCES Questions(question_pk) ON DELETE CASCADE,
    option_letter CHAR(1) NOT NULL CHECK (option_letter IN ('A', 'B', 'C', 'D')),
    option_text TEXT NOT NULL,
    option_text_urdu TEXT,
    is_correct BOOLEAN DEFAULT FALSE,
    explanation_if_wrong TEXT,
    UNIQUE(question_fk, option_letter)
);

-- Question Sets/Banks for organizing
CREATE TABLE Question_Banks (
    bank_pk SERIAL PRIMARY KEY,
    bank_name VARCHAR(255) NOT NULL,
    bank_type VARCHAR(50), -- CHAPTER_WISE, TOPIC_WISE, MOCK_TEST, BOARD_PATTERN

    -- Scope definition
    book_fk INTEGER REFERENCES Books(book_pk),
    chapter_fk INTEGER REFERENCES Chapters(chapter_pk),
    grade_fk INTEGER REFERENCES Grades(grade_pk),
    board_fk INTEGER REFERENCES Boards(board_pk),
    assessment_pattern_fk INTEGER REFERENCES Assessment_Patterns(pattern_pk),

    -- Bank properties
    total_marks INTEGER,
    time_limit_minutes INTEGER,
    difficulty_level VARCHAR(20),

    -- Metadata
    description TEXT,
    instructions TEXT,
    is_published BOOLEAN DEFAULT FALSE,
    created_by INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Junction table for questions in banks
CREATE TABLE Question_Bank_Items (
    bank_item_pk SERIAL PRIMARY KEY,
    bank_fk INTEGER NOT NULL REFERENCES Question_Banks(bank_pk) ON DELETE CASCADE,
    question_fk INTEGER NOT NULL REFERENCES Questions(question_pk),
    question_order INTEGER NOT NULL,
    section VARCHAR(100), -- Section within the test
    is_compulsory BOOLEAN DEFAULT TRUE,
    UNIQUE(bank_fk, question_fk)
);

-- Past Papers Repository
CREATE TABLE Past_Papers (
    paper_pk SERIAL PRIMARY KEY,
    board_fk INTEGER REFERENCES Boards(board_pk),
    grade_fk INTEGER REFERENCES Grades(grade_pk),
    subject VARCHAR(100) NOT NULL,
    year INTEGER NOT NULL,
    session VARCHAR(50), -- "Annual", "Supplementary"
    paper_type VARCHAR(50), -- "Theory", "Practical"
    total_marks INTEGER,
    duration_minutes INTEGER,
    file_url TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Link questions to past papers
CREATE TABLE Past_Paper_Questions (
    past_paper_question_pk SERIAL PRIMARY KEY,
    paper_fk INTEGER NOT NULL REFERENCES Past_Papers(paper_pk),
    question_fk INTEGER NOT NULL REFERENCES Questions(question_pk),
    question_number VARCHAR(20), -- "Q1(a)", "Q2"
    section VARCHAR(100),
    marks_in_paper INTEGER
);

-- Student interaction tracking
CREATE TABLE Question_Analytics (
    analytics_pk SERIAL PRIMARY KEY,
    question_fk INTEGER NOT NULL REFERENCES Questions(question_pk),
    total_attempts INTEGER DEFAULT 0,
    correct_attempts INTEGER DEFAULT 0,
    avg_time_spent FLOAT,
    difficulty_rating FLOAT, -- User-rated difficulty
    last_calculated TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_questions_book ON Questions(book_fk);
CREATE INDEX idx_questions_chapter ON Questions(chapter_fk);
CREATE INDEX idx_questions_subject ON Questions(subject);
CREATE INDEX idx_questions_grade ON Questions(grade_fk);
CREATE INDEX idx_questions_board ON Questions(board_fk);
CREATE INDEX idx_questions_type ON Questions(question_type_fk);
CREATE INDEX idx_questions_difficulty ON Questions(difficulty_fk);
CREATE INDEX idx_questions_composite ON Questions(book_fk, chapter_fk, topic_fk);
CREATE INDEX idx_questions_tags ON Questions USING GIN(tags);
CREATE INDEX idx_questions_years ON Questions USING GIN(year_appeared);

-- Full-text search indexes
CREATE INDEX idx_questions_fulltext ON Questions
    USING GIN(to_tsvector('english', question_text));
CREATE INDEX idx_key_terms_fulltext ON Key_Terms
    USING GIN(to_tsvector('english', term || ' ' || COALESCE(definition, '')));

-- Triggers for maintaining denormalized fields
CREATE OR REPLACE FUNCTION update_question_metadata()
RETURNS TRIGGER AS $$
BEGIN
    -- Update denormalized fields when topic_fk changes
    SELECT b.book_pk, b.subject, b.board_fk, b.grade_fk, ch.chapter_pk
    INTO NEW.book_fk, NEW.subject, NEW.board_fk, NEW.grade_fk, NEW.chapter_fk
    FROM Topics t
    JOIN Chapters ch ON t.chapter_fk = ch.chapter_pk
    JOIN Books b ON ch.book_fk = b.book_pk
    WHERE t.topic_pk = NEW.topic_fk;

    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_question_metadata
BEFORE INSERT OR UPDATE OF topic_fk ON Questions
FOR EACH ROW
EXECUTE FUNCTION update_question_metadata();

-- Trigger for key terms denormalization
CREATE OR REPLACE FUNCTION update_key_term_metadata()
RETURNS TRIGGER AS $$
BEGIN
    SELECT b.book_pk, ch.chapter_pk
    INTO NEW.book_fk, NEW.chapter_fk
    FROM Topics t
    JOIN Chapters ch ON t.chapter_fk = ch.chapter_pk
    JOIN Books b ON ch.book_fk = b.book_pk
    WHERE t.topic_pk = NEW.topic_fk;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_key_term_metadata
BEFORE INSERT OR UPDATE OF topic_fk ON Key_Terms
FOR EACH ROW
EXECUTE FUNCTION update_key_term_metadata();

-- Sample data insertion
INSERT INTO Question_Types (type_code, type_name, is_exam_pattern, marks_range) VALUES
('MCQ', 'Multiple Choice', TRUE, '1'),
('SHORT', 'Short Answer', TRUE, '2'),
('LONG', 'Long Answer', TRUE, '4-5'),
('NUMERICAL', 'Numerical Problem', TRUE, '2-5'),
('TRUE_FALSE', 'True/False', FALSE, '1'),
('FILL_BLANK', 'Fill in the Blanks', FALSE, '1');

INSERT INTO Cognitive_Levels (level_code, level_name, level_order) VALUES
('REMEMBER', 'Remember', 1),
('UNDERSTAND', 'Understand', 2),
('APPLY', 'Apply', 3),
('ANALYZE', 'Analyze', 4);

INSERT INTO Difficulty_Levels (difficulty_code, difficulty_name, difficulty_value) VALUES
('VERY_EASY', 'Very Easy', 1),
('EASY', 'Easy', 2),
('MEDIUM', 'Medium', 3),
('HARD', 'Hard', 4),
('VERY_HARD', 'Very Hard', 5);
