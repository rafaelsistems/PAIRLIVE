# 0 - Satu Acak. Satu Live. Satu Koneksi.

Platform livestreaming video 1v1 random untuk koneksi manusia yang autentik.

## Tentang PAIRLIVE

0

## Dokumentasi

| Dokumen | Deskripsi |
|---------|-----------|
| [Konsep Proyek](./PAIRLIVE-PROJECT-CONCEPT.md) | Dokumen lengkap konsep aplikasi |
| [Spesifikasi API](./docs/API-SPECIFICATION.md) | Dokumentasi REST API & WebSocket |
| [Wireframes](./docs/WIREFRAMES.md) | Desain UI/UX dan komponen |
| [Struktur Folder](./docs/FOLDER-STRUCTURE.md) | Organisasi kode proyek |

## Struktur Proyek

```
PAIRLIVE/
├── mobile/                 # Aplikasi Mobile (React Native)
│   ├── src/
│   │   ├── components/     # Komponen UI
│   │   ├── screens/        # Layar aplikasi
│   │   ├── navigation/     # Navigasi
│   │   ├── store/          # State management (Redux)
│   │   └── theme/          # Tema (warna, typography)
│   └── package.json
│
├── backend/                # Server Backend (Node.js + Fastify)
│   ├── src/
│   │   ├── controllers/    # Handler route
│   │   ├── services/       # Logika bisnis
│   │   ├── routes/         # Definisi API
│   │   ├── socket/         # Real-time (Socket.IO)
│   │   └── workers/        # Background jobs
│   ├── prisma/             # Skema database
│   └── package.json
│
├── infrastructure/         # Panduan deployment VPS
│
└── docs/                   # Dokumentasi
```

## Tech Stack

### Mobile
- **Framework**: React Native
- **Animasi**: React Native Reanimated, Lottie, Moti
- **State**: Redux Toolkit + React Query
- **Navigasi**: React Navigation
- **Video**: Agora SDK

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Fastify
- **Database**: PostgreSQL + Prisma
- **Cache**: Redis
- **Real-time**: Socket.IO
- **Job Queue**: BullMQ

### Infrastruktur
- **Server**: VPS (tanpa Docker)
- **Web Server**: Nginx
- **SSL**: Let's Encrypt
- **Process Manager**: PM2

## Cara Menjalankan

### Backend
```bash
cd backend
npm install
cp .env.example .env
# Edit .env sesuai konfigurasi

# Setup database
npm run db:push

# Jalankan development server
npm run dev
```

### Mobile
```bash
cd mobile
npm install

# iOS
cd ios && pod install && cd ..
npx react-native run-ios

# Android
npx react-native run-android
```

## Fitur Utama

1. **Matchmaking Acak** - Temukan partner secara random
2. **Sesi 1v1 Live** - Video call tanpa batas waktu
3. **Sistem Skip** - Lewati jika tidak cocok
4. **Rating & Feedback** - Beri rating setelah sesi
5. **Ekonomi Koin** - Beli dan kirim hadiah virtual
6. **Sistem Teman** - Tambah teman setelah sesi
7. **Trust Score** - Reputasi berdasarkan perilaku

## Fase Pengembangan

| Fase | Status | Deskripsi |
|------|--------|-----------|
| Fase 1 | 🚧 Dalam Pengerjaan | MVP - Fitur inti |
| Fase 2 | ⏳ Menunggu | Monetisasi & Premium |
| Fase 3 | ⏳ Menunggu | Fitur sosial lanjutan |
| Fase 4 | ⏳ Menunggu | Ekspansi & optimisasi |

## Tim

PAIRLIVE Team

## Lisensi

Hak Cipta © 2024 PAIRLIVE. Semua hak dilindungi.
