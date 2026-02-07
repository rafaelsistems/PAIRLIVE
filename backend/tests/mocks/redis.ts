/**
 * Redis Client Mock
 */

const redisMock = {
  get: jest.fn(),
  set: jest.fn(),
  setex: jest.fn(),
  del: jest.fn(),
  exists: jest.fn(),
  expire: jest.fn(),
  ttl: jest.fn(),
  incr: jest.fn(),
  decr: jest.fn(),
  sadd: jest.fn(),
  srem: jest.fn(),
  smembers: jest.fn(),
  sismember: jest.fn(),
  zadd: jest.fn(),
  zrem: jest.fn(),
  zrange: jest.fn(),
  zrangebyscore: jest.fn(),
  zremrangebyscore: jest.fn(),
  zcard: jest.fn(),
  hset: jest.fn(),
  hget: jest.fn(),
  hdel: jest.fn(),
  hgetall: jest.fn(),
  pipeline: jest.fn(() => ({
    zremrangebyscore: jest.fn().mockReturnThis(),
    zcard: jest.fn().mockReturnThis(),
    zadd: jest.fn().mockReturnThis(),
    pexpire: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue([[null, 0], [null, 0], [null, 1], [null, 1]]),
  })),
  ping: jest.fn().mockResolvedValue('PONG'),
  quit: jest.fn(),
  on: jest.fn(),
};

jest.mock('../../src/config/redis', () => ({
  redis: redisMock,
  REDIS_KEYS: {
    MATCHING_QUEUE: 'matching:queue',
    MATCHING_USER: (userId: string) => `matching:user:${userId}`,
    ACTIVE_SESSION: (sessionId: string) => `session:active:${sessionId}`,
    USER_SESSION: (userId: string) => `session:user:${userId}`,
    USER_ONLINE: (userId: string) => `user:online:${userId}`,
    RATE_LIMIT: (key: string) => `ratelimit:${key}`,
    REFRESH_TOKEN: (userId: string) => `token:refresh:${userId}`,
    USER_PROFILE: (userId: string) => `cache:user:${userId}`,
    USER_SOCKET: (userId: string) => `socket:user:${userId}`,
  },
  redisHelpers: {
    setWithExpiry: jest.fn(),
    setJSON: jest.fn(),
    getJSON: jest.fn(),
    addToSet: jest.fn(),
    removeFromSet: jest.fn(),
    getSetMembers: jest.fn(),
  },
}));

export default redisMock;
