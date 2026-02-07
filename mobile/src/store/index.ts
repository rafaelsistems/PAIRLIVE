/**
 * Konfigurasi Redux Store
 * 
 * Setup Redux dengan persist menggunakan MMKV untuk penyimpanan cepat
 */

import { configureStore, combineReducers } from '@reduxjs/toolkit';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import { MMKV } from 'react-native-mmkv';

// Import slices
import authReducer from './slices/authSlice';
import userReducer from './slices/userSlice';
import sessionReducer from './slices/sessionSlice';
import matchingReducer from './slices/matchingSlice';

// Setup MMKV storage (lebih cepat dari AsyncStorage)
const storage = new MMKV();

const mmkvStorage = {
  setItem: (key: string, value: string) => {
    storage.set(key, value);
    return Promise.resolve(true);
  },
  getItem: (key: string) => {
    const value = storage.getString(key);
    return Promise.resolve(value ?? null);
  },
  removeItem: (key: string) => {
    storage.delete(key);
    return Promise.resolve();
  },
};

// Konfigurasi persist
const persistConfig = {
  key: 'root',
  version: 1,
  storage: mmkvStorage,
  // Hanya persist auth dan user, session & matching tidak perlu
  whitelist: ['auth', 'user'],
};

// Gabungkan semua reducer
const rootReducer = combineReducers({
  auth: authReducer,
  user: userReducer,
  session: sessionReducer,
  matching: matchingReducer,
});

// Buat persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Buat store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Abaikan action dari redux-persist
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

// Buat persistor
export const persistor = persistStore(store);

// Export types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
