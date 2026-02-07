/**
 * ELARA Video View Component
 * 
 * Komponen React Native untuk menampilkan video stream dari ELARA.
 */

import React from 'react';
import {
  requireNativeComponent,
  ViewStyle,
  StyleSheet,
  View,
} from 'react-native';

// Native component
const NativeElaraVideoView = requireNativeComponent('ElaraVideoView');

interface ElaraVideoViewProps {
  /** ID sesi */
  sessionId: string;
  /** Apakah video lokal (kamera sendiri) */
  isLocal?: boolean;
  /** Mirror video (biasanya untuk video lokal) */
  mirror?: boolean;
  /** Object fit mode */
  objectFit?: 'cover' | 'contain' | 'fill';
  /** Style tambahan */
  style?: ViewStyle;
}

/**
 * Komponen untuk menampilkan video stream ELARA
 * 
 * @example
 * ```tsx
 * // Video lokal (kamera sendiri)
 * <ElaraVideoView
 *   sessionId={sessionId}
 *   isLocal={true}
 *   mirror={true}
 *   style={styles.localVideo}
 * />
 * 
 * // Video remote (partner)
 * <ElaraVideoView
 *   sessionId={sessionId}
 *   isLocal={false}
 *   style={styles.remoteVideo}
 * />
 * ```
 */
export function ElaraVideoView({
  sessionId,
  isLocal = false,
  mirror = false,
  objectFit = 'cover',
  style,
}: ElaraVideoViewProps) {
  return (
    <View style={[styles.container, style]}>
      <NativeElaraVideoView
        style={StyleSheet.absoluteFill}
        sessionId={sessionId}
        isLocal={isLocal}
        mirror={mirror}
        objectFit={objectFit}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: '#000',
  },
});

export default ElaraVideoView;
