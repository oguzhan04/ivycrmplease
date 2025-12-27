# Deploying IvyCRM to Existing Digital Ocean Server

This guide shows you how to deploy IvyCRM alongside your existing project on the same Digital Ocean droplet.

## Option 1: Run on Different Port (Recommended)

This is the easiest approach - run IvyCRM on a different port (e.g., 5002) and use Nginx to route traffic.

### Step 1: Upload Your Code

SSH into your droplet:
```bash
ssh root@your-droplet-ip
```

Create a directory for IvyCRM:
```bash
cd /var/www
mkdir ivycrm
```

Upload your code (using Git or SCP):
```bash
# Option A: Using Git
cd /var/www/ivycrm
git clone your-repo-url .

# Option B: Using SCP (from your local machine)
# scp -r /Users/okaraca/Desktop/ivycrmplease root@your-droplet-ip:/var/www/ivycrm
```

### Step 2: Install Dependencies

```bash
cd /var/www/ivycrm
npm run install-all
```

### Step 3: Set Up Database

**If using PostgreSQL:**
```bash
sudo -u postgres psql
```

```sql
CREATE DATABASE ivycrm;
CREATE USER ivycrm_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE ivycrm TO ivycrm_user;
\q
```

**If using SQLite (simpler, but less scalable):**
- No setup needed, it will create the file automatically

### Step 4: Configure Environment Variables

```bash
cd /var/www/ivycrm/server
nano .env
```

Add this configuration:
```env
PORT=5002
NODE_ENV=production
JWT_SECRET=your-super-secret-random-string-here

# OpenAI API
OPENAI_API_KEY=your-openai-api-key-here
OPENAI_MODEL=gpt-4o-mini

# Database (choose one)
# PostgreSQL:
DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ivycrm
DB_USER=ivycrm_user
DB_PASSWORD=your_secure_password

# OR SQLite:
# DB_TYPE=sqlite
```

**Generate a secure JWT_SECRET:**
```bash
openssl rand -base64 32
```

### Step 5: Build Frontend

```bash
cd /var/www/ivycrm
npm run build
```

### Step 6: Create Admin User

```bash
cd /var/www/ivycrm/server
node create-admin-direct.js your-email@example.com your-password Your FirstName YourLastName
```

### Step 7: Configure Nginx

Edit your Nginx configuration:
```bash
nano /etc/nginx/sites-available/default
```

**If you want to use a subdomain (e.g., crm.yourdomain.com):**
```nginx
server {
    listen 80;
    server_name crm.yourdomain.com;

    location / {
        proxy_pass http://localhost:5002;
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

**OR if you want to use a path (e.g., yourdomain.com/crm):**
```nginx
# Add this to your existing server block
location /crm {
    proxy_pass http://localhost:5002;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    
    # Rewrite paths to remove /crm prefix
    rewrite ^/crm/?(.*) /$1 break;
}
```

**Note:** If using the path approach, you'll also need to update the frontend to handle the base path. This is more complex, so subdomain is recommended.

Test and reload Nginx:
```bash
nginx -t
systemctl reload nginx
```

### Step 8: Start with PM2

```bash
cd /var/www/ivycrm/server
pm2 start index.js --name ivycrm
pm2 save
```

### Step 9: Set Up SSL (if using subdomain)

```bash
certbot --nginx -d crm.yourdomain.com
```

## Option 2: Use Different Domain/Subdomain

If you have a domain, the cleanest approach is:

1. **Point a subdomain to your droplet** (e.g., `crm.yourdomain.com`)
2. **Configure Nginx** to route that subdomain to port 5002
3. **Set up SSL** with Let's Encrypt

This way:
- Your existing app stays on `yourdomain.com`
- IvyCRM runs on `crm.yourdomain.com`
- Both apps run independently

## Option 3: Use Different Port Directly

If you don't want to use Nginx, you can access IvyCRM directly via:
- `http://your-droplet-ip:5002`

But this is not recommended for production (no SSL, exposed port).

## Important Notes

1. **Don't delete your existing app** - both can run simultaneously
2. **Use different ports** - your existing app probably uses 5000 or 3000, use 5002 for IvyCRM
3. **PM2 manages both** - you can see all apps with `pm2 list`
4. **Separate databases** - IvyCRM uses its own database, won't interfere
5. **Resource usage** - monitor with `pm2 monit` to ensure server has enough resources

## Checking Everything Works

```bash
# Check PM2 status
pm2 list

# Check IvyCRM logs
pm2 logs ivycrm

# Check if port is listening
netstat -tulpn | grep 5002

# Test the API
curl http://localhost:5002/api/health
```

## Troubleshooting

**Port already in use?**
- Check what's using it: `lsof -i:5002`
- Use a different port in `.env`

**Nginx not routing correctly?**
- Check Nginx error logs: `tail -f /var/log/nginx/error.log`
- Test config: `nginx -t`
- Make sure you reloaded: `systemctl reload nginx`

**Can't access from browser?**
- Check firewall: `ufw status`
- Allow HTTP/HTTPS: `ufw allow 80/tcp && ufw allow 443/tcp`
- Check PM2 is running: `pm2 list`

## Updating IvyCRM

When you need to update:
```bash
cd /var/www/ivycrm
git pull  # or upload new files
npm run install-all
npm run build
pm2 restart ivycrm
```

Your existing app will continue running unaffected!

