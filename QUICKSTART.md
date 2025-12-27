# Quick Start Guide

## For Local Development

### 1. Install Everything
```bash
npm run install-all
```

### 2. Set Up Backend

Go to the `server` directory and create a `.env` file:

```bash
cd server
nano .env
```

Paste this (using SQLite for simplicity):
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=change-this-to-something-random

DB_TYPE=sqlite
```

### 3. Create Your Admin Account

```bash
node create-admin.js
```

Follow the prompts to create your admin account.

### 4. Start the Application

From the root directory:
```bash
npm run dev
```

This starts:
- Backend server on http://localhost:5000
- Frontend on http://localhost:3000

### 5. Log In

Open http://localhost:3000 in your browser and log in with the admin credentials you just created.

## What You Can Do Now

1. **Create Users**: As admin, go to "Users" in the sidebar to add counsellors
2. **Add Students**: Go to "CRM" to add students and assign counsellors to them
3. **Create Tasks**: Go to "TMS" to create tasks and assign them to counsellors or link them to students
4. **View Notifications**: Check the notifications panel

## Key Features

- **Admin Role**: Can access all profiles, assign students to counsellors, create users, and manage everything
- **Counsellor Role**: Can view and manage only their assigned students and tasks
- **Multiple Counsellors per Student**: Admin can assign multiple counsellors to one student
- **Task Management**: Create tasks with priorities, due dates, and link them to students

## Next Steps

- Configure CRM and TMS modules as needed (you mentioned you'll do this later)
- Deploy to Digital Ocean using the DEPLOYMENT.md guide
- Set up your domain and SSL certificate

## Need Help?

- Check README.md for detailed documentation
- Check DEPLOYMENT.md for deployment instructions
- All API endpoints are documented in README.md

