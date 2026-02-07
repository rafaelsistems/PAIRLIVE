/**
 * ELARA Service
 * 
 * Service untuk mengelola komunikasi real-time menggunakan ELARA Protocol.
 * ELARA lebih baik dari WebRTC karena:
 * - Graceful Degradation: Kualitas turun, koneksi tidak putus
 * - NAT Hostile Ready: Bekerja di balik firewall ketat
 * - Event-Driven: Lebih efisien dan responsif
 * 
 * Referensi: https://github.com/rafaelsistems/ELARA-Protocol
 */

import { config } from '../config';
import { redis, REDIS_KEYS } from '../config/redis';
import { nanoid } from 'nanoid';
import crypto from 'crypto';

// Tipe-tipe

export interface ElaraSessionConfig {
  sessionId: string;
  participants: string[];  // User IDs
  videoEnabled: boolean;
  audioEnabled: boolean;
  maxDuration: number;     // dalam detik
}

export interface ElaraSession {
  sessionId: string;
  participants: string[];
  status: 'waiting' | 'active' | 'ended';
  startTime?: number;
  endTime?: number;
  quality: number;         // 0-100
  transportType: 'direct' | 'stunAssisted' | 'turnRelay' | 'tcpFallback';
}

export interface ElaraToken {
  token: string;
  sessionId: string;
  userId: string;
  expiresAt: number;
}

export interface SignalingMessage {
  type: 'offer' | 'answer' | 'candidate' | 'ready' | 'bye';
  sessionId: string;
  from: string;
  to: string;
  payload: any;
}

// Konfigurasi STUN/TURN server
const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' },
  // TURN server (opsional, untuk relay)
  // { urls: 'turn:turn.pairlive.com:3478', username: 'user', credential: 'pass' },
];

/**
 * Buat sesi ELARA baru
 */
export async function createSession(
  participants: string[],
  options?: Partial<ElaraSessionConfig>
): Promise<ElaraSession> {
  const sessionId = nanoid(16);
  
  const session: ElaraSession = {
    sessionId,
    participants,
    status: 'waiting',
    quality: 100,
    transportType: 'direct',
  };
  
  // Simpan sesi di Redis
  await redis.setex(
    `${REDIS_KEYS.session}:${sessionId}`,
    options?.maxDuration || 3600, // Default 1 jam
    JSON.stringify(session)
  );
  
  // Simpan mapping user -> session
  for (const userId of participants) {
    await redis.set(
      `${REDIS_KEYS.session}:user:${userId}`,
      sessionId,
      'EX',
      options?.maxDuration || 3600
    );
  }
  
  console.log(`[ELARA] Sesi dibuat: ${sessionId} dengan ${participants.length} peserta`);
  
  return session;
}

/**
 * Generate token untuk bergabung ke sesi
 * 
 * Token digunakan untuk autentikasi P2P connection
 */
export function generateToken(
  sessionId: string,
  userId: string,
  expiresIn: number = 3600
): ElaraToken {
  const expiresAt = Math.floor(Date.now() / 1000) + expiresIn;
  
  // Data yang akan di-sign
  const data = JSON.stringify({
    sessionId,
    userId,
    expiresAt,
    nonce: crypto.randomBytes(16).toString('hex'),
  });
  
  // Sign dengan HMAC-SHA256
  const hmac = crypto.createHmac('sha256', config.jwt.secret);
  hmac.update(data);
  const signature = hmac.digest('hex');
  
  // Token format: base64(data).signature
  const token = Buffer.from(data).toString('base64') + '.' + signature;
  
  return {
    token,
    sessionId,
    userId,
    expiresAt,
  };
}

/**
 * Verifikasi token ELARA
 */
