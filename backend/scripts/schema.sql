-- ============================================
-- PAIRLIVE Database Schema
-- Database PostgreSQL
-- ============================================

-- Aktifkan extension UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABEL PENGGUNA
-- ============================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    photo_url TEXT,
    bio TEXT,
    interests TEXT[] DEFAULT '{}',
    gender VARCHAR(20) NOT NULL,
    birth_date DATE NOT NULL,
    
    -- Trust & Reputasi
    trust_score INTEGER DEFAULT 50 CHECK (trust_score >= 0 AND trust_score <= 100),
    trust_category VARCHAR(20) DEFAULT 'GOOD' CHECK (trust_category IN ('PREMIUM', 'GOOD', 'WARNING', 'RESTRICTED', 'SUSPENDED')),
    level INTEGER DEFAULT 1,
    
    -- Ekonomi Koin
    coin_balance INTEGER DEFAULT 0 CHECK (coin_balance >= 0),
    total_coins_earned INTEGER DEFAULT 0,
    total_coins_spent INTEGER DEFAULT 0,
    
    -- Statistik
    total_sessions INTEGER DEFAULT 0,
    total_minutes INTEGER DEFAULT 0,
    average_rating DECIMAL(3, 2) DEFAULT 0,
    
    -- Status Premium
    is_premium BOOLEAN DEFAULT FALSE,
    premium_until TIMESTAMP,
    
    -- Reset Password
    password_reset_token VARCHAR(255),
    password_reset_expiry TIMESTAMP,
    
    -- Timestamp
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_trust_score ON users(trust_score);
CREATE INDEX idx_users_trust_category ON users(trust_category);

-- ============================================
-- TABEL SESI LIVESTREAM
-- ============================================
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user1_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user2_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    agora_channel_id VARCHAR(255) NOT NULL,
    
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'COMPLETED', 'SKIPPED', 'DISCONNECTED')),
    start_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP,
    duration INTEGER, -- Durasi dalam detik
    ended_by UUID REFERENCES users(id),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sessions_user1 ON sessions(user1_id);
CREATE INDEX idx_sessions_user2 ON sessions(user2_id);
CREATE INDEX idx_sessions_status ON sessions(status);
CREATE INDEX idx_sessions_start_time ON sessions(start_time);

-- ============================================
-- TABEL FEEDBACK & RATING
-- ============================================
CREATE TABLE feedbacks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    target_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(session_id, reviewer_id)
);

CREATE INDEX idx_feedbacks_target ON feedbacks(target_user_id);

-- ============================================
-- TABEL HADIAH
-- ============================================
CREATE TABLE gifts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    gift_type VARCHAR(50) NOT NULL,
    coin_amount INTEGER NOT NULL CHECK (coin_amount > 0),
    receiver_amount INTEGER NOT NULL, -- Setelah potongan platform (70%)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_gifts_session ON gifts(session_id);
CREATE INDEX idx_gifts_sender ON gifts(sender_id);
CREATE INDEX idx_gifts_receiver ON gifts(receiver_id);

-- ============================================
-- TABEL TRANSAKSI KOIN
-- ============================================
CREATE TABLE coin_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id UUID REFERENCES users(id) ON DELETE SET NULL,
    receiver_id UUID REFERENCES users(id) ON DELETE SET NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('PURCHASE', 'GIFT', 'BONUS', 'WITHDRAWAL')),
    amount INTEGER NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_coin_transactions_sender ON coin_transactions(sender_id);
CREATE INDEX idx_coin_transactions_receiver ON coin_transactions(receiver_id);
CREATE INDEX idx_coin_transactions_type ON coin_transactions(type);

-- ============================================
-- TABEL PEMBELIAN KOIN
-- ============================================
CREATE TABLE purchases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    package_id VARCHAR(50) NOT NULL,
    coins INTEGER NOT NULL,
    amount DECIMAL(10, 2) NOT NULL, -- Harga dalam USD
    currency VARCHAR(3) DEFAULT 'USD',
    platform VARCHAR(20) NOT NULL CHECK (platform IN ('ios', 'android')),
    receipt TEXT UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'COMPLETED' CHECK (status IN ('PENDING', 'COMPLETED', 'REFUNDED')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_purchases_user ON purchases(user_id);

-- ============================================
-- TABEL PERTEMANAN
-- ============================================
CREATE TABLE friendships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user1_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user2_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(user1_id, user2_id)
);

CREATE INDEX idx_friendships_user1 ON friendships(user1_id);
CREATE INDEX idx_friendships_user2 ON friendships(user2_id);

-- ============================================
-- TABEL PERMINTAAN PERTEMANAN
-- ============================================
CREATE TABLE friend_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACCEPTED', 'REJECTED')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_friend_requests_sender ON friend_requests(sender_id);
CREATE INDEX idx_friend_requests_receiver ON friend_requests(receiver_id);
CREATE INDEX idx_friend_requests_status ON friend_requests(status);

-- ============================================
-- TABEL LAPORAN
-- ============================================
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reported_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reason VARCHAR(50) NOT NULL CHECK (reason IN ('INAPPROPRIATE_CONTENT', 'HARASSMENT', 'SPAM', 'IMPERSONATION', 'UNDERAGE', 'SCAM', 'OTHER')),
    description TEXT,
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'RESOLVED', 'DISMISSED')),
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reports_reported_user ON reports(reported_user_id);
CREATE INDEX idx_reports_status ON reports(status);

-- ============================================
-- TABEL PELACAKAN PERILAKU
-- ============================================
CREATE TABLE user_behaviors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_id UUID REFERENCES sessions(id) ON DELETE SET NULL,
    behavior_type VARCHAR(50) NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_behaviors_user ON user_behaviors(user_id);
CREATE INDEX idx_user_behaviors_type ON user_behaviors(behavior_type);
CREATE INDEX idx_user_behaviors_created ON user_behaviors(created_at);

-- ============================================
-- TRIGGER: Update timestamp updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- CATATAN: PAKET KOIN
-- small: 100 koin, $0.99
-- medium: 500 koin, $4.99
-- large: 1200 koin, $9.99
-- premium: 5000 koin, $39.99
-- ============================================
COMMENT ON TABLE purchases IS 'Paket koin: small (100 koin, $0.99), medium (500 koin, $4.99), large (1200 koin, $9.99), premium (5000 koin, $39.99)';

-- ============================================
-- CATATAN: JENIS HADIAH
-- heart: 10 koin
-- star: 25 koin
-- flower: 50 koin
-- crown: 100 koin
-- diamond: 500 koin
-- ============================================
COMMENT ON TABLE gifts IS 'Jenis hadiah: heart (10 koin), star (25 koin), flower (50 koin), crown (100 koin), diamond (500 koin)';
