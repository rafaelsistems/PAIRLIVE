/**
 * ELARA Module Bridge
 * 
 * Bridge TypeScript untuk ELARA Protocol native module.
 * Menyediakan API untuk komunikasi real-time yang lebih baik dari WebRTC.
 * 
 * Referensi: https://github.com/rafaelsistems/ELARA-Protocol
 */

import { NativeModules, NativeEventEmitter, Platform } from 'react-native';

const { ElaraModule: NativeElara } = NativeModules;

// Event emitter untuk menerima event dari native
const elaraEmitter = new NativeEventEmitter(NativeElara);

// Tipe-tipe

export interface ElaraConfig {
  stunServers?: string[];
  turnServers?: string[];
  videoEnabled?: boolean;
  audioEnabled?: boolean;
  maxVideoBitrate?: number;
  maxAudioBitrate?: number;
}

export interface SessionStats {
  quality: number;        // 0-100
  latencyMs: number;
  packetLoss: number;
  bandwidthKbps: number;
  duration: number;       // dalam detik
  transportType: string;  // 'direct' | 'stunAssisted' | 'turnRelay' | 'tcpFallback'
}

export type ConnectionStatus = 
  | 'disconnected' 
  | 'connecting' 
  | 'connected' 
  | 'degraded' 
  | 'reconnecting';

export type QualityLevel = 
  | 'high'      // 1080p
  | 'medium'    // 720p
  | 'low'       // 480p
  | 'veryLow'   // 360p
  | 'audioOnly';

// Event listeners
type ElaraEventCallback = (data: any) => void;

const eventListeners: Map<string, Set<ElaraEventCallback>> = new Map();

/**
 * Tambah event listener
 */
export function addEventListener(
  event: string, 
  callback: ElaraEventCallback
): () => void {
  if (!eventListeners.has(event)) {
    eventListeners.set(event, new Set());
    
    // Subscribe ke native event
    elaraEmitter.addListener(`elara:${event}`, (data) => {
      const listeners = eventListeners.get(event);
      listeners?.forEach(cb => cb(data));
    });
  }
  
  eventListeners.get(event)!.add(callback);
  
  // Return unsubscribe function
  return () => {
    eventListeners.get(event)?.delete(callback);
  };
}

/**
 * Inisialisasi ELARA node
 */
export async function initialize(config?: ElaraConfig): Promise<{ nodeId: string }> {
  const defaultConfig: ElaraConfig = {
    stunServers: ['stun:stun.l.google.com:19302'],
    turnServers: [],
    videoEnabled: true,
    audioEnabled: true,
    maxVideoBitrate: 2500,
    maxAudioBitrate: 128,
    ...config,
  };
  
  return NativeElara.initialize(defaultConfig);
}

/**
 * Buat sesi baru
 */
export async function createSession(
  sessionId: string, 
  peerId: string
): Promise<{ sessionId: string }> {
  return NativeElara.createSession(sessionId, peerId);
}

/**
 * Hubungkan ke sesi
 */
export async function connectSession(sessionId: string): Promise<boolean> {
  return NativeElara.connectSession(sessionId);
}

/**
 * Toggle video
 */
export async function toggleVideo(sessionId: string): Promise<boolean> {
  return NativeElara.toggleVideo(sessionId);
}

/**
 * Toggle audio
 */
export async function toggleAudio(sessionId: string): Promise<boolean> {
  return NativeElara.toggleAudio(sessionId);
}

/**
 * Kirim pesan
 */
export async function sendMessage(
  sessionId: string, 
  message: string
): Promise<boolean> {
  return NativeElara.sendMessage(sessionId, message);
}

/**
 * Dapatkan statistik sesi
 */
export async function getSessionStats(sessionId: string): Promise<SessionStats> {
  return NativeElara.getSessionStats(sessionId);
}

/**
 * Tutup sesi
 */
export async function closeSession(sessionId: string): Promise<boolean> {
  return NativeElara.closeSession(sessionId);
}

/**
 * Shutdown ELARA node
 */
export async function shutdown(): Promise<boolean> {
  return NativeElara.shutdown();
}

/**
 * Helper: Konversi quality score ke level
 */
export function qualityToLevel(quality: number): QualityLevel {
  if (quality >= 90) return 'high';
  if (quality >= 70) return 'medium';
  if (quality >= 40) return 'low';
  if (quality >= 20) return 'veryLow';
  return 'audioOnly';
}

/**
 * Helper: Dapatkan deskripsi kualitas dalam Bahasa Indonesia
 */
export function getQualityDescription(quality: number): string {
  const level = qualityToLevel(quality);
  switch (level) {
    case 'high': return 'Kualitas Tinggi (1080p)';
    case 'medium': return 'Kualitas Sedang (720p)';
    case 'low': return 'Kualitas Rendah (480p)';
    case 'veryLow': return 'Kualitas Sangat Rendah (360p)';
    case 'audioOnly': return 'Audio Saja';
  }
}

// Export default object
export default {
  initialize,
  createSession,
  connectSession,
  toggleVideo,
  toggleAudio,
  sendMessage,
  getSessionStats,
  closeSession,
  shutdown,
  addEventListener,
  qualityToLevel,
  getQualityDescription,
};
