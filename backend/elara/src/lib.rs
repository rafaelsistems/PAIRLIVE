//! PAIRLIVE ELARA Protocol Integration
//! 
//! Modul ini menyediakan integrasi dengan ELARA Protocol untuk
//! komunikasi real-time yang lebih baik dari WebRTC.
//! 
//! ELARA Protocol menawarkan:
//! - Graceful Degradation: Kualitas turun, koneksi tetap
//! - NAT Hostile Ready: Bekerja di balik firewall ketat
//! - Event-Driven: Lebih efisien dan responsif
//! - Cryptographic Reality: Keamanan end-to-end

use napi::bindgen_prelude::*;
use napi_derive::napi;
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;
use uuid::Uuid;

mod session;
mod media;
mod transport;

pub use session::*;
pub use media::*;
pub use transport::*;

/// Status koneksi ELARA
#[napi]
#[derive(Debug, Clone, PartialEq)]
pub enum ConnectionStatus {
    /// Terputus
    Disconnected,
    /// Sedang menghubungkan
    Connecting,
    /// Terhubung
    Connected,
    /// Terhubung tapi kualitas menurun
    Degraded,
    /// Sedang reconnect
    Reconnecting,
}

/// Kualitas koneksi
#[napi]
#[derive(Debug, Clone)]
pub struct ConnectionQuality {
    /// Skor kualitas 0-100
    pub score: u8,
    /// Latency dalam ms
    pub latency_ms: u32,
    /// Packet loss percentage
    pub packet_loss: f32,
    /// Bandwidth tersedia (kbps)
    pub bandwidth_kbps: u32,
}

/// Konfigurasi ELARA Node
#[napi(object)]
#[derive(Debug, Clone)]
pub struct ElaraConfig {
    /// Server STUN untuk NAT traversal
    pub stun_servers: Vec<String>,
    /// Server TURN untuk relay
    pub turn_servers: Vec<String>,
    /// Enable video
    pub video_enabled: bool,
    /// Enable audio
    pub audio_enabled: bool,
    /// Max video bitrate (kbps)
    pub max_video_bitrate: u32,
    /// Max audio bitrate (kbps)
    pub max_audio_bitrate: u32,
}

impl Default for ElaraConfig {
    fn default() -> Self {
        Self {
            stun_servers: vec!["stun:stun.l.google.com:19302".to_string()],
            turn_servers: vec![],
            video_enabled: true,
            audio_enabled: true,
            max_video_bitrate: 2500,
            max_audio_bitrate: 128,
        }
    }
}

/// ELARA Node - Node utama untuk komunikasi
#[napi]
pub struct ElaraNode {
    node_id: String,
    config: ElaraConfig,
    sessions: Arc<RwLock<HashMap<String, ElaraSession>>>,
    status: Arc<RwLock<ConnectionStatus>>,
}

#[napi]
impl ElaraNode {
    /// Buat node ELARA baru
    #[napi(constructor)]
    pub fn new(config: Option<ElaraConfig>) -> Self {
        let config = config.unwrap_or_default();
        
        Self {
            node_id: Uuid::new_v4().to_string(),
            config,
            sessions: Arc::new(RwLock::new(HashMap::new())),
            status: Arc::new(RwLock::new(ConnectionStatus::Disconnected)),
        }
    }

    /// Dapatkan ID node
    #[napi(getter)]
    pub fn node_id(&self) -> String {
        self.node_id.clone()
    }

    /// Dapatkan status koneksi
    #[napi]
    pub async fn get_status(&self) -> ConnectionStatus {
        self.status.read().await.clone()
    }

    /// Inisialisasi node
    #[napi]
    pub async fn initialize(&self) -> Result<()> {
        let mut status = self.status.write().await;
        *status = ConnectionStatus::Connecting;
        
        // TODO: Inisialisasi ELARA runtime
        // - Setup crypto keys
        // - Initialize transport layer
        // - Connect to signaling server
        
        *status = ConnectionStatus::Connected;
        Ok(())
    }

    /// Buat sesi baru dengan peer
    #[napi]
    pub async fn create_session(&self, session_id: String, peer_id: String) -> Result<ElaraSession> {
        let session = ElaraSession::new(session_id.clone(), self.node_id.clone(), peer_id);
        
        let mut sessions = self.sessions.write().await;
        sessions.insert(session_id, session.clone());
        
        Ok(session)
    }

    /// Dapatkan sesi aktif
    #[napi]
    pub async fn get_session(&self, session_id: String) -> Option<ElaraSession> {
        let sessions = self.sessions.read().await;
        sessions.get(&session_id).cloned()
    }

    /// Tutup sesi
    #[napi]
    pub async fn close_session(&self, session_id: String) -> Result<()> {
        let mut sessions = self.sessions.write().await;
        
        if let Some(mut session) = sessions.remove(&session_id) {
            session.close().await?;
        }
        
        Ok(())
    }

    /// Tutup node
    #[napi]
    pub async fn shutdown(&self) -> Result<()> {
        let mut status = self.status.write().await;
        *status = ConnectionStatus::Disconnected;
        
        // Tutup semua sesi
        let mut sessions = self.sessions.write().await;
        for (_, mut session) in sessions.drain() {
            let _ = session.close().await;
        }
        
        Ok(())
    }
}

/// Generate token untuk sesi
#[napi]
pub fn generate_session_token(user_id: String, session_id: String, secret: String) -> String {
    use std::time::{SystemTime, UNIX_EPOCH};
    
    let timestamp = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_secs();
    
    // Simple token format: base64(user_id:session_id:timestamp:hmac)
    let data = format!("{}:{}:{}", user_id, session_id, timestamp);
    
    // TODO: Implementasi HMAC yang proper
    // Untuk sekarang gunakan simple hash
    let token = base64_encode(&data);
    
    token
}

fn base64_encode(data: &str) -> String {
    use std::io::Write;
    let mut encoder = base64::write::EncoderStringWriter::new(&base64::engine::general_purpose::STANDARD);
    encoder.write_all(data.as_bytes()).unwrap();
    encoder.into_inner()
}
