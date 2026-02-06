# AWS Deployment Manual - LearnToAction MVP

**Server IP:** `13.233.97.38`
**OS:** Ubuntu 22.04 LTS
**Database:** PostgreSQL (Local on EC2)
**Process Manager:** PM2

---

## 1. Initial Server Setup

### System Dependencies
```bash
# Update and install core tools
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git unzip nginx make build-essential
```

### Install Node.js (v20 LTS)
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

### Install PostgreSQL
```bash
sudo apt install -y postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

---

## 2. Database Migration (The "Hard" Part)

We encountered several issues here. Follow this EXACT process to avoid permission and encoding errors.

### A. Prepare the Backup (Locally)
1.  **Encoding Matters:** Ensure your local dump is UTF-8.
    ```bash
    # PowerShell example
    $env:PGPASSWORD="your_local_password"
    pg_dump -U postgres -h localhost -d learntoaction --encoding=UTF8 -f backup_fixed.sql
    ```
2.  **Upload to Server:**
    ```bash
    scp -i "your-key.pem" backup_fixed.sql ubuntu@13.233.97.38:/home/ubuntu/
    ```

### B. Restore on Server (The Clean Way)
Do NOT restore as `root`. Run these commands to wipe and restore cleanly:

```bash
# 1. Stop API to release connections
pm2 stop api

# 2. Drop and Recreate DB (as postgres user)
sudo -u postgres psql -c "DROP DATABASE IF EXISTS learntoaction;"
sudo -u postgres psql -c "CREATE DATABASE learntoaction;"

# 3. Create the 'admin' user if not exists
sudo -u postgres psql -c "CREATE USER admin WITH ENCRYPTED PASSWORD 'learntoaction@mvp123';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE learntoaction TO admin;"

# 4. Restore the Data
# IMPORTANT: This restores tables as 'postgres' owner usually.
sudo -u postgres psql -d learntoaction -f /home/ubuntu/backup_fixed.sql

# 5. FIX PERMISSIONS (Critical Step!)
# Since we restored as postgres, the 'admin' user (API) needs permissions granted explicitly.
sudo -u postgres psql -d learntoaction -c "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO admin;"
sudo -u postgres psql -d learntoaction -c "GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO admin;"
```

---

## 3. Backend (API) Deployment

### Setup & Build
```bash
cd /home/ubuntu/learntoaction/api
git pull
npm install
npm run build
```

### Environment Variables (.env)
Create the file `/home/ubuntu/learntoaction/api/.env`:
```ini
PORT=3000
DATABASE_URL="postgresql://admin:learntoaction%40mvp123@localhost:5432/learntoaction"
```

### Troubleshooting: "Missing Module pg" / "502 Bad Gateway"
If the API crashes immediately:
1.  **Check Logs:** `pm2 logs api --lines 50 --nostream`
2.  **Missing `pg`:** If it says `Cannot find module 'pg'`, run:
    ```bash
    npm install pg
    ```
3.  **Env Not Loading:** Use `dotenv` explicitly in `main.ts` (We patched this in code).

### Start with PM2
```bash
pm2 start dist/main.js --name "api"
pm2 save
```

---

## 4. Frontend (Web) Deployment

### Setup & Build
```bash
cd /home/ubuntu/learntoaction/web
git pull
npm install
```

### Fix for HTTP (Non-SSL)
Modern browsers block `crypto.randomUUID()` on HTTP. We patched `Builder.tsx` to include a polyfill.
**Always ensure you have the latest code before building.**

### Build & Deploy
```bash
# Build the React app
npm run build

# Move to Nginx folder
sudo rm -rf /var/www/html/*
sudo cp -r dist/* /var/www/html/
```

---

## 5. Nginx Configuration

File: `/etc/nginx/sites-available/default`

```nginx
server {
    listen 80;
    server_name _;

    # Frontend
    location / {
        root /var/www/html;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # Backend API Proxy
    location /api/ {
        proxy_pass http://localhost:3000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```
**Reload Nginx:** `sudo systemctl reload nginx`

---

## 🔄 Deployment Checklist (Future Updates)

1.  **Code Update:**
    ```bash
    cd ~/learntoaction
    git pull
    ```

2.  **Backend Update:**
    ```bash
    cd api
    npm install  # In case deps changed
    npm run build
    pm2 restart api
    ```

3.  **Frontend Update:**
    ```bash
    cd ../web
    npm install
    npm run build
    sudo cp -r dist/* /var/www/html/
    ```

---

## 🚨 Known Issues & Fixes Archive

| Issue | Symptom | Solution |
| :--- | :--- | :--- |
| **P1012 Error** | Prisma `url` format invalid | Don't put logic in `schema.prisma`. Use `env("...")` and handle loading in code. |
| **502 Bad Gateway** | API crashing instantly | Check `pm2 logs`. Usually missing `pg` module or DB connection error. |
| **Permission Denied** | API logs `42501` error | Run the `GRANT ALL PRIVILEGES` SQL commands for the `admin` user. |
| **UUID Error** | `crypto.randomUUID is not a function` | Browser is blocking crypto on HTTP. Use polyfill in frontend code. |
| **Missing Env** | `DATABASE_URL` is undefined | NestJS doesn't load `.env` in production by default. Use `dotenv.config()` in `main.ts`. |
