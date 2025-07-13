# Lawyer Booking System API

A comprehensive backend API for a lawyer booking and legal services platform.

## Features

- User roles: Client, Advocate, Intern, Admin
- Authentication and Authorization
- Advocate verification system
- Appointment booking and management
- Internship postings and applications
- Real-time messaging
- File uploads (documents, resumes, avatars)
- Advanced search and filtering
- Admin dashboard with analytics

## Tech Stack

- Node.js
- Express.js
- MongoDB & Mongoose
- JWT Authentication
- Express Validator
- Multer for file uploads
- Swagger for API documentation

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a .env file in the root directory with the following variables:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/lawyer_booking
   JWT_SECRET=your-secret-key
   JWT_EXPIRE=30d
   NODE_ENV=development
   ```
4. Start the server:
   ```bash
   # Development
   npm run dev

   # Production
   npm start
   ```

## API Documentation

API documentation is available at `/api/v1/docs` when the server is running.

## API Endpoints

### Auth Routes
- POST /api/v1/auth/register
- POST /api/v1/auth/login
- POST /api/v1/auth/logout
- GET /api/v1/auth/me
- PUT /api/v1/auth/profile

### User Routes
- GET /api/v1/users/profile
- PUT /api/v1/users/profile
- POST /api/v1/users/upload-avatar

### Advocate Routes
- GET /api/v1/advocates
- GET /api/v1/advocates/:id
- GET /api/v1/advocates/dashboard-stats
- GET /api/v1/advocates/case-requests
- PUT /api/v1/advocates/case-requests/:id/accept
- PUT /api/v1/advocates/case-requests/:id/reject
- GET /api/v1/advocates/appointments
- GET /api/v1/advocates/verification-status

### Client Routes
- GET /api/v1/clients/dashboard-stats
- POST /api/v1/clients/case-requests
- GET /api/v1/clients/cases
- POST /api/v1/clients/book-appointment
- GET /api/v1/clients/appointments

### Internship Routes
- POST /api/v1/internships
- GET /api/v1/internships
- GET /api/v1/internships/:id
- POST /api/v1/internships/:id/apply
- GET /api/v1/internships/my-posts
- GET /api/v1/internships/my-applications
- PUT /api/v1/internships/:id
- DELETE /api/v1/internships/:id

### Message Routes
- GET /api/v1/messages/conversations
- GET /api/v1/messages/conversations/:id
- POST /api/v1/messages/conversations
- POST /api/v1/messages/conversations/:id/messages

### Admin Routes
- GET /api/v1/admin/dashboard-stats
- GET /api/v1/admin/advocates/pending-verification
- PUT /api/v1/admin/advocates/:id/verify
- PUT /api/v1/admin/advocates/:id/reject
- GET /api/v1/admin/users
- GET /api/v1/admin/internships
- PUT /api/v1/admin/internships/:id/approve
- PUT /api/v1/admin/internships/:id/reject
- GET /api/v1/admin/analytics

## Error Handling

The API uses a centralized error handling mechanism. All errors are formatted as:

```json
{
  "success": false,
  "error": "Error message"
}
```

## Security Features

- JWT authentication
- Password hashing
- Rate limiting
- XSS protection
- Security headers (Helmet)
- MongoDB query sanitization
- File upload restrictions

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

ISC
