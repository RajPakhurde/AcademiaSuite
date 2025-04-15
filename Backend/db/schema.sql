-- Create students table
CREATE TABLE IF NOT EXISTS students (
    student_id TEXT PRIMARY KEY,
    seat_no TEXT NOT NULL,
    student_name TEXT NOT NULL,
    branch TEXT NOT NULL,
    year TEXT NOT NULL
);

-- Create exams table
CREATE TABLE IF NOT EXISTS exams (
    exam_id INTEGER PRIMARY KEY AUTOINCREMENT,
    year TEXT NOT NULL,
    branch TEXT NOT NULL,
    semester TEXT NOT NULL,
    exam_type TEXT NOT NULL,
    pattern TEXT NOT NULL,
    heldin_month TEXT,
    heldin_year TEXT
);

-- Create marks table
CREATE TABLE IF NOT EXISTS marks (
    mark_id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id TEXT NOT NULL,
    exam_id INTEGER NOT NULL,
    subject TEXT NOT NULL,
    credit INTEGER NOT NULL,
    ese_marks INTEGER,
    ia_marks INTEGER,
    FOREIGN KEY (student_id) REFERENCES students(student_id),
    FOREIGN KEY (exam_id) REFERENCES exams(exam_id)
);

-- Create subject_master table
CREATE TABLE IF NOT EXISTS subject_master (
    subject_id INTEGER PRIMARY KEY AUTOINCREMENT,
    subject_name TEXT NOT NULL,
    branch TEXT NOT NULL,
    semester TEXT NOT NULL,
    pattern TEXT NOT NULL,
    credit INTEGER NOT NULL
); 