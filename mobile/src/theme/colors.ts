/**
 * Palet Warna PAIRLIVE
 * 
 * Skema warna gelap dengan aksen ungu dan cyan untuk tampilan modern
 */

export const colors = {
  // Warna utama
  primary: {
    main: '#6C5CE7',      // Ungu utama
    light: '#8B7CF7',     // Ungu terang
    dark: '#5541D7',      // Ungu gelap
  },

  // Warna sekunder
  secondary: {
    main: '#00D9FF',      // Cyan
    light: '#5CE8FF',     // Cyan terang
    dark: '#00B8D9',      // Cyan gelap
  },

  // Warna latar belakang
  background: {
    primary: '#0D0D1A',   // Latar utama
    secondary: '#1A1A2E', // Card/surface
    tertiary: '#252542',  // Elevated surface
  },

  // Warna teks
  text: {
    primary: '#FFFFFF',   // Teks utama
    secondary: '#B0B0C3', // Teks sekunder
    tertiary: '#6B6B80',  // Teks tersier
    inverse: '#0D0D1A',   // Teks di latar terang
  },

  // Warna semantik
  semantic: {
    success: '#00D26A',   // Hijau sukses
    warning: '#FFB800',   // Kuning peringatan
    error: '#FF4757',     // Merah error
    info: '#00D9FF',      // Info (sama dengan secondary)
  },

  // Warna live/aktif
  live: {
    main: '#FF6B6B',      // Merah live
    glow: '#FF8E8E',      // Glow live
  },

  // Warna overlay
  overlay: {
    light: 'rgba(255, 255, 255, 0.1)',
    medium: 'rgba(0, 0, 0, 0.5)',
    dark: 'rgba(0, 0, 0, 0.8)',
  },

  // Warna border
  border: {
    primary: 'rgba(255, 255, 255, 0.1)',
    secondary: 'rgba(255, 255, 255, 0.05)',
    focus: '#6C5CE7',
  },

  // Warna khusus
  special: {
    gold: '#FFD700',      // Emas untuk premium
    silver: '#C0C0C0',    // Perak
    bronze: '#CD7F32',    // Perunggu
  },
} as const;

// Gradient untuk LinearGradient
export const gradients = {
  // Gradient utama
  primary: ['#6C5CE7', '#8B7CF7'],
  
  // Gradient sekunder
  secondary: ['#00D9FF', '#00B8D9'],
  
  // Gradient live
  live: ['#FF6B6B', '#FF8E8E'],
  
  // Gradient glow ungu-cyan
  glow: ['#6C5CE7', '#00D9FF'],
  
  // Gradient latar belakang
  background: ['#0D0D1A', '#1A1A2E'],
  
  // Gradient card
  card: ['#1A1A2E', '#252542'],
  
  // Gradient sukses
  success: ['#00D26A', '#00F080'],
  
  // Gradient premium/emas
  gold: ['#FFD700', '#FFA500'],
} as const;

// Fungsi helper untuk opacity
export const withOpacity = (color: string, opacity: number): string => {
  // Konversi hex ke rgba
  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};
