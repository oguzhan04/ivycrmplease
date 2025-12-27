# 🚀 Quick Start Guide

## Your app is starting! Here's what to do:

### 1. Wait for the app to start
The server should be starting on `http://localhost:5000` and the frontend on `http://localhost:3000`

### 2. Create your admin account

Open a new terminal and run:
```bash
cd server
node create-admin.js
```

Follow the prompts to create your admin account.

### 3. Open the app
Go to: **http://localhost:3000**

Log in with the admin credentials you just created.

### 4. Set up OpenAI (Optional - for Ivy Intelligence)

If you want to use the AI assistant:

1. Get an API key from: https://platform.openai.com/api-keys
2. Add it to `server/.env`:
   ```
   OPENAI_API_KEY=sk-your-key-here
   ```
3. Restart the server (Ctrl+C and run `npm run dev` again)

### 5. Start using it!

- **CRM**: Add your leads/students with all the fields from your tracking sheet
- **Meeting Schedule**: Add meeting notes (replaces your spreadsheet)
- **TMS**: Create tasks
- **Ivy Intelligence**: Click the 🧠 button in the bottom right to ask questions

## Making Changes

### Frontend (React)
- Edit files in `client/src/components/`
- Changes auto-reload in the browser

### Backend (Node.js)
- Edit files in `server/`
- Server auto-restarts with nodemon

### Database
- Using SQLite for development (file: `server/database.sqlite`)
- Switch to PostgreSQL for production (see DEPLOYMENT.md)

## Next Steps

1. Test the app locally
2. Make cosmetic/functional changes
3. When ready, deploy to Digital Ocean (see DEPLOYMENT.md)

## Troubleshooting

**Port already in use?**
- Kill the process: `lsof -ti:5000 | xargs kill` (or change PORT in .env)
- For frontend: `lsof -ti:3000 | xargs kill`

**Database errors?**
- Delete `server/database.sqlite` and restart (it will recreate)

**AI not working?**
- Make sure OPENAI_API_KEY is set in `server/.env`
- Check server logs for errors

## Need Help?

Check:
- `README.md` - Full documentation
- `DEPLOYMENT.md` - Deployment guide
- `QUICKSTART.md` - Quick reference

