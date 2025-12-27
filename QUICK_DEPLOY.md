# Quick Deploy Checklist

## Before You Start
- [ ] You have SSH access to your Digital Ocean droplet
- [ ] You know what port your existing app uses (check with `pm2 list` or `netstat`)
- [ ] You have a domain name (optional but recommended)

## Quick Steps

1. **SSH into server:**
   ```bash
   ssh root@your-droplet-ip
   ```

2. **Create directory:**
   ```bash
   mkdir -p /var/www/ivycrm
   ```

3. **Upload code** (choose one):
   - **Git:** `cd /var/www/ivycrm && git clone your-repo .`
   - **SCP from local:** `scp -r /Users/okaraca/Desktop/ivycrmplease root@your-ip:/var/www/ivycrm`

4. **Install:**
   ```bash
   cd /var/www/ivycrm
   npm run install-all
   ```

5. **Set up database** (PostgreSQL recommended):
   ```bash
   sudo -u postgres psql
   CREATE DATABASE ivycrm;
   CREATE USER ivycrm_user WITH PASSWORD 'secure_password';
   GRANT ALL PRIVILEGES ON DATABASE ivycrm TO ivycrm_user;
   \q
   ```

6. **Configure .env:**
   ```bash
   cd /var/www/ivycrm/server
   nano .env
   ```
   Set PORT=5002 (or any free port), add your OpenAI key, database credentials

7. **Build frontend:**
   ```bash
   cd /var/www/ivycrm
   npm run build
   ```

8. **Create admin:**
   ```bash
   cd server
   node create-admin-direct.js admin@yourdomain.com yourpassword Admin User
   ```

9. **Start with PM2:**
   ```bash
   cd /var/www/ivycrm/server
   pm2 start index.js --name ivycrm
   pm2 save
   ```

10. **Configure Nginx** (add to existing config):
    ```bash
    nano /etc/nginx/sites-available/default
    ```
    Add subdomain or path routing (see DEPLOYMENT_EXISTING_SERVER.md)

11. **Reload Nginx:**
    ```bash
    nginx -t && systemctl reload nginx
    ```

12. **Set up SSL** (if using subdomain):
    ```bash
    certbot --nginx -d crm.yourdomain.com
    ```

## Done! 

Access at:
- Subdomain: `https://crm.yourdomain.com`
- Or path: `https://yourdomain.com/crm`
- Or direct: `http://your-ip:5002` (not recommended)

Your existing app continues running on its original port/domain!

