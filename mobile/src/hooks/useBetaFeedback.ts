/**
 * Hook untuk Beta Feedback
 * 
 * Mengirim feedback dari beta testers ke backend.
 */

import { useMutation } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { Platform } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import { RootState } from '../store';
import axios from 'axios';
import { API_BASE_URL, APP_VERSION } from '../constants/config';

type FeedbackType = 'bug' | 'feature_request' | 'general' | 'session_quality' | 'ui_ux';

interface SubmitFeedbackParams {
  type: FeedbackType;
  title: string;
  description: string;
  sessionId?: string;
  tags?: string[];
}

async function submitFeedback(
  params: SubmitFeedbackParams,
  token: string | null,
): Promise<{ id: string }> {
  if (!token) throw new Error('Not authenticated');

  const deviceInfo = {
    platform: Platform.OS,
    osVersion: Platform.Version.toString(),
    appVersion: APP_VERSION,
    deviceModel: await DeviceInfo.getModel(),
  };

  const response = await axios.post(
    `${API_BASE_URL}/beta/feedback`,
    { ...params, deviceInfo },
    { headers: { Authorization: `Bearer ${token}` } },
  );

  return response.data.data;
}

/**
 * Hook untuk mengirim beta feedback
 */
export function useBetaFeedback() {
  const token = useSelector((state: RootState) => state.auth.accessToken);

  const mutation = useMutation({
    mutationFn: (params: SubmitFeedbackParams) => submitFeedback(params, token),
  });

  return {
    submit: mutation.mutate,
    submitAsync: mutation.mutateAsync,
    isSubmitting: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
    reset: mutation.reset,
  };
}
