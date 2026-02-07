/**
 * Konfigurasi Aplikasi
 * 
 * File ini berisi semua konfigurasi yang diperlukan aplikasi.
 * Semua nilai diambil dari environment variables dengan fallback default.
 */

import { z } from 'zod';

// Skema validasi untuk environment variables
const envSchema = z.object({
  // Server
  PORT: z.string().default('3000'),
  HOST: z.string().default('0.0.0.0'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  // Database
  DATABASE_URL: z.string().default('postgresql://postgres:postgres@localhost:5432/pairlive'),
  
  // Redis
  REDIS_URL: z.string().default('redis://localhost:6379'),
  
  // JWT
  JWT_SECRET: z.string().default('super-secret-key-change-in-production'),
  JWT_ACCESS_EXPIRES: z.string().default('15m'),
  JWT_REFRESH_EXPIRES: z.string().default('7d'),
  
  // ELARA Protocol
  ELARA_STUN_SERVERS: z.string().default('stun:stun.l.google.com:19302,stun:stun1.l.google.com:19302'),
  ELARA_TURN_SERVER: z.string().optional(),
  ELARA_TURN_USERNAME: z.string().optional(),
  ELARA_TURN_CREDENTIAL: z.string().optional(),
  ELARA_MAX_SESSION_DURATION: z.string().default('3600'), // 1 jam dalam detik
  
  // Email (Nodemailer)
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().default('587'),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().default('noreply@pairlive.com'),
  
  // Storage
  STORAGE_TYPE: z.enum(['local', 's3']).default('local'),
  STORAGE_PATH: z.string().default('./uploads'),
  AWS_REGION: z.string().optional(),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_S3_BUCKET: z.string().optional(),
  
  // CORS
  CORS_ORIGIN: z.string().default('*'),
  
  // Rate Limiting
  RATE_LIMIT_MAX: z.string().default('100'),
  RATE_LIMIT_WINDOW: z.string().default('60000'), // dalam ms
});

// Parse dan validasi environment
const env = envSchema.parse(process.env);

/**
 * Objek konfigurasi utama
 */
export const config = {
  // Server
  server: {
    port: parseInt(env.PORT, 10),
    host: env.HOST,
    env: env.NODE_ENV,
    isDev: env.NODE_ENV === 'development',
    isProd: env.NODE_ENV === 'production',
  },
  
  // Database
  database: {
    url: env.DATABASE_URL,
  },
  
  // Redis
  redis: {
    url: env.REDIS_URL,
  },
  
  // JWT
  jwt: {
    secret: env.JWT_SECRET,
    accessExpires: env.JWT_ACCESS_EXPIRES,
    refreshExpires: env.JWT_REFRESH_EXPIRES,
  },
  
  // ELARA Protocol - Komunikasi Real-time Native
  elara: {
    // STUN servers untuk NAT traversal
    stunServers: env.ELARA_STUN_SERVERS.split(',').map(s => ({ urls: s.trim() })),
    
    // TURN server untuk relay (opsional)
    turnServer: env.ELARA_TURN_SERVER ? {
      urls: env.ELARA_TURN_SERVER,
      username: env.ELARA_TURN_USERNAME,
      credential: env.ELARA_TURN_CREDENTIAL,
    } : null,
    
    // Durasi maksimal sesi (detik)
    maxSessionDuration: parseInt(env.ELARA_MAX_SESSION_DURATION, 10),
  },
  
  // Email
  email: {
    host: env.SMTP_HOST,
    port: parseInt(env.SMTP_PORT, 10),
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
    from: env.SMTP_FROM,
  },
  
  // Storage
  storage: {
    type: env.STORAGE_TYPE,
    path: env.STORAGE_PATH,
    s3: {
      region: env.AWS_REGION,
      accessKeyId: env.AWS_ACCESS_KEY_ID,
      secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
      bucket: env.AWS_S3_BUCKET,
    },
  },
  
  // CORS
  cors: {
    origin: env.CORS_ORIGIN === '*' ? true : env.CORS_ORIGIN.split(','),
  },
  
  // Rate Limiting
  rateLimit: {
    max: parseInt(env.RATE_LIMIT_MAX, 10),
    window: parseInt(env.RATE_LIMIT_WINDOW, 10),
  },
};

export default config;
