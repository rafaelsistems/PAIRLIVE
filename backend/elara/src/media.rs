//! Modul Media ELARA
//! 
//! Mengelola stream audio dan video menggunakan codec native.

use napi::bindgen_prelude::*;
use napi_derive::napi;

/// Konfigurasi video
#[napi(object)]
#[derive(Debug, Clone)]
pub struct VideoConfig {
    /// Lebar frame
    pub width: u32,
    /// Tinggi frame
    pub height: u32,
    /// Frame rate
    pub fps: u32,
    /// Bitrate (kbps)
    pub bitrate: u32,
    /// Codec (h264, h265, vp8, vp9, av1)
    pub codec: String,
}

impl Default for VideoConfig {
    fn default() -> Self {
        Self {
            width: 1280,
            height: 720,
            fps: 30,
            bitrate: 2500,
            codec: "h264".to_string(),
        }
    }
}

/// Konfigurasi audio
#[napi(object)]
#[derive(Debug, Clone)]
pub struct AudioConfig {
    /// Sample rate (Hz)
    pub sample_rate: u32,
    /// Channels (1=mono, 2=stereo)
    pub channels: u8,
    /// Bitrate (kbps)
    pub bitrate: u32,
    /// Codec (opus, aac)
    pub codec: String,
}

impl Default for AudioConfig {
    fn default() -> Self {
        Self {
            sample_rate: 48000,
            channels: 1,
            bitrate: 64,
            codec: "opus".to_string(),
        }
    }
}

/// Statistik media
#[napi(object)]
#[derive(Debug, Clone)]
pub struct MediaStats {
    /// Bytes terkirim
    pub bytes_sent: u64,
    /// Bytes diterima
    pub bytes_received: u64,
    /// Packets terkirim
    pub packets_sent: u64,
    /// Packets diterima
    pub packets_received: u64,
    /// Packets hilang
    pub packets_lost: u64,
    /// Jitter (ms)
    pub jitter_ms: f32,
    /// Round-trip time (ms)
    pub rtt_ms: u32,
}

/// Level kualitas video adaptif
#[napi]
#[derive(Debug, Clone, PartialEq)]
pub enum VideoQualityLevel {
    /// 1080p atau lebih
    High,
    /// 720p
    Medium,
    /// 480p
    Low,
    /// 360p atau kurang
    VeryLow,
    /// Audio only
    AudioOnly,
}

/// Media Engine - Mengelola encoding/decoding media
#[napi]
pub struct MediaEngine {
    video_config: VideoConfig,
    audio_config: AudioConfig,
    current_quality: VideoQualityLevel,
}

#[napi]
impl MediaEngine {
    /// Buat media engine baru
    #[napi(constructor)]
    pub fn new(video_config: Option<VideoConfig>, audio_config: Option<AudioConfig>) -> Self {
        Self {
            video_config: video_config.unwrap_or_default(),
            audio_config: audio_config.unwrap_or_default(),
            current_quality: VideoQualityLevel::High,
        }
    }

    /// Dapatkan konfigurasi video saat ini
    #[napi]
    pub fn get_video_config(&self) -> VideoConfig {
        self.video_config.clone()
    }

    /// Dapatkan konfigurasi audio saat ini
    #[napi]
    pub fn get_audio_config(&self) -> AudioConfig {
        self.audio_config.clone()
    }

    /// Dapatkan level kualitas saat ini
    #[napi]
    pub fn get_quality_level(&self) -> VideoQualityLevel {
        self.current_quality.clone()
    }

    /// Adaptasi kualitas berdasarkan kondisi jaringan
    /// 
    /// ELARA secara otomatis menurunkan kualitas saat jaringan buruk
    /// tapi TIDAK PERNAH memutus koneksi (graceful degradation)
    #[napi]
    pub fn adapt_quality(&mut self, bandwidth_kbps: u32, packet_loss: f32) -> VideoQualityLevel {
        // Algoritma adaptasi kualitas ELARA
        // "Experience Degrades, Never Collapses"
        
        self.current_quality = if bandwidth_kbps >= 2500 && packet_loss < 1.0 {
            // Kondisi optimal
            self.video_config.width = 1920;
            self.video_config.height = 1080;
            self.video_config.fps = 30;
            self.video_config.bitrate = 3000;
            VideoQualityLevel::High
        } else if bandwidth_kbps >= 1500 && packet_loss < 3.0 {
            // Kondisi baik
            self.video_config.width = 1280;
            self.video_config.height = 720;
            self.video_config.fps = 30;
            self.video_config.bitrate = 2000;
            VideoQualityLevel::Medium
        } else if bandwidth_kbps >= 800 && packet_loss < 5.0 {
            // Kondisi cukup
            self.video_config.width = 854;
            self.video_config.height = 480;
            self.video_config.fps = 24;
            self.video_config.bitrate = 1000;
            VideoQualityLevel::Low
        } else if bandwidth_kbps >= 300 {
            // Kondisi buruk - turunkan kualitas drastis
            self.video_config.width = 640;
            self.video_config.height = 360;
            self.video_config.fps = 15;
            self.video_config.bitrate = 500;
            VideoQualityLevel::VeryLow
        } else {
            // Kondisi sangat buruk - audio only
            // PENTING: Tetap terhubung, hanya audio
            self.video_config.bitrate = 0;
            VideoQualityLevel::AudioOnly
        };

        self.current_quality.clone()
    }

    /// Set kualitas manual
    #[napi]
    pub fn set_quality(&mut self, level: VideoQualityLevel) {
        self.current_quality = level.clone();
        
        match level {
            VideoQualityLevel::High => {
                self.video_config.width = 1920;
                self.video_config.height = 1080;
                self.video_config.fps = 30;
                self.video_config.bitrate = 3000;
            }
            VideoQualityLevel::Medium => {
                self.video_config.width = 1280;
                self.video_config.height = 720;
                self.video_config.fps = 30;
                self.video_config.bitrate = 2000;
            }
            VideoQualityLevel::Low => {
                self.video_config.width = 854;
                self.video_config.height = 480;
                self.video_config.fps = 24;
                self.video_config.bitrate = 1000;
            }
            VideoQualityLevel::VeryLow => {
                self.video_config.width = 640;
                self.video_config.height = 360;
                self.video_config.fps = 15;
                self.video_config.bitrate = 500;
            }
            VideoQualityLevel::AudioOnly => {
                self.video_config.bitrate = 0;
            }
        }
    }
}
