# Deployment Guide for Digital Ocean

This guide will help you deploy IvyCRM to your Digital Ocean droplet.

## Prerequisites

- A Digital Ocean droplet (Ubuntu recommended)
- SSH access to your droplet
- A domain name (optional but recommended)

## Step 1: Connect to Your Droplet

```bash
ssh root@your-droplet-ip
```

## Step 2: Install Required Software

### Update System
```bash
apt update && apt upgrade -y
```

### Install Node.js
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs
```

### Install PostgreSQL (if using PostgreSQL)
```bash
apt install -y postgresql postgresql-contrib
```

### Install PM2 (Process Manager)
```bash
npm install -g pm2
```

### Install Nginx (for reverse proxy)
```bash
apt install -y nginx
```

## Step 3: Set Up PostgreSQL (if using PostgreSQL)

```bash
sudo -u postgres psql
```

In PostgreSQL prompt:
```sql
CREATE DATABASE ivycrm;
CREATE USER ivycrm_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE ivycrm TO ivycrm_user;
\q
```

## Step 4: Upload Your Code

### Option A: Using Git (Recommended)

On your local machine:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin your-git-repo-url
git push -u origin main
```

On your droplet:
```bash
cd /var/www
git clone your-git-repo-url ivycrm
cd ivycrm
```

### Option B: Using SCP

On your local machine:
```bash
scp -r /path/to/ivycrmplease root@your-droplet-ip:/var/www/ivycrm
```

Then SSH into your droplet and navigate to the directory.

## Step 5: Install Dependencies

```bash
cd /var/www/ivycrm
npm run install-all
```

## Step 6: Configure Environment Variables

### Backend Configuration

```bash
cd server
nano .env
```

Add the following (adjust values as needed):
```env
PORT=5000
NODE_ENV=production
JWT_SECRET=your-super-secret-random-string-here-change-this

# PostgreSQL Configuration
DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ivycrm
DB_USER=ivycrm_user
DB_PASSWORD=your_secure_password
```

**IMPORTANT**: Generate a secure random string for JWT_SECRET. You can use:
```bash
openssl rand -base64 32
```

### Frontend Configuration (Optional)

If your API is on a different domain:
```bash
cd ../client
nano .env
```

Add:
```env
REACT_APP_API_URL=http://your-domain.com/api
```

### 6.5: Configure OpenAI API (for Ivy Intelligence)

Add your OpenAI API key to the server `.env` file:

```bash
cd /var/www/ivycrm/server
nano .env
```

Add:
```env
OPENAI_API_KEY=sk-your-openai-api-key-here
OPENAI_MODEL=gpt-4o-mini
```

**Note:** You can get an API key from https://platform.openai.com/api-keys

The `OPENAI_MODEL` is optional - defaults to `gpt-4o-mini` (cheaper) but you can use `gpt-4` or `gpt-3.5-turbo` if preferred.

## Step 7: Build the Frontend

```bash
cd /var/www/ivycrm
npm run build
```

## Step 8: Create Admin User

```bash
cd server
node create-admin.js
```

Follow the prompts to create your admin account.

## Step 9: Start the Application with PM2

```bash
cd /var/www/ivycrm/server
pm2 start index.js --name ivycrm
pm2 save
pm2 startup
```

Follow the instructions from `pm2 startup` to enable PM2 on system boot.

## Step 10: Configure Nginx (Reverse Proxy)

```bash
nano /etc/nginx/sites-available/ivycrm
```

Add the following configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable the site:
```bash
ln -s /etc/nginx/sites-available/ivycrm /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

## Step 11: Set Up SSL with Let's Encrypt (Recommended)

```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d your-domain.com -d www.your-domain.com
```

Follow the prompts. Certbot will automatically configure Nginx for HTTPS.

## Step 12: Configure Firewall

```bash
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
```

## Step 13: Set Up Automatic Backups (Optional but Recommended)

Consider setting up regular database backups:

```bash
crontab -e
```

Add:
```cron
0 2 * * * pg_dump -U ivycrm_user ivycrm > /var/backups/ivycrm_$(date +\%Y\%m\%d).sql
```

## Monitoring

### Check PM2 Status
```bash
pm2 status
pm2 logs ivycrm
```

### Check Nginx Status
```bash
systemctl status nginx
```

### Check Database Connection
```bash
sudo -u postgres psql -d ivycrm
```

## Troubleshooting

### Application not starting
- Check PM2 logs: `pm2 logs ivycrm`
- Check server logs in the application
- Verify environment variables are set correctly

### Database connection issues
- Verify PostgreSQL is running: `systemctl status postgresql`
- Check database credentials in `.env`
- Verify database exists: `sudo -u postgres psql -l`

### Nginx issues
- Check Nginx error logs: `tail -f /var/log/nginx/error.log`
- Test configuration: `nginx -t`
- Reload Nginx: `systemctl reload nginx`

## Updating the Application

1. Pull latest changes (if using Git):
```bash
cd /var/www/ivycrm
git pull
```

2. Install any new dependencies:
```bash
npm run install-all
```

3. Rebuild frontend:
```bash
npm run build
```

4. Restart the application:
```bash
pm2 restart ivycrm
```

## Security Checklist

- [ ] Changed JWT_SECRET to a secure random string
- [ ] Using strong database passwords
- [ ] HTTPS/SSL enabled
- [ ] Firewall configured
- [ ] Regular backups set up
- [ ] PM2 process manager running
- [ ] Environment variables secured (not in git)
- [ ] Database user has limited privileges

## Support

If you encounter issues:
1. Check PM2 logs: `pm2 logs ivycrm`
2. Check Nginx logs: `tail -f /var/log/nginx/error.log`
3. Verify all services are running
4. Check environment variables