export function verifyToken(token: string): { valid: boolean; data?: any; error?: string } {
  try {
    const [dataBase64, signature] = token.split('.');
    
    if (!dataBase64 || !signature) {
      return { valid: false, error: 'Format token tidak valid' };
    }
    
    const data = Buffer.from(dataBase64, 'base64').toString('utf8');
    
    // Verifikasi signature
    const hmac = crypto.createHmac('sha256', config.jwt.secret);
    hmac.update(data);
    const expectedSignature = hmac.digest('hex');
    
    if (signature !== expectedSignature) {
      return { valid: false, error: 'Signature tidak valid' };
    }
    
    const parsed = JSON.parse(data);
    
    // Cek expired
    if (parsed.expiresAt < Math.floor(Date.now() / 1000)) {
      return { valid: false, error: 'Token sudah expired' };
    }
    
    return { valid: true, data: parsed };
  } catch (error) {
    return { valid: false, error: 'Gagal memverifikasi token' };
  }
}

/**
 * Dapatkan sesi berdasarkan ID
 */
export async function getSession(sessionId: string): Promise<ElaraSession | null> {
  const data = await redis.get(`${REDIS_KEYS.session}:${sessionId}`);
  
  if (!data) {
    return null;
  }
  
  return JSON.parse(data);
}

/**
 * Dapatkan sesi aktif user
 */
export async function getUserSession(userId: string): Promise<ElaraSession | null> {
  const sessionId = await redis.get(`${REDIS_KEYS.session}:user:${userId}`);
  
  if (!sessionId) {
    return null;
  }
  
  return getSession(sessionId);
}

/**
 * Update status sesi
 */
export async function updateSessionStatus(
  sessionId: string,
  status: 'waiting' | 'active' | 'ended'
): Promise<void> {
  const session = await getSession(sessionId);
  
  if (!session) {
    throw new Error('Sesi tidak ditemukan');
  }
  
  session.status = status;
  
  if (status === 'active' && !session.startTime) {
    session.startTime = Date.now();
  }
  
  if (status === 'ended') {
    session.endTime = Date.now();
  }
  
  await redis.set(
    `${REDIS_KEYS.session}:${sessionId}`,
    JSON.stringify(session)
  );
  
  console.log(`[ELARA] Status sesi ${sessionId}: ${status}`);
}

/**
 * Update kualitas sesi
 */
export async function updateSessionQuality(
  sessionId: string,
  quality: number,
  transportType: ElaraSession['transportType']
): Promise<void> {
  const session = await getSession(sessionId);
  
  if (!session) {
    throw new Error('Sesi tidak ditemukan');
  }
  
  session.quality = quality;
  session.transportType = transportType;
  
  await redis.set(
    `${REDIS_KEYS.session}:${sessionId}`,
    JSON.stringify(session)
  );
}

/**
 * Akhiri sesi
 */
export async function endSession(sessionId: string): Promise<void> {
  const session = await getSession(sessionId);
  
  if (!session) {
    return;
  }
  
  // Update status
  await updateSessionStatus(sessionId, 'ended');
  
  // Hapus mapping user -> session
  for (const userId of session.participants) {
    await redis.del(`${REDIS_KEYS.session}:user:${userId}`);
  }
  
  console.log(`[ELARA] Sesi diakhiri: ${sessionId}`);
}

/**
 * Dapatkan konfigurasi ICE servers
 */
export function getIceServers(): typeof ICE_SERVERS {
  return ICE_SERVERS;
}

/**
 * Simpan signaling message untuk diambil peer
 */
export async function storeSignalingMessage(message: SignalingMessage): Promise<void> {
  const key = `${REDIS_KEYS.session}:signaling:${message.sessionId}:${message.to}`;
  
  // Push ke list
  await redis.lpush(key, JSON.stringify(message));
  
  // Set TTL 60 detik
  await redis.expire(key, 60);
}

/**
 * Ambil signaling messages untuk user
 */
export async function getSignalingMessages(
  sessionId: string,
  userId: string
): Promise<SignalingMessage[]> {
  const key = `${REDIS_KEYS.session}:signaling:${sessionId}:${userId}`;
  
  // Pop semua messages
  const messages: SignalingMessage[] = [];
  let message: string | null;
  
  while ((message = await redis.rpop(key)) !== null) {
    messages.push(JSON.parse(message));
  }
  
  return messages;
}

// Export default object
export default {
  createSession,
  generateToken,
  verifyToken,
  getSession,
  getUserSession,
  updateSessionStatus,
  updateSessionQuality,
  endSession,
  getIceServers,
  storeSignalingMessage,
  getSignalingMessages,
};
