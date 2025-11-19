# Plannr Backend API

Backend API for Plannr task management application built with Node.js, TypeScript, Express, and MongoDB.

## Features

- **Authentication**: JWT-based authentication with bcrypt password hashing
- **User Management**: User profiles, preferences, and statistics
- **Todo Management**: Create, read, update, delete todos with filtering
- **Project Management**: Organize todos into projects
- **Tag System**: Categorize todos with tags
- **Security**: Helmet, CORS, input validation
- **TypeScript**: Full type safety

## Tech Stack

- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (jsonwebtoken)
- **Security**: Helmet, bcryptjs, CORS
- **Validation**: express-validator

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (v6 or higher)

### Installation

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Update `.env` with your configuration:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/plannr
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:8080
```

5. Start MongoDB (if running locally):
```bash
mongod
```

6. Run development server:
```bash
npm run dev
```

The server will start on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires auth)

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `PUT /api/users/preferences` - Update user preferences
- `GET /api/users/stats` - Get user statistics

### Todos
- `GET /api/todos` - Get all todos (with filters)
- `POST /api/todos` - Create new todo
- `GET /api/todos/:id` - Get single todo
- `PUT /api/todos/:id` - Update todo
- `DELETE /api/todos/:id` - Delete todo
- `PATCH /api/todos/:id/toggle` - Toggle todo completion

### Projects
- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create new project
- `GET /api/projects/:id` - Get single project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Tags
- `GET /api/tags` - Get all tags
- `POST /api/tags` - Create new tag
- `GET /api/tags/:id` - Get single tag
- `PUT /api/tags/:id` - Update tag
- `DELETE /api/tags/:id` - Delete tag

## Project Structure

```
backend/
├── src/
│   ├── controllers/      # Request handlers
│   ├── models/           # Mongoose schemas
│   ├── routes/           # API routes
│   ├── middleware/       # Custom middleware
│   └── server.ts         # App entry point
├── dist/                 # Compiled JavaScript
├── .env.example          # Environment variables template
├── package.json
└── tsconfig.json
```

## Scripts

- `npm run dev` - Start development server with nodemon
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server

## Authentication

All protected routes require a JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

## Response Format

Success response:
```json
{
  "success": true,
  "data": { ... }
}
```

Error response:
```json
{
  "success": false,
  "message": "Error message"
}
```

## License

MIT
