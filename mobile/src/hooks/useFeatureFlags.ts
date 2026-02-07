/**
 * Hook untuk Feature Flags
 * 
 * Mengambil dan cache feature flags dari backend.
 * Digunakan untuk mengontrol fitur yang aktif di mobile app.
 */

import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import axios from 'axios';
import { API_BASE_URL } from '../constants/config';

interface FeatureFlagData {
  flags: Record<string, { enabled: boolean; description: string }>;
  isBetaUser: boolean;
}

/**
 * Fetch feature flags dari backend
 */
async function fetchFeatureFlags(token: string | null): Promise<FeatureFlagData> {
  if (!token) {
    return { flags: {}, isBetaUser: false };
  }

  try {
    const response = await axios.get(`${API_BASE_URL}/beta/flags`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.data;
  } catch {
    return { flags: {}, isBetaUser: false };
  }
}

/**
 * Hook utama untuk mengakses feature flags
 */
export function useFeatureFlags() {
  const token = useSelector((state: RootState) => state.auth.accessToken);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['featureFlags'],
    queryFn: () => fetchFeatureFlags(token),
    staleTime: 5 * 60 * 1000, // Cache 5 menit
    cacheTime: 10 * 60 * 1000,
    enabled: !!token,
    retry: 1,
  });

  const isEnabled = (flagName: string): boolean => {
    return data?.flags?.[flagName]?.enabled ?? false;
  };

  return {
    flags: data?.flags ?? {},
    isBetaUser: data?.isBetaUser ?? false,
    isEnabled,
    isLoading,
    refetch,
  };
}

/**
 * Hook untuk cek satu flag spesifik
 */
export function useFeatureFlag(flagName: string): boolean {
  const { isEnabled } = useFeatureFlags();
  return isEnabled(flagName);
}
