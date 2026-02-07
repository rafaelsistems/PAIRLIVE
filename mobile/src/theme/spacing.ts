/**
 * Sistem Spacing PAIRLIVE
 * 
 * Ukuran spacing, radius, dan dimensi standar
 */

// Spacing dasar (kelipatan 4)
export const spacing = {
  xxs: 2,    // Sangat kecil
  xs: 4,     // Extra small
  sm: 8,     // Small
  md: 16,    // Medium (default)
  lg: 24,    // Large
  xl: 32,    // Extra large
  xxl: 48,   // Sangat besar
  xxxl: 64,  // Maksimum
} as const;

// Border radius
export const borderRadius = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  full: 9999, // Untuk membuat bulat sempurna
} as const;

// Ukuran ikon
export const iconSizes = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 32,
  xl: 40,
  xxl: 48,
} as const;

// Ukuran avatar
export const avatarSizes = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 56,
  xl: 80,
  xxl: 120,
} as const;

// Ukuran tombol
export const buttonSizes = {
  sm: {
    height: 36,
    paddingHorizontal: 16,
    fontSize: 14,
  },
  md: {
    height: 48,
    paddingHorizontal: 24,
    fontSize: 16,
  },
  lg: {
    height: 56,
    paddingHorizontal: 32,
    fontSize: 18,
  },
} as const;

// Ukuran input
export const inputSizes = {
  sm: {
    height: 40,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  md: {
    height: 48,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  lg: {
    height: 56,
    paddingHorizontal: 20,
    fontSize: 18,
  },
} as const;

// Shadow (bayangan)
export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  // Shadow khusus untuk glow
  glow: (color: string) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  }),
} as const;

// Hit slop untuk touchable (area sentuh)
export const hitSlop = {
  sm: { top: 8, bottom: 8, left: 8, right: 8 },
  md: { top: 12, bottom: 12, left: 12, right: 12 },
  lg: { top: 16, bottom: 16, left: 16, right: 16 },
} as const;
