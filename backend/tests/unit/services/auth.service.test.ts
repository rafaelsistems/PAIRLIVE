/**
 * Tests untuk Auth Service
 */

import '../../../tests/mocks/prisma';
import '../../../tests/mocks/redis';
import { prismaMock } from '../../mocks/prisma';
import bcrypt from 'bcryptjs';

// Mock bcrypt
jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashed_password'),
  compare: jest.fn(),
}));

// Mock token service
jest.mock('../../../src/services/token.service', () => ({
  generateTokenPair: jest.fn().mockResolvedValue({
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
    expiresIn: 900,
  }),
  verifyRefreshToken: jest.fn(),
  revokeRefreshToken: jest.fn(),
}));

import { AuthService } from '../../../src/services/auth.service';

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    authService = new AuthService();
    jest.clearAllMocks();
  });

  describe('register', () => {
    const validRegisterData = {
      email: 'test@example.com',
      password: 'SecurePass123!',
      displayName: 'Test User',
      birthDate: new Date('2000-01-01'),
      gender: 'male' as const,
    };

    it('should register a new user successfully', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);
      prismaMock.user.create.mockResolvedValue({
        id: 'user-123',
        email: 'test@example.com',
        displayName: 'Test User',
        photoUrl: null,
        passwordHash: 'hashed_password',
        bio: null,
        interests: [],
        gender: 'male',
        birthDate: new Date('2000-01-01'),
        trustScore: 50,
        trustCategory: 'GOOD',
        level: 1,
        coinBalance: 100,
        totalCoinsEarned: 0,
        totalCoinsSpent: 0,
        totalSessions: 0,
        totalMinutes: 0,
        averageRating: 0,
        isPremium: false,
        premiumUntil: null,
        passwordResetToken: null,
        passwordResetExpiry: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLoginAt: null,
        deletedAt: null,
      });

      const result = await authService.register(validRegisterData);

      expect(result.user.email).toBe('test@example.com');
      expect(result.user.displayName).toBe('Test User');
      expect(result.tokens.accessToken).toBe('mock-access-token');
      expect(prismaMock.user.create).toHaveBeenCalledTimes(1);
    });

    it('should throw error if email already exists', async () => {
      prismaMock.user.findUnique.mockResolvedValue({ id: 'existing-user' });

      await expect(authService.register(validRegisterData)).rejects.toEqual({
        code: 'EMAIL_EXISTS',
      });
    });

    it('should throw error if user is under 18', async () => {
      const underageData = {
        ...validRegisterData,
        birthDate: new Date(), // Born today = 0 years old
      };

      await expect(authService.register(underageData)).rejects.toEqual({
        code: 'VALIDATION_ERROR',
        message: 'Anda harus berusia minimal 18 tahun',
      });
    });

    it('should hash password with bcrypt', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);
      prismaMock.user.create.mockResolvedValue({
        id: 'user-123',
        email: 'test@example.com',
        displayName: 'Test User',
        photoUrl: null,
      });

      await authService.register(validRegisterData);

      expect(bcrypt.hash).toHaveBeenCalledWith('SecurePass123!', 12);
    });

    it('should lowercase email', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);
      prismaMock.user.create.mockResolvedValue({
        id: 'user-123',
        email: 'test@example.com',
        displayName: 'Test User',
        photoUrl: null,
      });

      await authService.register({
        ...validRegisterData,
        email: 'TEST@EXAMPLE.COM',
      });

      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });
  });

  describe('login', () => {
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      passwordHash: 'hashed_password',
      displayName: 'Test User',
      photoUrl: null,
      trustCategory: 'GOOD',
    };

    it('should login successfully with valid credentials', async () => {
      prismaMock.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      prismaMock.user.update.mockResolvedValue(mockUser);

      const result = await authService.login('test@example.com', 'password123');

      expect(result.user.id).toBe('user-123');
      expect(result.tokens.accessToken).toBeDefined();
    });

    it('should throw error for non-existent email', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(
        authService.login('nonexistent@example.com', 'password')
      ).rejects.toEqual({ code: 'INVALID_CREDENTIALS' });
    });

    it('should throw error for wrong password', async () => {
      prismaMock.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        authService.login('test@example.com', 'wrong-password')
      ).rejects.toEqual({ code: 'INVALID_CREDENTIALS' });
    });

    it('should throw error for suspended account', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        ...mockUser,
        trustCategory: 'SUSPENDED',
      });

      await expect(
        authService.login('test@example.com', 'password123')
      ).rejects.toEqual({ code: 'ACCOUNT_SUSPENDED' });
    });

    it('should update lastLoginAt on successful login', async () => {
      prismaMock.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      prismaMock.user.update.mockResolvedValue(mockUser);

      await authService.login('test@example.com', 'password123');

      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: { lastLoginAt: expect.any(Date) },
      });
    });
  });

  describe('logout', () => {
    it('should revoke refresh token', async () => {
      const { revokeRefreshToken } = require('../../../src/services/token.service');

      await authService.logout('user-123');

      expect(revokeRefreshToken).toHaveBeenCalledWith('user-123');
    });
  });

  describe('forgotPassword', () => {
    it('should not throw error for non-existent email', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      // Should not throw - security measure to prevent email enumeration
      await expect(
        authService.forgotPassword('nonexistent@example.com')
      ).resolves.toBeUndefined();
    });

    it('should generate reset token for existing user', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'user-123',
        email: 'test@example.com',
      });
      prismaMock.user.update.mockResolvedValue({});

      await authService.forgotPassword('test@example.com');

      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: {
          passwordResetToken: expect.any(String),
          passwordResetExpiry: expect.any(Date),
        },
      });
    });
  });

  describe('changePassword', () => {
    it('should change password successfully', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'user-123',
        passwordHash: 'old_hash',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      prismaMock.user.update.mockResolvedValue({});

      await authService.changePassword('user-123', 'oldPassword', 'newPassword');

      expect(bcrypt.hash).toHaveBeenCalledWith('newPassword', 12);
      expect(prismaMock.user.update).toHaveBeenCalled();
    });

    it('should throw error for wrong current password', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'user-123',
        passwordHash: 'old_hash',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        authService.changePassword('user-123', 'wrongPassword', 'newPassword')
      ).rejects.toEqual({ code: 'INVALID_PASSWORD' });
    });
  });
});
