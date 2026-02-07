/**
 * User Slice
 * 
 * Mengelola data pengguna saat ini
 * - Informasi profil
 * - Kategori trust score
 * - Saldo koin
 * - Statistik
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  photoUrl: string | null;
  bio: string | null;
  interests: string[];
  gender: string;
  birthDate: string;
}

interface UserStats {
  totalSessions: number;
  totalMinutes: number;
  averageRating: number;
  level: number;
  friendsCount: number;
}

interface UserState {
  profile: UserProfile | null;
  trustCategory: 'PREMIUM' | 'GOOD' | 'WARNING' | 'RESTRICTED' | 'SUSPENDED';
  coinBalance: number;
  stats: UserStats | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: UserState = {
  profile: null,
  trustCategory: 'GOOD',
  coinBalance: 0,
  stats: null,
  isLoading: false,
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // Mulai loading profil
    fetchProfileStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },

    // Profil berhasil dimuat
    fetchProfileSuccess: (
      state,
      action: PayloadAction<{
        profile: UserProfile;
        trustCategory: UserState['trustCategory'];
        coinBalance: number;
        stats: UserStats;
      }>
    ) => {
      state.profile = action.payload.profile;
      state.trustCategory = action.payload.trustCategory;
      state.coinBalance = action.payload.coinBalance;
      state.stats = action.payload.stats;
      state.isLoading = false;
    },

    // Gagal memuat profil
    fetchProfileFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Update profil
    updateProfile: (state, action: PayloadAction<Partial<UserProfile>>) => {
      if (state.profile) {
        state.profile = { ...state.profile, ...action.payload };
      }
    },

    // Update saldo koin
    updateCoinBalance: (state, action: PayloadAction<number>) => {
      state.coinBalance = action.payload;
    },

    // Tambah koin
    addCoins: (state, action: PayloadAction<number>) => {
      state.coinBalance += action.payload;
    },

    // Kurangi koin
    deductCoins: (state, action: PayloadAction<number>) => {
      state.coinBalance = Math.max(0, state.coinBalance - action.payload);
    },

    // Update statistik
    updateStats: (state, action: PayloadAction<Partial<UserStats>>) => {
      if (state.stats) {
        state.stats = { ...state.stats, ...action.payload };
      }
    },

    // Reset state saat logout
    clearUser: () => initialState,
  },
});

export const {
  fetchProfileStart,
  fetchProfileSuccess,
  fetchProfileFailure,
  updateProfile,
  updateCoinBalance,
  addCoins,
  deductCoins,
  updateStats,
  clearUser,
} = userSlice.actions;

export default userSlice.reducer;
