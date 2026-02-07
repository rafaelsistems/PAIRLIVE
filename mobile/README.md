# PAIRLIVE Mobile

Aplikasi mobile React Native untuk platform PAIRLIVE dengan animasi penuh.

## Tech Stack

- **Framework**: React Native 0.73+
- **Bahasa**: TypeScript
- **Navigasi**: React Navigation 6
- **State Management**: Redux Toolkit + Redux Persist
- **Data Fetching**: React Query (TanStack Query)
- **Animasi**: 
  - React Native Reanimated 3
  - Lottie React Native
  - Moti
  - React Native Skia
- **Video/Livestream**: Agora SDK
- **Networking**: Axios + Socket.IO Client

## Struktur Proyek

```
mobile/
├── src/
│   ├── components/           # Komponen UI
│   │   ├── ui/               # Komponen dasar (Button, Input, dll)
│   │   ├── navigation/       # Komponen navigasi
│   │   └── session/          # Komponen sesi live
│   │
│   ├── screens/              # Layar aplikasi
│   │   ├── auth/             # Layar autentikasi
│   │   ├── main/             # Layar utama (Home, Profile, dll)
│   │   └── session/          # Layar sesi (Matching, Live, Feedback)
│   │
│   ├── navigation/           # Setup navigasi
│   │   └── AppNavigator.tsx  # Navigator utama
│   │
│   ├── store/                # Redux store
│   │   ├── index.ts          # Konfigurasi store
│   │   └── slices/           # Redux slices
│   │
│   ├── theme/                # Tema aplikasi
│   │   ├── colors.ts         # Palet warna
│   │   ├── spacing.ts        # Spacing & ukuran
│   │   └── typography.ts     # Gaya teks
│   │
│   ├── services/             # API services
│   ├── hooks/                # Custom hooks
│   ├── utils/                # Fungsi utilitas
│   └── App.tsx               # Komponen root
│
├── .env.example              # Template environment
├── app.json                  # Konfigurasi aplikasi
├── babel.config.js           # Konfigurasi Babel
├── package.json
└── tsconfig.json
```

## Memulai

### Prasyarat

- Node.js 18+
- React Native CLI
- Xcode (untuk iOS)
- Android Studio (untuk Android)

### Instalasi

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Setup environment**
   ```bash
   cp .env.example .env
   # Edit .env dengan konfigurasi Anda
   ```

3. **Install pods iOS**
   ```bash
   cd ios && pod install && cd ..
   ```

4. **Jalankan aplikasi**
   ```bash
   # iOS
   npx react-native run-ios

   # Android
   npx react-native run-android
   ```

## Script Tersedia

| Script | Deskripsi |
|--------|-----------|
| `npm start` | Jalankan Metro bundler |
| `npm run android` | Jalankan di Android |
| `npm run ios` | Jalankan di iOS |
| `npm run lint` | Jalankan ESLint |
| `npm test` | Jalankan test |
| `npm run clean` | Bersihkan build |

## Fitur Animasi

Aplikasi ini dibangun dengan fokus pada animasi yang halus:

### Komponen Animasi
- **AnimatedButton** - Tombol dengan efek tekan scale
- **AnimatedInput** - Input dengan animasi fokus
- **GoLiveButton** - Tombol utama dengan efek pulse
- **CustomTabBar** - Tab bar dengan animasi item

### Layar Animasi
- **SplashScreen** - Logo animasi saat loading
- **WelcomeScreen** - Onboarding dengan slide animasi
- **MatchingScreen** - Radar animasi saat mencari match
- **LiveSessionScreen** - Kontrol dengan animasi interaktif
- **FeedbackScreen** - Rating bintang animasi

### Library Animasi
- `react-native-reanimated` - Animasi 60fps
- `lottie-react-native` - Animasi Lottie
- `moti` - Animasi deklaratif
- `@shopify/react-native-skia` - Grafik 2D kustom

## State Management

### Redux Slices
- **authSlice** - State autentikasi (token, login status)
- **userSlice** - Data pengguna (profil, statistik)
- **sessionSlice** - State sesi live
- **matchingSlice** - State proses matching

### Persistence
Data disimpan menggunakan Redux Persist dengan MMKV storage untuk performa optimal.

## Navigasi

```
Root
├── Auth Stack (belum login)
│   ├── Splash
│   ├── Welcome (Onboarding)
│   ├── Login
│   └── Register
│
└── Main Stack (sudah login)
    ├── Tab Navigator
    │   ├── Home
    │   ├── Friends
    │   └── Profile
    │
    └── Modal Stack
        ├── Matching
        ├── LiveSession
        └── Feedback
```

## Tema

### Warna Utama
- **Primary**: #6C5CE7 (Ungu)
- **Secondary**: #00D9FF (Cyan)
- **Background**: #0D0D1A (Gelap)
- **Surface**: #1A1A2E (Card)

### Gradient
- **Primary**: #6C5CE7 → #8B7CF7
- **Live**: #FF6B6B → #FF8E8E
- **Glow**: #6C5CE7 → #00D9FF

## Environment Variables

```env
# API
API_URL=http://localhost:3000/api/v1
SOCKET_URL=http://localhost:3000

# Agora
AGORA_APP_ID=agora-app-id-anda
```

## Build Production

### Android
```bash
cd android
./gradlew assembleRelease
```

### iOS
Gunakan Xcode untuk archive dan upload ke App Store.

## Troubleshooting

### Metro Bundler Error
```bash
npm start -- --reset-cache
```

### iOS Build Error
```bash
cd ios
pod deintegrate
pod install
```

### Android Build Error
```bash
cd android
./gradlew clean
```

## Lisensi

Privat - Tim PAIRLIVE
