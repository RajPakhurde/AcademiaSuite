-- Insert sample students
INSERT INTO students (student_id, seat_no, student_name, branch, year) VALUES
('ST001', '12345', 'John Doe', 'COMPUTER ENGINEERING', '01/June 2011-31/May/2012'),
('ST002', '12346', 'Jane Smith', 'COMPUTER ENGINEERING', '01/June 2011-31/May/2012'),
('ST003', '12347', 'Bob Johnson', 'COMPUTER ENGINEERING', '01/June 2011-31/May/2012');

-- Insert sample exam
INSERT INTO exams (year, branch, semester, exam_type, pattern, heldin_month, heldin_year) VALUES
('01/June 2011-31/May/2012', 'COMPUTER ENGINEERING', 'Semester 1', 'Regular', 'CBGS', 'December', '2011');

-- Insert sample subjects
INSERT INTO subject_master (subject_name, branch, semester, pattern, credit) VALUES
('Mathematics', 'COMPUTER ENGINEERING', 'Semester 1', 'CBGS', 4),
('Physics', 'COMPUTER ENGINEERING', 'Semester 1', 'CBGS', 4),
('Programming', 'COMPUTER ENGINEERING', 'Semester 1', 'CBGS', 4);

-- Insert sample marks
INSERT INTO marks (student_id, exam_id, subject, credit, ese_marks, ia_marks) VALUES
('ST001', 1, 'Mathematics', 4, 75, 25),
('ST001', 1, 'Physics', 4, 80, 20),
('ST001', 1, 'Programming', 4, 85, 30),
('ST002', 1, 'Mathematics', 4, 70, 20),
('ST002', 1, 'Physics', 4, 75, 25),
('ST002', 1, 'Programming', 4, 80, 25),
('ST003', 1, 'Mathematics', 4, 65, 20),
('ST003', 1, 'Physics', 4, 70, 20),
('ST003', 1, 'Programming', 4, 75, 25); 