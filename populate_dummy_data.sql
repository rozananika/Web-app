-- Dummy Data for Library Management System

-- Insert dummy users
INSERT INTO users (username, email, password_hash, role) VALUES
('john_doe', 'john@example.com', 'hashed_password_1', 'user'),
('jane_smith', 'jane@example.com', 'hashed_password_2', 'user'),
('admin_user', 'admin@example.com', 'hashed_password_3', 'admin');

-- Insert dummy books
INSERT INTO books (isbn, title, author, publisher, publication_year, genre, description, total_copies, available_copies, cover_image_url) VALUES
('978-3-16-148410-0', 'The Great Gatsby', 'F. Scott Fitzgerald', 'Scribner', 1925, 'Fiction', 'A novel set in the Roaring Twenties.', 5, 5, 'https://example.com/gatsby.jpg'),
('978-1-56619-909-4', 'To Kill a Mockingbird', 'Harper Lee', 'J.B. Lippincott & Co.', 1960, 'Fiction', 'A novel about racial injustice in the Deep South.', 3, 3, 'https://example.com/mockingbird.jpg'),
('978-0-7432-7356-5', '1984', 'George Orwell', 'Secker & Warburg', 1949, 'Dystopian', 'A dystopian novel set in a totalitarian society.', 4, 4, 'https://example.com/1984.jpg');

-- Insert dummy book loans
INSERT INTO book_loans (book_id, user_id, borrowed_date, due_date, status) VALUES
(1, 1, NOW(), DATE_ADD(NOW(), INTERVAL 14 DAY), 'BORROWED'),
(2, 2, NOW(), DATE_ADD(NOW(), INTERVAL 7 DAY), 'BORROWED');

-- Insert dummy book reviews
INSERT INTO book_reviews (book_id, user_id, rating, review_text) VALUES
(1, 1, 5, 'An amazing read!'),
(2, 2, 4, 'Very insightful.');

-- Insert dummy book recommendations
INSERT INTO book_recommendations (user_id, book_id, recommendation_score) VALUES
(1, 2, 0.9),
(2, 3, 0.8);

-- Insert dummy reading analytics
INSERT INTO reading_analytics (user_id, books_read, total_pages_read, favorite_genre) VALUES
(1, 10, 2500, 'Fiction'),
(2, 5, 1200, 'Dystopian');
