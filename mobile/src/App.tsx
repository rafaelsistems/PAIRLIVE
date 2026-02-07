/**
 * PAIRLIVE Mobile App
 * Satu Acak. Satu Live. Satu Koneksi.
 * 
 * Komponen root aplikasi dengan semua provider yang diperlukan
 */

import React from 'react';
import { StatusBar, LogBox } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { store, persistor } from './store';
import { AppNavigator } from './navigation/AppNavigator';
import { colors } from './theme';

// Abaikan warning tertentu di development
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
]);

// Konfigurasi React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 menit
      cacheTime: 10 * 60 * 1000, // 10 menit
    },
  },
});

function App(): React.JSX.Element {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <QueryClientProvider client={queryClient}>
            <SafeAreaProvider>
              <StatusBar
                barStyle="light-content"
                backgroundColor={colors.background.primary}
                translucent
              />
              <AppNavigator />
            </SafeAreaProvider>
          </QueryClientProvider>
        </PersistGate>
      </Provider>
    </GestureHandlerRootView>
  );
}

export default App;
