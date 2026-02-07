# PAIRLIVE - Project Concept Document

> **Version:** 2.0  
> **Last Updated:** February 2026  
> **Status:** Ready for Development Planning

---

## Table of Contents

1. [Overview](#1-overview)
2. [Core Values](#2-core-values)
3. [Market Differentiation](#3-market-differentiation)
4. [User Flow](#4-user-flow)
5. [Behavioral Algorithm System](#5-behavioral-algorithm-system)
6. [Monetization System](#6-monetization-system)
7. [Safety & Moderation](#7-safety--moderation)
8. [Technical Architecture](#8-technical-architecture)
9. [Database Schema](#9-database-schema)
10. [Development Roadmap](#10-development-roadmap)
11. [Key Metrics (KPIs)](#11-key-metrics-kpis)
12. [Risks & Mitigation](#12-risks--mitigation)

---

## 1. Overview

### Nama Aplikasi

**PAIRLIVE**

### Tagline

> *"One Random. One Live. One Connection."*

### Deskripsi Singkat

PAIRLIVE adalah aplikasi mobile **1-on-1 random video livestreaming** di mana dua pengguna dipertemukan secara acak untuk melakukan interaksi realtime tanpa penonton. Fokus utama adalah **koneksi manusia yang autentik** melalui pengalaman spontan.

### Target Platform

- iOS (App Store)
- Android (Google Play)

### Mengapa Nama PAIRLIVE?

| Elemen | Makna |
|--------|-------|
| **PAIR** | Inti produk: 1 vs 1 connection |
| **LIVE** | Realtime, spontan, autentik |

**Keunggulan nama:**
- Mudah diingat
- Global-friendly
- Aman untuk ekspansi fitur (bukan cuma dating)
- Clean dan scalable

### Alternatif Nama (Cadangan)

- DUOLOOP
- MATCHED LIVE
- ONETOONE
- RANDOMATE LIVE

---

## 2. Core Values

| Prinsip | Implementasi |
|---------|--------------|
| **Randomness** | Tidak ada browsing profil, sistem yang menentukan match |
| **Equality** | Semua user adalah streamer, tidak ada hierarki creator |
| **Authenticity** | Real-time interaction, tidak bisa di-record oleh user |
| **Safety** | Behavioral algorithm + moderation system |
| **Freedom** | Tidak ada batasan durasi, user yang menentukan |

---

## 3. Market Differentiation

### Perbandingan dengan Kompetitor

| Platform Lain | Masalah | PAIRLIVE Solution |
|---------------|---------|-------------------|
| Bigo/TikTok Live | Room ramai, sulit interaksi personal | 1 vs 1 eksklusif |
| Omegle/Chatroulette | Toxic, tidak ada accountability | Behavioral scoring + feedback wajib |
| Dating Apps | Swipe fatigue, ghosting | Random match, real-time only |
| Discord/Zoom | Butuh arrangement, tidak spontan | Instant random connection |

### Value Proposition

| Masalah di Platform Lain | Solusi PAIRLIVE |
|--------------------------|-----------------|
| Room terlalu ramai | 1 vs 1, fokus penuh |
| Creator hanya segelintir | Semua user = streamer |
| Toxic tanpa kontrol | Feedback wajib + behavioral scoring |
| Monetisasi pasif | Reward langsung via coin |

---

## 4. User Flow

### 4.1 Registration & Onboarding

```
┌─────────────────────────────────────────────────────────────┐
│                    REGISTRATION FLOW                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Download App                                            │
│           ↓                                                 │
│  2. Sign Up                                                 │
│     ├── Email + Password                                    │
│     └── OR Social Login (Google/Apple)                      │
│           ↓                                                 │
│  3. Email Verification (wajib)                              │
│           ↓                                                 │
│  4. Age Verification (18+ only)                             │
│           ↓                                                 │
│  5. Profile Setup                                           │
│     ├── Display Name                                        │
│     ├── Profile Photo (wajib)                               │
│     ├── Gender (opsional, untuk preferensi match)           │
│     └── Language Preference                                 │
│           ↓                                                 │
│  6. Permission Request                                      │
│     ├── Camera                                              │
│     ├── Microphone                                          │
│     └── Notification                                        │
│           ↓                                                 │
│  7. Tutorial Singkat (skippable)                            │
│           ↓                                                 │
│  8. Ready to Go Live                                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 Go Live Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     GO LIVE FLOW                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  HOME SCREEN                                                │
│  ┌─────────────────────────────────────┐                    │
│  │                                     │                    │
│  │         [ 🔴 GO LIVE ]              │                    │
│  │                                     │                    │
│  │    "Tap to find your next moment"   │                    │
│  │                                     │                    │
│  └─────────────────────────────────────┘                    │
│                    ↓                                        │
│           User tekan GO LIVE                                │
│                    ↓                                        │
│           Status → ONLINE_AVAILABLE                         │
│                    ↓                                        │
│           Masuk Matching Queue                              │
│                    ↓                                        │
│  ┌─────────────────────────────────────┐                    │
│  │      SEARCHING FOR PARTNER...       │                    │
│  │                                     │                    │
│  │         ◠ ◠ ◠ (animasi)            │                    │
│  │                                     │                    │
│  │   Queue Position: #12               │                    │
│  │   Est. Wait: ~30 seconds            │                    │
│  │                                     │                    │
│  │        [ Cancel ]                   │                    │
│  └─────────────────────────────────────┘                    │
│                    ↓                                        │
│           MATCH FOUND!                                      │
│                    ↓                                        │
│           Masuk Live Session                                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 4.3 Live Session Interface

```
┌─────────────────────────────────────────────────────────────┐
│                   LIVE SESSION SCREEN                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                                                     │    │
│  │              PARTNER VIDEO (MAIN)                   │    │
│  │                                                     │    │
│  │                                                     │    │
│  │    ┌──────────┐                                     │    │
│  │    │ YOUR CAM │                      [Partner Name] │    │
│  │    │ (small)  │                      ⭐ 4.5 (rating)│    │
│  │    └──────────┘                                     │    │
│  │                                                     │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                   CHAT AREA                         │    │
│  │  Partner: Hi there! 👋                              │    │
│  │  You: Hello!                                        │    │
│  │                                                     │    │
│  │  [Type a message...]              [Send]            │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                  ACTION BAR                         │    │
│  │                                                     │    │
│  │  [🎤 Mute] [📷 Cam Off] [🎁 Gift] [⏭ Skip] [🚪 End] │    │
│  │                                                     │    │
│  │                    [⚠️ Report]                       │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Session Controls:**

| Tombol | Fungsi | Catatan |
|--------|--------|---------|
| 🎤 Mute | On/off microphone | Default: ON |
| 📷 Cam Off | On/off camera | Default: ON |
| 🎁 Gift | Kirim koin/gift | Opens gift panel |
| ⏭ Skip | Cari partner baru | Enabled setelah 30 detik |
| 🚪 End | Akhiri sesi | Available kapan saja |
| ⚠️ Report | Laporkan user | 1-tap report |

### 4.4 Skip Mechanism

```
┌─────────────────────────────────────────────────────────────┐
│                    SKIP SYSTEM                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Session dimulai                                            │
│       ↓                                                     │
│  0-30 detik: Tombol SKIP disabled (grace period)            │
│       ↓                                                     │
│  30+ detik: Tombol SKIP enabled                             │
│       ↓                                                     │
│  User tekan SKIP                                            │
│       ↓                                                     │
│  ┌─────────────────────────────────┐                        │
│  │  Quick Feedback (opsional)      │                        │
│  │                                 │                        │
│  │  Why skip?                      │                        │
│  │  [ ] Not my vibe                │                        │
│  │  [ ] Connection issue           │                        │
│  │  [ ] Other                      │                        │
│  │                                 │                        │
│  │  [Skip Anyway] [Submit & Skip]  │                        │
│  └─────────────────────────────────┘                        │
│       ↓                                                     │
│  Partner dapat notifikasi:                                  │
│  "Your partner left the session"                            │
│       ↓                                                     │
│  Skipper → kembali ke queue                                 │
│  Partner → opsi: "Find New" atau "Exit"                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Anti-Abuse Measures:**
- Skip 3x dalam 10 menit → Cooldown 5 menit
- Skip behavior di-track oleh algoritma
- Pattern mencurigakan → flag untuk review

### 4.5 End Session & Feedback

```
┌─────────────────────────────────────────────────────────────┐
│                 END SESSION FLOW                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  User A atau User B tekan "End Session"                     │
│       ↓                                                     │
│  Session terminated untuk kedua user                        │
│       ↓                                                     │
│  ┌─────────────────────────────────────┐                    │
│  │       FEEDBACK SCREEN (WAJIB)       │                    │
│  │                                     │                    │
│  │   How was your experience?          │                    │
│  │                                     │                    │
│  │      😠  😕  😐  🙂  😄             │                    │
│  │       1   2   3   4   5             │                    │
│  │                                     │                    │
│  │   [Optional: Add comment]           │                    │
│  │                                     │                    │
│  │          [ SUBMIT ]                 │                    │
│  │                                     │                    │
│  │   ────────────────────────          │                    │
│  │                                     │                    │
│  │   [➕ Add Friend]  (jika rating 4+) │                    │
│  │                                     │                    │
│  └─────────────────────────────────────┘                    │
│       ↓                                                     │
│  ┌─────────────────────────────────────┐                    │
│  │                                     │                    │
│  │   [ 🔴 Find New Match ]             │                    │
│  │                                     │                    │
│  │   [ 🏠 Back to Home ]               │                    │
│  │                                     │                    │
│  └─────────────────────────────────────┘                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 5. Behavioral Algorithm System

### 5.1 Overview

Sistem mempelajari kebiasaan setiap user untuk:
- Matchmaking yang lebih baik
- Deteksi toxic behavior
- Reward user berkualitas
- Penalti otomatis tanpa manual review

```
┌────────────────────────────────────────────────────────────────┐
│                    USER BEHAVIOR ENGINE                        │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│   ┌──────────────┐    ┌──────────────┐    ┌──────────────┐    │
│   │   COLLECT    │───▶│   ANALYZE    │───▶│    SCORE     │    │
│   │    DATA      │    │   PATTERN    │    │   & ACTION   │    │
│   └──────────────┘    └──────────────┘    └──────────────┘    │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

### 5.2 Data Collection

#### Session Metrics

| Metric | Deskripsi | Weight |
|--------|-----------|--------|
| `avg_session_duration` | Rata-rata durasi sesi | High |
| `skip_rate` | % sesi yang di-skip | High |
| `skip_speed` | Seberapa cepat skip (detik) | Medium |
| `end_initiator_rate` | % sesi yang user akhiri duluan | Low |
| `session_count_daily` | Jumlah sesi per hari | Low |

#### Interaction Quality

| Metric | Deskripsi | Weight |
|--------|-----------|--------|
| `chat_engagement` | Jumlah chat dikirim per sesi | Medium |
| `video_on_rate` | % waktu video aktif | Medium |
| `audio_on_rate` | % waktu audio aktif | Medium |
| `coin_sent_total` | Total koin dikirim | Medium |
| `coin_received_total` | Total koin diterima | High |

#### Feedback Received

| Metric | Deskripsi | Weight |
|--------|-----------|--------|
| `avg_rating_received` | Rata-rata rating dari partner | Critical |
| `report_count` | Jumlah report diterima | Critical |
| `positive_feedback_rate` | % feedback positif | High |

#### Pattern Detection (Red Flags)

| Metric | Deskripsi | Flag |
|--------|-----------|------|
| `skip_pattern_gender` | Skip berdasarkan gender tertentu | 🚩 |
| `skip_pattern_time` | Skip selalu di detik ke-31 (gaming system) | 🚩 |
| `afk_rate` | % sesi tidak ada interaksi | 🚩 |
| `report_timing` | Report setelah di-skip (revenge report) | 🚩 |

### 5.3 Trust Score Formula

```
┌─────────────────────────────────────────────────────────────┐
│                  TRUST SCORE (0-100)                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  BASE SCORE =                                               │
│    (avg_rating_received × 25)      ← Most important        │
│  + (session_completion_rate × 20)                           │
│  + (coin_received_ratio × 15)                               │
│  + (positive_feedback_rate × 15)                            │
│  + (engagement_score × 15)                                  │
│  + (account_age_factor × 10)                                │
│                                                             │
│  PENALTY =                                                  │
│    (report_count × 10)                                      │
│  + (skip_abuse_flag × 15)                                   │
│  + (afk_violations × 5)                                     │
│  + (pattern_flags × 20)                                     │
│                                                             │
│  ═══════════════════════════════════════════════════════    │
│  FINAL TRUST SCORE = BASE SCORE - PENALTY                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 5.4 User Categories

| Trust Score | Category | Icon | Treatment |
|-------------|----------|------|-----------|
| 85-100 | PREMIUM | ⭐ | Priority queue, matched dengan premium, badge visible |
| 60-84 | GOOD | ✅ | Normal experience |
| 40-59 | WARNING | ⚠️ | Improvement tips, limited features |
| 20-39 | RESTRICTED | 🚫 | Longer queue, mandatory video, auto-review |
| 0-19 | SUSPENDED | ❌ | Temporary ban (24h-7d), appeal available |

### 5.5 Smart Matching Algorithm

```
┌─────────────────────────────────────────────────────────────┐
│               MATCHING ALGORITHM                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  STEP 1: FILTER                                             │
│  ├── Status = ONLINE_AVAILABLE                              │
│  ├── Not matched today (anti-repeat)                        │
│  ├── Trust score compatible (±20 range)                     │
│  └── Language preference match                              │
│                                                             │
│  STEP 2: SCORE COMPATIBILITY                                │
│  ├── Behavior similarity: 40%                               │
│  │   ├── Session duration pattern                           │
│  │   ├── Engagement level                                   │
│  │   └── Skip rate similarity                               │
│  ├── Trust score proximity: 30%                             │
│  ├── Queue wait time: 20%                                   │
│  └── Random factor: 10%                                     │
│                                                             │
│  STEP 3: SELECT                                             │
│  └── Highest compatibility score wins                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Behavior Compatibility Examples:**

| User A Pattern | User B Pattern | Result |
|----------------|----------------|--------|
| Suka ngobrol lama | Suka ngobrol lama | ✅ Great match |
| Suka ngobrol lama | Suka skip cepat | ❌ Bad match |
| Casual chatter | Casual chatter | ✅ Good match |
| Coin sender | Quality conversationalist | ✅ Good match |

### 5.6 Auto-Moderation Triggers

```
┌─────────────────────────────────────────────────────────────┐
│              AUTO-MODERATION TRIGGERS                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  SKIP ABUSE                                                 │
│  Trigger: 3 skips dalam 10 menit                            │
│  Action: Cooldown 5 menit + warning                         │
│                                                             │
│  AFK DETECTION                                              │
│  Trigger: No interaction 2 menit                            │
│  Action: Warn partner, option to end                        │
│  Trigger: No interaction 5 menit                            │
│  Action: Auto-end session, AFK penalty                      │
│                                                             │
│  RATING SPIKE                                               │
│  Trigger: 3+ rating "1" dalam 24 jam                        │
│  Action: Auto-restrict, review queue                        │
│                                                             │
│  REPORT SPIKE                                               │
│  Trigger: 3+ reports dalam 24 jam                           │
│  Action: Auto-suspend, manual review                        │
│                                                             │
│  PATTERN DETECTION                                          │
│  Trigger: Gaming minimum time (skip at 30-35s always)       │
│  Action: Increase minimum to 60s for this user              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 5.7 Recovery System

| Condition | Recovery Method |
|-----------|-----------------|
| Penalty decay | -5% penalty setiap 24 jam tanpa violation |
| Good streak | 5 sesi rating 4+ berturut = +5 trust score |
| No skip streak | 10 sesi tanpa skip = +3 trust score |
| Receive gifts | +1 trust per 100 coins received |
| Post-suspension | 20 clean sessions = kembali normal |

---

## 6. Monetization System

### 6.1 Coin Economy

```
┌─────────────────────────────────────────────────────────────┐
│                    COIN SYSTEM                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  PURCHASE (In-App)                                          │
│  ├── 100 coins  = $0.99                                     │
│  ├── 500 coins  = $4.49  (10% bonus)                        │
│  ├── 1000 coins = $8.49  (15% bonus)                        │
│  └── 5000 coins = $39.99 (20% bonus)                        │
│                                                             │
│  FREE COINS                                                 │
│  ├── Daily login: 5 coins                                   │
│  ├── Complete profile: 50 coins (one-time)                  │
│  ├── Invite friend: 100 coins per friend                    │
│  ├── First session of day: 10 coins                         │
│  └── Achievement rewards: varies                            │
│                                                             │
│  USAGE                                                      │
│  ├── Send gift during session                               │
│  ├── Send gift after session (if added as friend)           │
│  └── Boost queue priority (opsional)                        │
│                                                             │
│  DISTRIBUTION                                               │
│  ├── Receiver: 70%                                          │
│  └── Platform: 30%                                          │
│                                                             │
│  WITHDRAWAL (Phase 2)                                       │
│  ├── Minimum: 10,000 coins                                  │
│  ├── Rate: 1000 coins = $7.00                               │
│  └── Method: PayPal, Bank Transfer                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 6.2 Gift Catalog

| Gift | Price | Animation |
|------|-------|-----------|
| 👋 Wave | 5 coins | Simple wave |
| ❤️ Heart | 10 coins | Floating hearts |
| 🌟 Star | 25 coins | Sparkle effect |
| 🎁 Gift Box | 50 coins | Box opening |
| 💎 Diamond | 100 coins | Shine effect |
| 🚀 Rocket | 500 coins | Full screen |

### 6.3 Premium Features (Phase 2+)

| Feature | Model |
|---------|-------|
| Queue boost | Pay per use (coins) |
| Gender filter | Subscription |
| Extended match history | Subscription |
| Badge customization | One-time purchase |

---

## 7. Safety & Moderation

### 7.1 Proactive Measures

| Measure | Implementation |
|---------|----------------|
| Age verification | 18+ required, verify via ID (Phase 2) |
| Email verification | Wajib sebelum bisa Go Live |
| Photo verification | Profile photo wajib |
| Content detection | Real-time AI untuk nudity/violence |

### 7.2 Reactive Measures

| Measure | Implementation |
|---------|----------------|
| 1-tap report | Instant report tanpa leave session |
| Block user | Tidak akan di-match lagi |
| Server-side buffer | 30 detik recording untuk review |
| Manual review team | Untuk kasus berat |

### 7.3 Report Categories

- Inappropriate content
- Harassment/bullying
- Spam/advertising
- Underage user
- Other violation

### 7.4 Punishment Tiers

| Tier | Severity | Action |
|------|----------|--------|
| Tier 1 | Minor | Warning + trust penalty |
| Tier 2 | Moderate | 24h suspension |
| Tier 3 | Serious | 7d suspension |
| Tier 4 | Severe | Permanent ban |

---

## 8. Technical Architecture

### 8.1 Tech Stack (Recommended)

```
┌─────────────────────────────────────────────────────────────┐
│                    TECH STACK                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  MOBILE APP                                                 │
│  ├── Framework: Flutter / React Native                      │
│  ├── State: Redux / Riverpod                                │
│  └── Video: Agora SDK / Twilio                              │
│                                                             │
│  BACKEND                                                    │
│  ├── API: Node.js (Express/Fastify) atau Go                 │
│  ├── Real-time: Socket.io / WebSocket                       │
│  ├── Queue: Redis + Bull                                    │
│  └── Database: PostgreSQL + Redis                           │
│                                                             │
│  INFRASTRUCTURE                                             │
│  ├── Cloud: AWS / GCP                                       │
│  ├── CDN: CloudFlare                                        │
│  ├── Video: Agora.io (managed service)                      │
│  └── Monitoring: DataDog / Sentry                           │
│                                                             │
│  AI/ML                                                      │
│  ├── Content moderation: AWS Rekognition                    │
│  ├── Behavior analysis: Custom ML model                     │
│  └── Matchmaking: Algorithm + ML optimization               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 8.2 System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        PAIRLIVE ARCHITECTURE                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐           │
│  │   iOS App   │     │ Android App │     │   Web App   │           │
│  └──────┬──────┘     └──────┬──────┘     └──────┬──────┘           │
│         │                   │                   │                   │
│         └───────────────────┼───────────────────┘                   │
│                             │                                       │
│                    ┌────────▼────────┐                              │
│                    │   API Gateway   │                              │
│                    │   (Load Balancer)│                             │
│                    └────────┬────────┘                              │
│                             │                                       │
│         ┌───────────────────┼───────────────────┐                   │
│         │                   │                   │                   │
│  ┌──────▼──────┐    ┌───────▼───────┐   ┌──────▼──────┐            │
│  │ Auth Service │    │ Match Service │   │ Chat Service│            │
│  └──────┬──────┘    └───────┬───────┘   └──────┬──────┘            │
│         │                   │                   │                   │
│         │           ┌───────▼───────┐          │                   │
│         │           │ Redis Queue   │          │                   │
│         │           │ (Matching)    │          │                   │
│         │           └───────────────┘          │                   │
│         │                                      │                   │
│  ┌──────▼──────────────────────────────────────▼──────┐            │
│  │                  PostgreSQL                        │            │
│  │              (Primary Database)                    │            │
│  └────────────────────────────────────────────────────┘            │
│                                                                     │
│  ┌────────────────────┐    ┌────────────────────┐                  │
│  │    Agora.io        │    │  AWS Rekognition   │                  │
│  │  (Video Streaming) │    │  (AI Moderation)   │                  │
│  └────────────────────┘    └────────────────────┘                  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 9. Database Schema

### 9.1 Core Tables

```sql
-- =====================================================
-- USERS TABLE
-- =====================================================
CREATE TABLE users (
    id                  UUID PRIMARY KEY,
    email               VARCHAR(255) UNIQUE NOT NULL,
    password_hash       VARCHAR(255) NOT NULL,
    display_name        VARCHAR(50) NOT NULL,
    profile_photo_url   VARCHAR(500),
    gender              VARCHAR(20),
    language            VARCHAR(10) DEFAULT 'en',
    status              VARCHAR(20) DEFAULT 'offline',
    trust_score         INTEGER DEFAULT 50,
    category            VARCHAR(20) DEFAULT 'good',
    coins_balance       INTEGER DEFAULT 0,
    is_verified         BOOLEAN DEFAULT FALSE,
    created_at          TIMESTAMP DEFAULT NOW(),
    last_active_at      TIMESTAMP
);

-- =====================================================
-- SESSIONS TABLE
-- =====================================================
CREATE TABLE sessions (
    id                  UUID PRIMARY KEY,
    user_a_id           UUID REFERENCES users(id),
    user_b_id           UUID REFERENCES users(id),
    started_at          TIMESTAMP NOT NULL,
    ended_at            TIMESTAMP,
    ended_by            VARCHAR(20), -- 'user_a', 'user_b', 'system'
    end_reason          VARCHAR(50), -- 'normal', 'skip', 'report', 'afk'
    duration_seconds    INTEGER
);

-- =====================================================
-- SESSION EVENTS TABLE
-- =====================================================
CREATE TABLE session_events (
    id                  UUID PRIMARY KEY,
    session_id          UUID REFERENCES sessions(id),
    user_id             UUID REFERENCES users(id),
    event_type          VARCHAR(50) NOT NULL,
    event_data          JSONB,
    created_at          TIMESTAMP DEFAULT NOW()
);
-- event_type: 'chat', 'gift', 'skip', 'report', 'mute', 'cam_off', etc.

-- =====================================================
-- FEEDBACK TABLE
-- =====================================================
CREATE TABLE feedback (
    id                  UUID PRIMARY KEY,
    session_id          UUID REFERENCES sessions(id),
    from_user_id        UUID REFERENCES users(id),
    to_user_id          UUID REFERENCES users(id),
    rating              INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment             TEXT,
    created_at          TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- USER BEHAVIOR METRICS TABLE
-- =====================================================
CREATE TABLE user_behavior (
    user_id                 UUID PRIMARY KEY REFERENCES users(id),
    total_sessions          INTEGER DEFAULT 0,
    total_skips             INTEGER DEFAULT 0,
    total_skipped           INTEGER DEFAULT 0,
    avg_session_duration    FLOAT DEFAULT 0,
    avg_rating_received     FLOAT DEFAULT 0,
    avg_rating_given        FLOAT DEFAULT 0,
    coins_sent_total        INTEGER DEFAULT 0,
    coins_received_total    INTEGER DEFAULT 0,
    report_count            INTEGER DEFAULT 0,
    afk_count               INTEGER DEFAULT 0,
    last_calculated_at      TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- TRANSACTIONS TABLE
-- =====================================================
CREATE TABLE transactions (
    id                  UUID PRIMARY KEY,
    user_id             UUID REFERENCES users(id),
    type                VARCHAR(20) NOT NULL,
    amount              INTEGER NOT NULL,
    related_user_id     UUID REFERENCES users(id),
    session_id          UUID REFERENCES sessions(id),
    status              VARCHAR(20) DEFAULT 'completed',
    created_at          TIMESTAMP DEFAULT NOW()
);
-- type: 'purchase', 'send', 'receive', 'withdraw', 'bonus'

-- =====================================================
-- FRIENDSHIPS TABLE
-- =====================================================
CREATE TABLE friendships (
    id                  UUID PRIMARY KEY,
    user_a_id           UUID REFERENCES users(id),
    user_b_id           UUID REFERENCES users(id),
    created_at          TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_a_id, user_b_id)
);

-- =====================================================
-- REPORTS TABLE
-- =====================================================
CREATE TABLE reports (
    id                  UUID PRIMARY KEY,
    reporter_id         UUID REFERENCES users(id),
    reported_id         UUID REFERENCES users(id),
    session_id          UUID REFERENCES sessions(id),
    category            VARCHAR(50) NOT NULL,
    description         TEXT,
    status              VARCHAR(20) DEFAULT 'pending',
    reviewed_by         UUID,
    resolved_at         TIMESTAMP,
    created_at          TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- BEHAVIOR FLAGS TABLE
-- =====================================================
CREATE TABLE behavior_flags (
    id                  UUID PRIMARY KEY,
    user_id             UUID REFERENCES users(id),
    flag_type           VARCHAR(50) NOT NULL,
    severity            INTEGER DEFAULT 1,
    details             JSONB,
    resolved            BOOLEAN DEFAULT FALSE,
    created_at          TIMESTAMP DEFAULT NOW(),
    resolved_at         TIMESTAMP
);
-- flag_type: 'skip_abuse', 'afk', 'pattern', 'toxic', 'spam'

-- =====================================================
-- GIFTS TABLE (Catalog)
-- =====================================================
CREATE TABLE gifts (
    id                  UUID PRIMARY KEY,
    name                VARCHAR(50) NOT NULL,
    icon                VARCHAR(50),
    price_coins         INTEGER NOT NULL,
    animation_type      VARCHAR(50),
    is_active           BOOLEAN DEFAULT TRUE
);

-- =====================================================
-- INDEXES
-- =====================================================
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_trust_score ON users(trust_score);
CREATE INDEX idx_sessions_users ON sessions(user_a_id, user_b_id);
CREATE INDEX idx_sessions_started ON sessions(started_at);
CREATE INDEX idx_feedback_to_user ON feedback(to_user_id);
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_transactions_user ON transactions(user_id);
```

---

## 10. Development Roadmap

### Phase 1: MVP (Core Features)

| Feature | Priority | Status |
|---------|----------|--------|
| User registration & auth | P0 | 🔲 |
| Email verification | P0 | 🔲 |
| Profile setup | P0 | 🔲 |
| Go Live & matching queue | P0 | 🔲 |
| 1v1 video session | P0 | 🔲 |
| Chat in session | P0 | 🔲 |
| Skip (with 30s grace) | P0 | 🔲 |
| End session | P0 | 🔲 |
| Basic feedback (rating) | P0 | 🔲 |
| Report system | P0 | 🔲 |
| Basic trust score | P1 | 🔲 |
| Coin purchase | P1 | 🔲 |
| Send gift | P1 | 🔲 |

### Phase 2: Enhancement

| Feature | Priority | Status |
|---------|----------|--------|
| Advanced behavioral algorithm | P0 | 🔲 |
| Smart matchmaking | P0 | 🔲 |
| Add friend | P0 | 🔲 |
| Push notifications | P1 | 🔲 |
| Achievement & badges | P1 | 🔲 |
| Coin withdrawal | P1 | 🔲 |
| Language filter | P2 | 🔲 |

### Phase 3: Scale

| Feature | Priority | Status |
|---------|----------|--------|
| AI content moderation | P0 | 🔲 |
| Regional expansion | P0 | 🔲 |
| Gender/interest filter (subscription) | P1 | 🔲 |
| Creator program | P1 | 🔲 |
| Analytics dashboard | P2 | 🔲 |
| Web version | P2 | 🔲 |

---

## 11. Key Metrics (KPIs)

### User Metrics

| Metric | Target (MVP) | Target (Scale) |
|--------|--------------|----------------|
| DAU | 1,000+ | 100,000+ |
| MAU | 10,000+ | 1,000,000+ |
| D1 Retention | 40%+ | 50%+ |
| D7 Retention | 20%+ | 30%+ |
| D30 Retention | 10%+ | 20%+ |

### Engagement Metrics

| Metric | Target (MVP) | Target (Scale) |
|--------|--------------|----------------|
| Avg sessions/user/day | 3+ | 5+ |
| Avg session duration | 5+ min | 8+ min |
| Session completion rate | 60%+ | 70%+ |
| Skip rate | < 40% | < 30% |

### Monetization Metrics

| Metric | Target (MVP) | Target (Scale) |
|--------|--------------|----------------|
| Paying user % | 5%+ | 10%+ |
| ARPU | $1+ | $3+ |
| ARPPU | $10+ | $20+ |

### Quality Metrics

| Metric | Target |
|--------|--------|
| Avg user rating | 3.5+ |
| Report rate | < 5% |
| False report rate | < 20% |

---

## 12. Risks & Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Cold start (not enough users) | Critical | High | Scheduled prime times, regional focus, referral bonus, early adopter incentives |
| Toxic/inappropriate content | Critical | High | AI moderation, report system, trust scoring, server-side recording |
| High skip rate | High | Medium | 30s grace period, behavior tracking, compatibility matching |
| Server/infrastructure cost | High | Medium | Optimize video routing, use managed services, implement cost monitoring |
| Legal/compliance issues | High | Medium | Age verification, clear ToS, GDPR compliance, regional law review |
| Competition from established apps | Medium | High | Focus on unique 1v1 value prop, build strong community |
| Video quality/latency issues | Medium | Medium | Use proven SDK (Agora), implement fallback, regional servers |
| Payment/fraud issues | Medium | Low | Use established payment providers, implement fraud detection |

---

## 13. Success Criteria

PAIRLIVE dianggap berhasil jika:

1. **User Engagement Tinggi**
   - Users kembali setiap hari
   - Session duration > 5 menit rata-rata

2. **Session Quality Baik**
   - Completion rate > 60%
   - Skip rate < 40%
   - Avg rating > 3.5

3. **Community Sehat**
   - Low report rate (< 5%)
   - High trust scores across users
   - Organic word-of-mouth growth

4. **Monetization Works**
   - Sustainable coin economy
   - 5%+ paying users
   - Positive unit economics

5. **Technical Stability**
   - 99.9% uptime
   - < 500ms matching time
   - Minimal video quality complaints

---

## Appendix

### A. Glossary

| Term | Definition |
|------|------------|
| Session | Satu sesi video call antara 2 user |
| Match | Proses mempertemukan 2 user |
| Skip | Mengakhiri sesi dan mencari partner baru |
| Trust Score | Skor internal untuk mengukur kualitas user |
| Queue | Antrian user yang menunggu match |
| Coin | Virtual currency dalam aplikasi |

### B. References

- Agora.io Documentation
- WebRTC Standards
- GDPR Compliance Guidelines
- App Store / Play Store Guidelines

---

**Document maintained by:** PAIRLIVE Development Team  
**Last Review:** February 2026
