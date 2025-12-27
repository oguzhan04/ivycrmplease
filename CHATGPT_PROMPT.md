# Summary & ChatGPT Prompt for Deployment

## What We Built

IvyCRM - A full-stack college counselling CRM system with:

**Tech Stack:**
- Backend: Node.js + Express (runs on port 5001 locally, should use 5000 or 5002 on server)
- Frontend: React (runs on port 3000)
- Database: SQLite (dev) or PostgreSQL (production)
- AI: OpenAI GPT-4o-mini integration for "Ivy Intelligence" assistant

**Features:**
- Single sign-in with Admin/Counsellor roles
- CRM module: Lead tracking (parent names, status, pricing, service types, schools)
- TMS module: Task management
- Meeting Schedule: Date-based meeting notes (replaces spreadsheet format)
- Ivy Intelligence: AI assistant to help find info and navigate
- User management, notifications

**Current Status:**
- ✅ Fully built and working locally
- ✅ Committed to git
- ✅ Ready for deployment
- ✅ OpenAI API key configured (stored in server/.env, not in repo)
- ✅ Admin account created (admin@ivycrm.com / admin123)

**Files Structure:**
- `/server` - Backend API
- `/client` - React frontend
- Root has deployment guides

---

## ChatGPT Prompt (Copy This):

```
I have a Node.js + React application called IvyCRM that I need to deploy to my Digital Ocean droplet. I want to replace my existing project completely.

**Current Situation:**
- I have a Digital Ocean Ubuntu droplet with an existing Node.js project running
- I want to completely replace it with this new IvyCRM project
- The new app is a CRM system with backend (Express) and frontend (React)
- Backend should run on port 5000 (or 5002 if 5000 is taken)
- Frontend is built and served by the backend in production
- Uses PostgreSQL database (or SQLite)
- Has OpenAI API integration

**What I Need:**
1. Step-by-step guide to:
   - Stop/remove the old project
   - Upload the new IvyCRM code
   - Set up PostgreSQL database
   - Configure environment variables (.env file)
   - Build the React frontend
   - Set up PM2 to run the server
   - Configure Nginx as reverse proxy
   - Set up SSL with Let's Encrypt
   - Create admin user

2. Help with:
   - Checking what's currently running on the server
   - Safely stopping the old project
   - Database setup
   - Nginx configuration
   - Any troubleshooting

**Project Details:**
- Backend entry: server/index.js
- Frontend build: npm run build (creates client/build)
- Environment file: server/.env (needs PORT, JWT_SECRET, DB config, OPENAI_API_KEY)
- Admin creation script: server/create-admin-direct.js
- PM2 name: "ivycrm"

**My Server:**
- Ubuntu droplet on Digital Ocean
- Has Node.js, PM2, Nginx already installed
- Has a domain name configured
- Currently running an old project I want to replace

Please guide me through the complete deployment process step by step.
```

---

## Quick Reference

**Key Commands You'll Need:**
```bash
# Check what's running
pm2 list
netstat -tulpn | grep LISTEN

# Stop old project
pm2 stop <old-app-name>
pm2 delete <old-app-name>

# Upload code (choose one)
git clone <repo-url> /var/www/ivycrm
# OR
scp -r /path/to/ivycrmplease root@your-ip:/var/www/ivycrm

# Install & build
cd /var/www/ivycrm
npm run install-all
npm run build

# Configure
cd server
nano .env  # Set PORT, JWT_SECRET, DB config, OPENAI_API_KEY

# Create admin
node create-admin-direct.js admin@yourdomain.com password Admin User

# Start
pm2 start index.js --name ivycrm
pm2 save
```

**Environment Variables Needed:**
```
PORT=5000
NODE_ENV=production
JWT_SECRET=<generate with: openssl rand -base64 32>
OPENAI_API_KEY=your-openai-api-key-here
OPENAI_MODEL=gpt-4o-mini
DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ivycrm
DB_USER=ivycrm_user
DB_PASSWORD=<your-secure-password>
```
