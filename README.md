# Library Management System

An enterprise-level full-stack application for managing a public library's collection of books, authors, and user interactions.

## Features

### User Management
- Registration & Authentication
- Role-Based Access Control (RBAC): Admin, Librarian, and Member roles
- User profile management

### Book Management
- CRUD operations for books
- Comprehensive book details (title, ISBN, publication date, etc.)
- Author management
- Cover image handling

### Search & Filtering
- Advanced search by title, author, ISBN, or genre
- Filtering by publication date, availability, ratings
- Real-time search suggestions

### Inventory Management
- Stock tracking for multiple copies
- Check-in/check-out system
- Due date management
- Overdue tracking

### Analytics & Reporting
- Interactive analytics dashboard
- Most borrowed books tracking
- Active members statistics
- Inventory status reports
- Export capabilities (PDF/Excel)

### Notifications
- Due date reminders
- Overdue notifications
- New arrivals alerts
- Optional email notifications

## Technical Stack

### Backend
- Java 17
- Spring Boot 3.2.0
- Spring Security with JWT
- Spring Data JPA
- MySQL Database
- Maven
- OpenAPI/Swagger Documentation

### Frontend
- React 18.2.0
- Material-UI 5.14.0
- React Router 6.20.0
- Axios for API calls
- Recharts/Nivo for data visualization
- JWT for authentication
- React Beautiful DnD for drag-n-drop

### Development Tools
- Spring Boot DevTools
- H2 Database (development)
- ESLint & Prettier
- React Testing Library
- Jest

## Setup Instructions
'
### Backend Setup
1. Ensure you have Java 17 and Maven installed
2. Configure application.properties with your database settings:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/library_db
   spring.datasource.username=your_username
   spring.datasource.password=your_password
   ```
3. Run the Spring Boot application:
   ```bash
   mvn spring-boot:run
   ```

### Frontend Setup
1. Navigate to the frontend directory
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm start
   ```

## API Documentation
- REST API: http://localhost:8080/api
- Swagger UI: http://localhost:8080/swagger-ui.html
- H2 Console (dev): http://localhost:8080/h2-console

## Security Features
- JWT-based authentication
- Role-based access control
- Password encryption
- API request validation
- CORS configuration

## Database Schema

### Core Entities
- Users (id, username, password, email, role, etc.)
- Books (id, title, isbn, publishedYear, copies, etc.)
- Authors (id, name, biography, etc.)
- BookLendings (id, bookId, userId, borrowDate, dueDate, etc.)
- Reviews (id, bookId, userId, rating, comment, etc.)

### Relationships
- Books <-> Authors (Many-to-Many)
- Books <-> Users (through BookLendings)
- Books <-> Reviews (One-to-Many)

## Contributing
Please read CONTRIBUTING.md for details on our code of conduct and the process for submitting pull requests.

## License
This project is licensed under the MIT License - see the LICENSE.md file for details
