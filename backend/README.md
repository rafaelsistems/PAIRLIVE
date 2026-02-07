# PAIRLIVE Backend

Server backend berperforma tinggi untuk platform PAIRLIVE.

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Fastify (framework web berperforma tinggi)
- **Database**: PostgreSQL dengan Prisma ORM
- **Cache/Antrian**: Redis dengan ioredis
- **Real-time**: Socket.IO
- **Job Queue**: BullMQ
- **Autentikasi**: JWT (JSON Web Tokens)
- **Video**: Agora.io SDK untuk generate token

## Struktur Proyek

```
backend/
├── prisma/
│   └── schema.prisma       # Skema database
├── scripts/
│   └── schema.sql          # SQL mentah (untuk setup DB langsung)
├── src/
│   ├── config/             # File konfigurasi
│   │   ├── index.ts        # Konfigurasi aplikasi
│   │   ├── database.ts     # Prisma client
│   │   └── redis.ts        # Redis client
│   ├── controllers/        # Handler route
│   ├── middleware/         # Middleware
│   ├── routes/             # Definisi route API
│   ├── services/           # Logika bisnis
│   ├── socket/             # Handler Socket.IO
│   ├── workers/            # Background worker BullMQ
│   ├── utils/              # Fungsi utilitas
│   └── server.ts           # Entry point aplikasi
├── .env.example            # Template environment variables
├── package.json
└── tsconfig.json
```

## Memulai

### Prasyarat

- Node.js 18+
- PostgreSQL 14+
- Redis 6+

### Instalasi

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Setup environment variables**
   ```bash
   cp .env.example .env
   # Edit .env dengan konfigurasi Anda
   ```

3. **Setup database**

   Opsi A: Menggunakan migrasi Prisma
   ```bash
   npm run db:generate
   npm run db:push
   ```

   Opsi B: Menggunakan SQL mentah
   ```bash
   psql -U postgres -d pairlive -f scripts/schema.sql
   ```

4. **Jalankan development server**
   ```bash
   npm run dev
   ```

## Script Tersedia

| Script | Deskripsi |
|--------|-----------|
| `npm run dev` | Jalankan server development dengan hot reload |
| `npm run build` | Build TypeScript ke JavaScript |
| `npm start` | Jalankan server production |
| `npm run lint` | Jalankan ESLint |
| `npm test` | Jalankan test |
| `npm run db:migrate` | Jalankan migrasi database |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push skema ke database |
| `npm run db:studio` | Buka Prisma Studio (GUI database) |

## Endpoint API

### Autentikasi
- `POST /api/v1/auth/register` - Daftar pengguna baru
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/refresh-token` - Refresh access token
- `POST /api/v1/auth/logout` - Logout

### Pengguna
- `GET /api/v1/users/me` - Ambil profil pengguna saat ini
- `PUT /api/v1/users/me` - Update profil
- `GET /api/v1/users/:userId` - Ambil profil publik

### Matching
- `POST /api/v1/matching/join` - Gabung antrian matching
- `DELETE /api/v1/matching/leave` - Keluar antrian
- `GET /api/v1/matching/status` - Status antrian

### Sesi
- `GET /api/v1/sessions/active` - Ambil sesi aktif
- `POST /api/v1/sessions/:id/skip` - Skip sesi
- `POST /api/v1/sessions/:id/end` - Akhiri sesi
- `GET /api/v1/sessions/history` - Riwayat sesi

### Koin
- `GET /api/v1/coins/balance` - Saldo koin
- `GET /api/v1/coins/transactions` - Riwayat transaksi
- `POST /api/v1/coins/gift` - Kirim hadiah

### Teman
- `GET /api/v1/friends` - Daftar teman
- `GET /api/v1/friends/requests` - Permintaan pertemanan
- `POST /api/v1/friends/request` - Kirim permintaan pertemanan

## Event WebSocket

### Matching
- `matching:join` - Gabung antrian matching
- `matching:leave` - Keluar antrian
- `matching:found` - Notifikasi match ditemukan

### Sesi
- `session:ready` - Pengguna siap dalam sesi
- `session:message` - Kirim pesan chat
- `session:gift` - Kirim hadiah
- `session:skip` - Skip sesi saat ini
- `session:end` - Akhiri sesi

## Environment Variables

```env
# Server
PORT=3000
HOST=0.0.0.0
NODE_ENV=development

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/pairlive

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_ACCESS_SECRET=rahasia-access-anda
JWT_REFRESH_SECRET=rahasia-refresh-anda
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Agora
AGORA_APP_ID=agora-app-id-anda
AGORA_APP_CERTIFICATE=agora-certificate-anda

# CORS
CORS_ORIGIN=http://localhost:3000

# Rate Limiting
RATE_LIMIT_MAX=100
RATE_LIMIT_TIME_WINDOW=1 minute
```

## Deployment (VPS)

1. **Setup Server**
   ```bash
   # Install Node.js, PostgreSQL, Redis
   # Clone repository
   # Install dependencies
   npm ci --production
   ```

2. **Build**
   ```bash
   npm run build
   ```

3. **Process Manager (PM2)**
   ```bash
   npm install -g pm2
   pm2 start dist/server.js --name pairlive-api
   pm2 save
   ```

4. **Nginx Reverse Proxy**
   Konfigurasi Nginx untuk proxy request ke Node.js

5. **Sertifikat SSL**
   Gunakan Certbot untuk Let's Encrypt SSL

## Lisensi

Privat - Tim PAIRLIVE
