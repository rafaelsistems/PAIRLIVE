/**
 * Prisma Client Mock
 * 
 * Mock untuk Prisma Client yang digunakan di semua test.
 * Menggunakan jest.fn() untuk setiap method.
 */

export const prismaMock = {
  user: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  session: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
  },
  feedback: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    count: jest.fn(),
  },
  gift: {
    findMany: jest.fn(),
    create: jest.fn(),
    count: jest.fn(),
  },
  coinTransaction: {
    findMany: jest.fn(),
    create: jest.fn(),
    count: jest.fn(),
  },
  friendship: {
    findFirst: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  friendRequest: {
    findFirst: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  report: {
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
  },
  userBehavior: {
    findMany: jest.fn(),
    create: jest.fn(),
    count: jest.fn(),
  },
  purchase: {
    findMany: jest.fn(),
    create: jest.fn(),
  },
  $connect: jest.fn(),
  $disconnect: jest.fn(),
  $transaction: jest.fn((fn: any) => fn(prismaMock)),
};

jest.mock('../../src/config/database', () => ({
  prisma: prismaMock,
}));

export default prismaMock;
