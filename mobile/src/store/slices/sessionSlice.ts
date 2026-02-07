/**
 * Session Slice
 * 
 * Mengelola state sesi live yang sedang berlangsung
 * - Informasi partner
 * - Konfigurasi Agora
 * - Status video/audio
 * - Durasi sesi
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Partner {
  id: string;
  displayName: string;
  photoUrl: string | null;
  level: number;
}

interface AgoraConfig {
  channelId: string;
  token: string;
  uid: number;
}

interface SessionState {
  sessionId: string | null;
  partner: Partner | null;
  agoraConfig: AgoraConfig | null;
  
  // Status media
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  isPartnerVideoEnabled: boolean;
  isPartnerAudioEnabled: boolean;
  
  // Durasi dan status
  startTime: number | null;
  duration: number;
  
  // Status skip
  canSkip: boolean;
  skipCooldownEnds: number | null;
  
  // Status sesi
  isActive: boolean;
  isConnecting: boolean;
  error: string | null;
}

const initialState: SessionState = {
  sessionId: null,
  partner: null,
  agoraConfig: null,
  
  isVideoEnabled: true,
  isAudioEnabled: true,
  isPartnerVideoEnabled: true,
  isPartnerAudioEnabled: true,
  
  startTime: null,
  duration: 0,
  
  canSkip: true,
  skipCooldownEnds: null,
  
  isActive: false,
  isConnecting: false,
  error: null,
};

const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    // Mulai koneksi sesi
    startConnecting: (state) => {
      state.isConnecting = true;
      state.error = null;
    },

    // Sesi dimulai
    sessionStarted: (
      state,
      action: PayloadAction<{
        sessionId: string;
        partner: Partner;
        agoraConfig: AgoraConfig;
      }>
    ) => {
      state.sessionId = action.payload.sessionId;
      state.partner = action.payload.partner;
      state.agoraConfig = action.payload.agoraConfig;
      state.startTime = Date.now();
      state.isActive = true;
      state.isConnecting = false;
    },

    // Update durasi
    updateDuration: (state, action: PayloadAction<number>) => {
      state.duration = action.payload;
    },

    // Toggle video sendiri
    toggleVideo: (state) => {
      state.isVideoEnabled = !state.isVideoEnabled;
    },

    // Toggle audio sendiri
    toggleAudio: (state) => {
      state.isAudioEnabled = !state.isAudioEnabled;
    },

    // Update status media partner
    updatePartnerMedia: (
      state,
      action: PayloadAction<{ video?: boolean; audio?: boolean }>
    ) => {
      if (action.payload.video !== undefined) {
        state.isPartnerVideoEnabled = action.payload.video;
      }
      if (action.payload.audio !== undefined) {
        state.isPartnerAudioEnabled = action.payload.audio;
      }
    },

    // Update status skip
    updateSkipStatus: (
      state,
      action: PayloadAction<{ canSkip: boolean; cooldownEnds?: number | null }>
    ) => {
      state.canSkip = action.payload.canSkip;
      state.skipCooldownEnds = action.payload.cooldownEnds ?? null;
    },

    // Sesi berakhir
    sessionEnded: (state) => {
      // Simpan durasi sebelum reset
      const finalDuration = state.duration;
      
      // Reset ke initial state tapi pertahankan durasi untuk feedback
      return {
        ...initialState,
        duration: finalDuration,
      };
    },

    // Error sesi
    sessionError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isConnecting = false;
    },

    // Reset sesi sepenuhnya
    resetSession: () => initialState,
  },
});

export const {
  startConnecting,
  sessionStarted,
  updateDuration,
  toggleVideo,
  toggleAudio,
  updatePartnerMedia,
  updateSkipStatus,
  sessionEnded,
  sessionError,
  resetSession,
} = sessionSlice.actions;

export default sessionSlice.reducer;
