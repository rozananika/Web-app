-- Insert roles
INSERT INTO roles (name) VALUES ('ROLE_ADMIN');
INSERT INTO roles (name) VALUES ('ROLE_LIBRARIAN');
INSERT INTO roles (name) VALUES ('ROLE_MEMBER');

-- Create admin user (password: admin123)
INSERT INTO users (username, email, password, first_name, last_name, enabled)
VALUES ('admin', 'admin@library.com', '$2a$10$ZuGgeoawgOg.6AM3QEGZ3O4QlBSWyRx3A70oIP0GG/YV4fR4xwq.2', 'Admin', 'User', true);

-- Assign admin role to admin user
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id 
FROM users u, roles r 
WHERE u.username = 'admin' AND r.name = 'ROLE_ADMIN';
