/**
 * Matching Slice
 * 
 * Mengelola state proses pencarian match
 * - Status pencarian (idle, searching, found, connecting)
 * - Posisi dalam antrian
 * - Data match yang ditemukan
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type MatchingStatus = 'idle' | 'searching' | 'found' | 'connecting';

interface MatchData {
  sessionId: string;
  partnerId: string;
  partnerName: string;
  partnerPhoto: string | null;
  partnerLevel: number;
}

interface MatchingState {
  status: MatchingStatus;
  queuePosition: number | null;
  estimatedWait: number | null; // dalam detik
  matchData: MatchData | null;
  error: string | null;
}

const initialState: MatchingState = {
  status: 'idle',
  queuePosition: null,
  estimatedWait: null,
  matchData: null,
  error: null,
};

const matchingSlice = createSlice({
  name: 'matching',
  initialState,
  reducers: {
    // Mulai pencarian
    startSearching: (state) => {
      state.status = 'searching';
      state.error = null;
      state.matchData = null;
    },

    // Update posisi antrian
    updateQueuePosition: (
      state,
      action: PayloadAction<{ position: number; estimatedWait: number }>
    ) => {
      state.queuePosition = action.payload.position;
      state.estimatedWait = action.payload.estimatedWait;
    },

    // Match ditemukan
    matchFound: (state, action: PayloadAction<MatchData>) => {
      state.status = 'found';
      state.matchData = action.payload;
    },

    // Mulai koneksi ke sesi
    startConnecting: (state) => {
      state.status = 'connecting';
    },

    // Batal pencarian
    cancelSearching: (state) => {
      state.status = 'idle';
      state.queuePosition = null;
      state.estimatedWait = null;
      state.matchData = null;
    },

    // Error pencarian
    matchingError: (state, action: PayloadAction<string>) => {
      state.status = 'idle';
      state.error = action.payload;
    },

    // Reset ke state awal
    resetMatching: () => initialState,
  },
});

export const {
  startSearching,
  updateQueuePosition,
  matchFound,
  startConnecting,
  cancelSearching,
  matchingError,
  resetMatching,
} = matchingSlice.actions;

export default matchingSlice.reducer;
