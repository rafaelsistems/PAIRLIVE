/**
 * App Configuration Constants
 * 
 * Konfigurasi yang diambil dari environment variables
 * atau menggunakan default values.
 */

// API Configuration
export const API_BASE_URL = process.env.API_URL || 'http://localhost:3000/api/v1';
export const SOCKET_URL = process.env.SOCKET_URL || 'http://localhost:3000';

// Agora Configuration
export const AGORA_APP_ID = process.env.AGORA_APP_ID || '';

// App Info
export const APP_VERSION = '1.0.0';
export const APP_BUILD = '1';

// Timeouts
export const API_TIMEOUT = 15000; // 15 seconds
export const SOCKET_RECONNECT_DELAY = 3000; // 3 seconds

// Feature defaults
export const DEFAULT_MATCHING_TIMEOUT = 60000; // 60 seconds
export const SKIP_GRACE_PERIOD = 30000; // 30 seconds
export const MIN_SESSION_DURATION = 30; // 30 seconds

// Beta
export const IS_BETA = process.env.BETA_MODE === 'true';
