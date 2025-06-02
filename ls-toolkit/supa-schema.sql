-- Boards table
CREATE TABLE IF NOT EXISTS Boards (
    board_pk SERIAL PRIMARY KEY,
    board_name VARCHAR(100) UNIQUE NOT NULL,
    country VARCHAR(50),
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

-- Grades table
CREATE TABLE IF NOT EXISTS Grades (
    grade_pk SERIAL PRIMARY KEY,
    grade_name VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

-- Books table
CREATE TABLE IF NOT EXISTS Books (
    book_pk SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    board_fk INTEGER REFERENCES Boards(board_pk) ON DELETE SET NULL,
    grade_fk INTEGER REFERENCES Grades(grade_pk) ON DELETE SET NULL,
    subject VARCHAR(100) NOT NULL,
    author VARCHAR(255),
    publication_year INTEGER,
    isbn VARCHAR(20) UNIQUE,
    edition VARCHAR(50),
    description TEXT,
    language VARCHAR(50) DEFAULT 'English',
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

-- Chapters table
CREATE TABLE IF NOT EXISTS Chapters (
    chapter_pk SERIAL PRIMARY KEY,
    book_fk INTEGER NOT NULL REFERENCES Books(book_pk) ON DELETE CASCADE,
    chapter_number_display VARCHAR(20) NOT NULL,
    chapter_order INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    UNIQUE (book_fk, chapter_order),
    UNIQUE (book_fk, chapter_number_display)
);

-- Topics table
CREATE TABLE IF NOT EXISTS Topics (
    topic_pk SERIAL PRIMARY KEY,
    chapter_fk INTEGER NOT NULL REFERENCES Chapters(chapter_pk) ON DELETE CASCADE,
    topic_xml_id VARCHAR(20) NOT NULL,
    title VARCHAR(255) NOT NULL,
    order_in_chapter INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    UNIQUE (chapter_fk, topic_xml_id),
    UNIQUE (chapter_fk, order_in_chapter)
);

-- Sections table
CREATE TABLE IF NOT EXISTS Sections (
    section_pk SERIAL PRIMARY KEY,
    topic_fk INTEGER NOT NULL REFERENCES Topics(topic_pk) ON DELETE CASCADE,
    section_type_xml VARCHAR(50) NOT NULL,
    title VARCHAR(255),
    order_in_topic INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

-- Content_Elements table
CREATE TABLE IF NOT EXISTS Content_Elements (
    element_pk SERIAL PRIMARY KEY,
    section_fk INTEGER NOT NULL REFERENCES Sections(section_pk) ON DELETE CASCADE,
    element_type VARCHAR(100) NOT NULL,
    xml_id_attribute VARCHAR(50),
    title_attribute VARCHAR(255),
    text_content TEXT,
    attribute_level VARCHAR(20),
    attribute_type VARCHAR(50),
    formula_type VARCHAR(20),
    order_in_section INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

-- List_Items table
CREATE TABLE IF NOT EXISTS List_Items (
    list_item_pk SERIAL PRIMARY KEY,
    parent_content_element_fk INTEGER NOT NULL REFERENCES Content_Elements(element_pk) ON DELETE CASCADE,
    item_text TEXT NOT NULL,
    order_in_list INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

-- Table_Data table
CREATE TABLE IF NOT EXISTS Table_Data (
    table_data_pk SERIAL PRIMARY KEY,
    parent_content_element_fk INTEGER NOT NULL REFERENCES Content_Elements(element_pk) ON DELETE CASCADE,
    row_number INTEGER NOT NULL,
    column_number INTEGER NOT NULL,
    cell_content TEXT,
    is_header BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

CREATE TABLE words (
    word_pk SERIAL PRIMARY KEY,
    word_text TEXT NOT NULL UNIQUE,       -- The normalized word/term (e.g., lowercase)
    meaning TEXT,                         -- Primary English explanation (maps to JSON "explanation")
    explanation TEXT,                     -- Could be a more detailed explanation or an example (maps to JSON "example_sentence")
    urdu_meaning TEXT,                    -- Dedicated column for Urdu meaning
    term_type VARCHAR(50),                -- e.g., "compound", "element", "concept"
    book_fk INTEGER NOT NULL REFERENCES books(book_pk) DEFAULT 1,
    properties JSONB,          -- To store the dynamic "properties" object and other less critical fields from the root of the JSON
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()   -- Good practice to track updates
);

-- Optional: Indexes for frequently queried columns
CREATE INDEX idx_words_term_type ON words(term_type);
CREATE INDEX idx_words_book_fk ON words(book_fk);
CREATE INDEX idx_words_properties_gin ON words USING GIN (properties);

CREATE TABLE topic_words (
    topic_word_pk SERIAL PRIMARY KEY,
       topic_fk INTEGER NOT NULL REFERENCES topics(topic_pk),
       word_fk INTEGER NOT NULL REFERENCES words(word_pk),
       created_at TIMESTAMPTZ DEFAULT NOW(),
       CONSTRAINT topic_words_topic_fk_word_fk_key UNIQUE (topic_fk, word_fk) -- Prevents duplicate links
     );
