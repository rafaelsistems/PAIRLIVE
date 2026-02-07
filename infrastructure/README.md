# PAIRLIVE Infrastructure

Panduan deployment infrastruktur berbasis VPS untuk platform PAIRLIVE.

## Arsitektur

```
┌─────────────────────────────────────────────────────────────┐
│                       Server VPS                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   Nginx     │  │   Node.js   │  │  PostgreSQL │        │
│  │   Reverse   │──│   Backend   │──│   Database  │        │
│  │   Proxy     │  │   (PM2)     │  │             │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
│         │                │                                  │
│         │         ┌─────────────┐                          │
│         │         │    Redis    │                          │
│         │         │   Cache     │                          │
│         │         └─────────────┘                          │
│         │                                                   │
│  ┌──────────────────────────────┐                          │
│  │      SSL (Let's Encrypt)     │                          │
│  └──────────────────────────────┘                          │
└─────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    │                   │
              ┌─────┴─────┐       ┌─────┴─────┐
              │  Aplikasi │       │  Agora    │
              │  Mobile   │       │   Cloud   │
              └───────────┘       └───────────┘
```

## Spesifikasi Server

### Minimum (Development/Testing)
- **CPU**: 2 vCPU
- **RAM**: 4 GB
- **Storage**: 40 GB SSD
- **Bandwidth**: 1 TB/bulan

### Rekomendasi (Production)
- **CPU**: 4+ vCPU
- **RAM**: 8+ GB
- **Storage**: 100+ GB SSD
- **Bandwidth**: Unlimited atau tier tinggi

## Penyedia VPS

Penyedia yang direkomendasikan:
- DigitalOcean
- Linode
- Vultr
- AWS Lightsail
- Google Cloud Compute Engine
- IDCloudHost (Indonesia)
- Biznet Gio (Indonesia)

## Setup Server Awal

### 1. Update Sistem
```bash
sudo apt update && sudo apt upgrade -y
```

### 2. Install Node.js (via nvm)
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20
```

### 3. Install PostgreSQL
```bash
sudo apt install postgresql postgresql-contrib -y
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Buat database dan user
sudo -u postgres psql
CREATE USER pairlive WITH PASSWORD 'password_aman_anda';
CREATE DATABASE pairlive OWNER pairlive;
GRANT ALL PRIVILEGES ON DATABASE pairlive TO pairlive;
\q
```

### 4. Install Redis
```bash
sudo apt install redis-server -y
sudo systemctl start redis
sudo systemctl enable redis

# Konfigurasi Redis untuk keamanan
sudo nano /etc/redis/redis.conf
# Set: requirepass password_redis_anda
# Set: bind 127.0.0.1

sudo systemctl restart redis
```

### 5. Install Nginx
```bash
sudo apt install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 6. Install PM2
```bash
npm install -g pm2
```

## Deployment Aplikasi

### 1. Clone Repository
```bash
cd /var/www
git clone https://github.com/repo-anda/pairlive.git
cd pairlive/backend
```

### 2. Install Dependencies
```bash
npm ci --production
```

### 3. Setup Environment
```bash
cp .env.example .env
nano .env
# Konfigurasi semua environment variables
```

### 4. Build Aplikasi
```bash
npm run build
```

### 5. Setup Database
```bash
npm run db:push
# Atau gunakan SQL mentah
psql -U pairlive -d pairlive -f scripts/schema.sql
```

### 6. Jalankan dengan PM2
```bash
pm2 start dist/server.js --name pairlive-api
pm2 save
pm2 startup
```

## Konfigurasi Nginx

Buat `/etc/nginx/sites-available/pairlive`:

```nginx
upstream pairlive_backend {
    server 127.0.0.1:3000;
    keepalive 64;
}

server {
    listen 80;
    server_name api.pairlive.app;
    
    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl http2;
    server_name api.pairlive.app;
    
    # Konfigurasi SSL (dikelola Certbot)
    ssl_certificate /etc/letsencrypt/live/api.pairlive.app/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.pairlive.app/privkey.pem;
    
    # Pengaturan SSL
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
    
    # Header Keamanan
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Lokasi API
    location /api {
        proxy_pass http://pairlive_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Lokasi Socket.IO
    location /socket.io {
        proxy_pass http://pairlive_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
    }
    
    # Health Check
    location /health {
        proxy_pass http://pairlive_backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }
}
```

Aktifkan site:
```bash
sudo ln -s /etc/nginx/sites-available/pairlive /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Sertifikat SSL (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d api.pairlive.app
```

## Konfigurasi Firewall

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

## Monitoring

### Monitoring PM2
```bash
pm2 status
pm2 logs pairlive-api
pm2 monit
```

### Monitoring Sistem
```bash
# Install htop
sudo apt install htop
htop
```

### Manajemen Log
```bash
# Lihat log Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Lihat log PM2
pm2 logs
```

## Strategi Backup

### Backup Database
```bash
# Buat script backup
#!/bin/bash
pg_dump -U pairlive pairlive | gzip > /backups/pairlive_$(date +%Y%m%d_%H%M%S).sql.gz

# Tambahkan ke crontab (setiap hari jam 2 pagi)
0 2 * * * /path/to/backup-script.sh
```

### Backup Redis
Redis RDB snapshot disimpan otomatis. Konfigurasi di `/etc/redis/redis.conf`.

## Pertimbangan Scaling

Untuk traffic tinggi:

1. **Vertical Scaling**: Upgrade spesifikasi VPS
2. **Horizontal Scaling**: 
   - Tambah load balancer (Nginx)
   - Multiple instance Node.js dengan PM2 cluster mode
3. **Database Scaling**:
   - Read replicas
   - Connection pooling (PgBouncer)
4. **Caching**:
   - Redis cluster
   - CDN untuk asset statis

## Checklist Keamanan

- [ ] Autentikasi SSH dengan key saja
- [ ] Firewall dikonfigurasi (UFW)
- [ ] SSL/TLS diaktifkan
- [ ] Password database diamankan
- [ ] Password Redis dikonfigurasi
- [ ] Environment variables diamankan
- [ ] Update keamanan rutin
- [ ] Rate limiting diaktifkan
- [ ] CORS dikonfigurasi dengan benar

## Perintah Maintenance

```bash
# Update aplikasi
cd /var/www/pairlive/backend
git pull
npm ci --production
npm run build
pm2 restart pairlive-api

# Update sistem
sudo apt update && sudo apt upgrade -y

# Cek ruang disk
df -h

# Cek memori
free -h

# Restart services
sudo systemctl restart nginx
sudo systemctl restart postgresql
sudo systemctl restart redis
pm2 restart all
```

## Troubleshooting

### Aplikasi Tidak Berjalan
```bash
# Cek status PM2
pm2 status

# Cek log error
pm2 logs pairlive-api --err

# Restart aplikasi
pm2 restart pairlive-api
```

### Database Tidak Terkoneksi
```bash
# Cek status PostgreSQL
sudo systemctl status postgresql

# Cek koneksi
psql -U pairlive -d pairlive -c "SELECT 1"
```

### Redis Tidak Terkoneksi
```bash
# Cek status Redis
sudo systemctl status redis

# Test koneksi
redis-cli ping
```

### Nginx Error
```bash
# Cek syntax konfigurasi
sudo nginx -t

# Cek log error
sudo tail -f /var/log/nginx/error.log
```
