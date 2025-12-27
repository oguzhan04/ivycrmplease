# IvyCRM - College Counselling CRM & TMS

A full-stack web application for managing college counselling business operations, including student management (CRM) and task management (TMS).

## Features

- **Single Sign-In Panel**: Secure authentication for admin and counsellors
- **Role-Based Access Control**: Admin can access all profiles, assign students, and configure settings
- **CRM Module**: Manage students, track status, assign multiple counsellors to students
- **TMS Module**: Task management system with priorities, due dates, and student associations
- **Meeting Schedule**: Date-based meeting notes and tracking (replaces spreadsheet format)
- **Ivy Intelligence**: AI-powered assistant to help find information and navigate the system
- **Notifications**: Real-time notification system
- **User Management**: Admin can create and manage user accounts

## Tech Stack

- **Backend**: Node.js + Express
- **Frontend**: React
- **Database**: PostgreSQL (or SQLite for development)
- **Authentication**: JWT (JSON Web Tokens)

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- PostgreSQL (for production) or SQLite (for development)

## Installation

### 1. Install Dependencies

```bash
npm run install-all
```

This will install dependencies for the root, server, and client directories.

### 2. Backend Setup

Navigate to the `server` directory:

```bash
cd server
```

Create a `.env` file (copy from `.env.example` if it exists, or create one):

```env
PORT=5000
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# OpenAI API (Optional - for Ivy Intelligence)
OPENAI_API_KEY=your-openai-api-key-here
OPENAI_MODEL=gpt-4o-mini

# For PostgreSQL
DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ivycrm
DB_USER=postgres
DB_PASSWORD=your_password_here

# OR for SQLite (simpler for development)
# DB_TYPE=sqlite
```

**Important**: Change the `JWT_SECRET` to a secure random string in production!

### 3. Database Setup

#### Option A: PostgreSQL (Recommended for Production)

1. Create a PostgreSQL database:
```sql
CREATE DATABASE ivycrm;
```

2. Update the `.env` file with your PostgreSQL credentials.

#### Option B: SQLite (Simpler for Development)

1. Set `DB_TYPE=sqlite` in your `.env` file.
2. The database file will be created automatically at `server/database.sqlite`.

### 4. Frontend Setup

The frontend is already configured. The API URL defaults to `http://localhost:5000/api`.

To change it, create a `.env` file in the `client` directory:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

## Running the Application

### Development Mode

From the root directory, run:

```bash
npm run dev
```

This will start both the backend server (port 5000) and frontend (port 3000).

Or run them separately:

```bash
# Terminal 1 - Backend
npm run server

# Terminal 2 - Frontend
npm run client
```

### Production Build

1. Build the React app:
```bash
npm run build
```

2. Start the server:
```bash
npm start
```

The server will serve the built React app from the `client/build` directory.

## Initial Setup

1. Start the application
2. Register your first admin account by making a POST request to `/api/auth/register` with:
   ```json
   {
     "email": "admin@example.com",
     "password": "yourpassword",
     "firstName": "Admin",
     "lastName": "User",
     "role": "admin"
   }
   ```

   Or use a tool like Postman, or create a simple script to do this.

3. Log in with your admin credentials at `http://localhost:3000/login`

## Deployment to Digital Ocean

### 1. Prepare Your Droplet

SSH into your Digital Ocean droplet and install:
- Node.js (v14+)
- PostgreSQL (if using PostgreSQL)
- PM2 (for process management): `npm install -g pm2`

### 2. Upload Your Code

Use `git` or `scp` to upload your code to the droplet.

### 3. Install Dependencies

```bash
npm run install-all
```

### 4. Set Up Environment Variables

Create `.env` files on the server with production values.

### 5. Build the Frontend

```bash
npm run build
```

### 6. Set Up Database

Create your PostgreSQL database and run migrations (the app will auto-sync on first start).

### 7. Start with PM2

```bash
cd server
pm2 start index.js --name ivycrm
pm2 save
pm2 startup
```

### 8. Set Up Nginx (Optional but Recommended)

Configure Nginx as a reverse proxy to forward requests to your Node.js server.

### 9. Set Up SSL/HTTPS (Recommended)

Use Let's Encrypt with Certbot to set up HTTPS for your domain.

## Project Structure

```
ivycrmplease/
├── server/              # Backend API
│   ├── config/         # Database configuration
│   ├── models/         # Database models
│   ├── routes/         # API routes
│   ├── middleware/     # Auth middleware
│   └── index.js        # Server entry point
├── client/             # React frontend
│   ├── src/
│   │   ├── components/ # React components
│   │   ├── context/    # React context (Auth)
│   │   ├── services/   # API service
│   │   └── App.js      # Main app component
│   └── public/
└── package.json        # Root package.json
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Users (Admin only)
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Students
- `GET /api/students` - Get all students
- `GET /api/students/:id` - Get student by ID
- `POST /api/students` - Create student
- `PUT /api/students/:id` - Update student
- `DELETE /api/students/:id` - Delete student
- `POST /api/students/:id/assign-counsellors` - Assign counsellors (Admin only)

### Tasks
- `GET /api/tasks` - Get all tasks
- `GET /api/tasks/:id` - Get task by ID
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Notifications
- `GET /api/notifications` - Get all notifications
- `GET /api/notifications/unread-count` - Get unread count
- `PUT /api/notifications/:id/read` - Mark as read
- `PUT /api/notifications/read-all` - Mark all as read
- `DELETE /api/notifications/:id` - Delete notification

## Security Notes

- **Change JWT_SECRET** in production
- Use strong passwords
- Enable HTTPS in production
- Keep dependencies updated
- Use environment variables for sensitive data

## Support

For issues or questions, please refer to the codebase or contact the development team.

