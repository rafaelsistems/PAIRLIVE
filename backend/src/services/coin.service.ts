import { prisma } from '../config/database';
import { createLogger } from '../utils/logger';
import { TrustScoreService } from './trust-score.service';
import { v4 as uuidv4 } from 'uuid';

const logger = createLogger('CoinService');
const trustScoreService = new TrustScoreService();

// Coin packages
const COIN_PACKAGES = {
  small: { id: 'small', coins: 100, price: 0.99 },
  medium: { id: 'medium', coins: 500, price: 4.99 },
  large: { id: 'large', coins: 1200, price: 9.99 },
  premium: { id: 'premium', coins: 5000, price: 39.99 },
};

// Gift types
const GIFT_TYPES = {
  heart: { name: 'Heart', cost: 10 },
  star: { name: 'Star', cost: 25 },
  flower: { name: 'Flower', cost: 50 },
  crown: { name: 'Crown', cost: 100 },
  diamond: { name: 'Diamond', cost: 500 },
};

interface SendGiftData {
  senderId: string;
  sessionId: string;
  receiverId: string;
  giftType: string;
  coinAmount: number;
}

interface PurchaseData {
  userId: string;
  packageId: string;
  receipt: string;
  platform: 'ios' | 'android';
}

export class CoinService {
  async getBalance(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        coinBalance: true,
        totalCoinsEarned: true,
        totalCoinsSpent: true,
      },
    });

    return user || { coinBalance: 0, totalCoinsEarned: 0, totalCoinsSpent: 0 };
  }

  async getTransactions(
    userId: string,
    page: number,
    limit: number,
    type?: string
  ) {
    const skip = (page - 1) * limit;

    const where: any = {
      OR: [{ senderId: userId }, { receiverId: userId }],
    };

    if (type) {
      where.type = type;
    }

    const [transactions, total] = await Promise.all([
      prisma.coinTransaction.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.coinTransaction.count({ where }),
    ]);

    return { transactions, total };
  }

  async sendGift(data: SendGiftData) {
    const { senderId, sessionId, receiverId, giftType, coinAmount } = data;

    // Verify session exists and both users are in it
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!session || session.status !== 'ACTIVE') {
      throw { code: 'NOT_FOUND' };
    }

    const sessionUsers = [session.user1Id, session.user2Id];
    if (!sessionUsers.includes(senderId) || !sessionUsers.includes(receiverId)) {
      throw { code: 'INVALID_RECEIVER' };
    }

    // Check sender's balance
    const sender = await prisma.user.findUnique({
      where: { id: senderId },
      select: { coinBalance: true },
    });

    if (!sender || sender.coinBalance < coinAmount) {
      throw { code: 'INSUFFICIENT_COINS' };
    }

    // Process gift transaction
    const receiverAmount = Math.floor(coinAmount * 0.7); // 70% to receiver

    await prisma.$transaction([
      // Deduct from sender
      prisma.user.update({
        where: { id: senderId },
        data: {
          coinBalance: { decrement: coinAmount },
          totalCoinsSpent: { increment: coinAmount },
        },
      }),
      // Add to receiver (70%)
      prisma.user.update({
        where: { id: receiverId },
        data: {
          coinBalance: { increment: receiverAmount },
          totalCoinsEarned: { increment: receiverAmount },
        },
      }),
      // Create gift record
      prisma.gift.create({
        data: {
          id: uuidv4(),
          sessionId,
          senderId,
          receiverId,
          giftType,
          coinAmount,
          receiverAmount,
          createdAt: new Date(),
        },
      }),
      // Create transaction record
      prisma.coinTransaction.create({
        data: {
          id: uuidv4(),
          senderId,
          receiverId,
          type: 'GIFT',
          amount: coinAmount,
          description: `Sent ${giftType} gift`,
          createdAt: new Date(),
        },
      }),
    ]);

    // Update trust scores
    await Promise.all([
      trustScoreService.updateFromBehavior(senderId, 'GIFT_SENT'),
      trustScoreService.updateFromBehavior(receiverId, 'GIFT_RECEIVED'),
    ]);

    logger.info(`Gift sent: ${senderId} -> ${receiverId}, ${giftType}, ${coinAmount} coins`);

    return {
      giftType,
      coinAmount,
      receiverAmount,
      newBalance: sender.coinBalance - coinAmount,
    };
  }

  async processPurchase(data: PurchaseData) {
    const { userId, packageId, receipt, platform } = data;

    // Get package info
    const packageInfo = COIN_PACKAGES[packageId as keyof typeof COIN_PACKAGES];
    if (!packageInfo) {
      throw { code: 'INVALID_PACKAGE' };
    }

    // TODO: Verify receipt with Apple/Google
    // For now, we'll skip verification in development
    const isValid = await this.verifyReceipt(receipt, platform);
    if (!isValid) {
      throw { code: 'INVALID_RECEIPT' };
    }

    // Check for duplicate transaction
    const existing = await prisma.purchase.findFirst({
      where: { receipt },
    });

    if (existing) {
      throw { code: 'ALREADY_PROCESSED' };
    }

    // Process purchase
    await prisma.$transaction([
      // Add coins to user
      prisma.user.update({
        where: { id: userId },
        data: {
          coinBalance: { increment: packageInfo.coins },
        },
      }),
      // Create purchase record
      prisma.purchase.create({
        data: {
          id: uuidv4(),
          userId,
          packageId,
          coins: packageInfo.coins,
          amount: packageInfo.price,
          currency: 'USD',
          platform,
          receipt,
          status: 'COMPLETED',
          createdAt: new Date(),
        },
      }),
      // Create transaction record
      prisma.coinTransaction.create({
        data: {
          id: uuidv4(),
          receiverId: userId,
          type: 'PURCHASE',
          amount: packageInfo.coins,
          description: `Purchased ${packageInfo.coins} coins`,
          createdAt: new Date(),
        },
      }),
    ]);

    // Get updated balance
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { coinBalance: true },
    });

    logger.info(`Purchase completed: user=${userId}, package=${packageId}, coins=${packageInfo.coins}`);

    return {
      coins: packageInfo.coins,
      newBalance: user?.coinBalance || 0,
    };
  }

  private async verifyReceipt(receipt: string, platform: string): Promise<boolean> {
    // TODO: Implement actual receipt verification
    // Apple: https://developer.apple.com/documentation/storekit/in-app_purchase/validating_receipts_with_the_app_store
    // Google: https://developers.google.com/android-publisher/api-ref/purchases/products

    if (process.env.NODE_ENV === 'development') {
      return true; // Skip verification in development
    }

    // Production implementation would go here
    return true;
  }
}
