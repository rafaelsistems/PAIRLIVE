/**
 * Test Setup
 * 
 * Konfigurasi global untuk semua test.
 * - Mock external dependencies (Redis, Prisma)
 * - Set environment variables untuk testing
 */

// Set test environment
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only-32chars';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/pairlive_test';
process.env.REDIS_URL = 'redis://localhost:6379/1';
process.env.PORT = '3001';

// Increase test timeout
jest.setTimeout(30000);

// Global teardown
afterAll(async () => {
  // Cleanup connections
});
