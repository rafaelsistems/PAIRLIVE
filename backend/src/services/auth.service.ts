/**
 * Auth Service
 * 
 * Mengelola logika autentikasi pengguna:
 * - Registrasi pengguna baru
 * - Login dan logout
 * - Refresh token
 * - Reset password
 */

import bcrypt from 'bcryptjs';
import { prisma } from '../config/database';
import { generateTokenPair, verifyRefreshToken, revokeRefreshToken, TokenPair } from './token.service';
import { v4 as uuidv4 } from 'uuid';
import { createLogger } from '../utils/logger';

const logger = createLogger('AuthService');

interface RegisterData {
  email: string;
  password: string;
  displayName: string;
  birthDate: Date;
  gender: 'male' | 'female' | 'other';
}

interface AuthResponse {
  user: {
    id: string;
    email: string;
    displayName: string;
    photoUrl: string | null;
  };
  tokens: TokenPair;
}

export class AuthService {
  /**
   * Registrasi pengguna baru
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    // Validasi umur (harus 18+)
    const age = this.calculateAge(data.birthDate);
    if (age < 18) {
      throw { code: 'VALIDATION_ERROR', message: 'Anda harus berusia minimal 18 tahun' };
    }

    // Cek apakah email sudah terdaftar
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (existingUser) {
      throw { code: 'EMAIL_EXISTS' };
    }

    // Hash password
    const passwordHash = await bcrypt.hash(data.password, 12);

    // Buat pengguna baru
    const user = await prisma.user.create({
      data: {
        id: uuidv4(),
        email: data.email.toLowerCase(),
        passwordHash,
        displayName: data.displayName,
        birthDate: data.birthDate,
        gender: data.gender,
        trustScore: 50, // Skor trust awal
        trustCategory: 'GOOD',
        coinBalance: 100, // Bonus selamat datang
        level: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // Generate token
    const tokens = await generateTokenPair({
      userId: user.id,
      email: user.email,
      displayName: user.displayName,
    });

    logger.info(`Pengguna baru terdaftar: ${user.id}`);

    return {
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        photoUrl: user.photoUrl,
      },
      tokens,
    };
  }

  /**
   * Login pengguna
   */
  async login(email: string, password: string, deviceId?: string): Promise<AuthResponse> {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      throw { code: 'INVALID_CREDENTIALS' };
    }

    // Cek apakah akun di-suspend
    if (user.trustCategory === 'SUSPENDED') {
      throw { code: 'ACCOUNT_SUSPENDED' };
    }

    // Verifikasi password
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      throw { code: 'INVALID_CREDENTIALS' };
    }

    // Update waktu login terakhir
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Generate token
    const tokens = await generateTokenPair({
      userId: user.id,
      email: user.email,
      displayName: user.displayName,
    });

    logger.info(`Pengguna login: ${user.id}`);

    return {
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        photoUrl: user.photoUrl,
      },
      tokens,
    };
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<{ tokens: TokenPair }> {
    const userId = await verifyRefreshToken(refreshToken);

    if (!userId) {
      throw { code: 'INVALID_TOKEN' };
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw { code: 'INVALID_TOKEN' };
    }

    // Generate token baru
    const tokens = await generateTokenPair({
      userId: user.id,
      email: user.email,
      displayName: user.displayName,
    });

    return { tokens };
  }

  /**
   * Logout pengguna
   */
  async logout(userId: string): Promise<void> {
    await revokeRefreshToken(userId);
    logger.info(`Pengguna logout: ${userId}`);
  }

  /**
   * Kirim email reset password
   */
  async forgotPassword(email: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      // Jangan beritahu jika email tidak ada (keamanan)
      return;
    }

    // Generate token reset
    const resetToken = uuidv4();
    const resetExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 jam

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: resetToken,
        passwordResetExpiry: resetExpiry,
      },
    });

    // TODO: Kirim email dengan link reset
    logger.info(`Reset password diminta untuk: ${user.id}`);
  }

  /**
   * Reset password dengan token
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: token,
        passwordResetExpiry: { gt: new Date() },
      },
    });

    if (!user) {
      throw { code: 'INVALID_TOKEN' };
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        passwordResetToken: null,
        passwordResetExpiry: null,
      },
    });

    // Cabut refresh token untuk paksa login ulang
    await revokeRefreshToken(user.id);

    logger.info(`Password direset untuk: ${user.id}`);
  }

  /**
   * Ubah password (pengguna sudah login)
   */
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw { code: 'NOT_FOUND' };
    }

    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) {
      throw { code: 'INVALID_PASSWORD' };
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    logger.info(`Password diubah untuk: ${userId}`);
  }

  /**
   * Hitung umur dari tanggal lahir
   */
  private calculateAge(birthDate: Date): number {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }
}
