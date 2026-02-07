import jwt from 'jsonwebtoken';
import { redis, REDIS_KEYS } from '../config/redis';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config';

const ACCESS_TOKEN_SECRET = config.jwt.secret;
const REFRESH_TOKEN_SECRET = config.jwt.secret + ':refresh';
const ACCESS_TOKEN_EXPIRY = config.jwt.accessExpires;
const REFRESH_TOKEN_EXPIRY = config.jwt.refreshExpires;
const REFRESH_TOKEN_EXPIRY_SECONDS = 7 * 24 * 60 * 60; // 7 days

export interface TokenPayload {
  userId: string;
  email: string;
  displayName: string;
}

export function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, ACCESS_TOKEN_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
  });
}

export async function generateRefreshToken(userId: string): Promise<string> {
  const tokenId = uuidv4();
  const token = jwt.sign({ userId, tokenId }, REFRESH_TOKEN_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRY,
  });

  // Store refresh token in Redis
  await redis.setex(
    REDIS_KEYS.REFRESH_TOKEN(userId),
    REFRESH_TOKEN_EXPIRY_SECONDS,
    tokenId
  );

  return token;
}

export function verifyAccessToken(token: string): TokenPayload | null {
  try {
    const payload = jwt.verify(token, ACCESS_TOKEN_SECRET) as TokenPayload;
    return payload;
  } catch {
    return null;
  }
}

export async function verifyRefreshToken(token: string): Promise<string | null> {
  try {
    const payload = jwt.verify(token, REFRESH_TOKEN_SECRET) as {
      userId: string;
      tokenId: string;
    };

    // Check if token ID matches stored value
    const storedTokenId = await redis.get(REDIS_KEYS.REFRESH_TOKEN(payload.userId));
    if (storedTokenId !== payload.tokenId) {
      return null;
    }

    return payload.userId;
  } catch {
    return null;
  }
}

export async function revokeRefreshToken(userId: string): Promise<void> {
  await redis.del(REDIS_KEYS.REFRESH_TOKEN(userId));
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export async function generateTokenPair(payload: TokenPayload): Promise<TokenPair> {
  const accessToken = generateAccessToken(payload);
  const refreshToken = await generateRefreshToken(payload.userId);

  return {
    accessToken,
    refreshToken,
    expiresIn: 900, // 15 minutes in seconds
  };
}
