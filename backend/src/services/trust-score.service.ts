/**
 * Trust Score Service
 * 
 * Mengelola sistem reputasi dan trust score pengguna:
 * - Update skor berdasarkan feedback
 * - Update skor berdasarkan perilaku
 * - Pemulihan skor otomatis
 * - Penentuan kategori trust
 */

import { prisma } from '../config/database';
import { createLogger } from '../utils/logger';

const logger = createLogger('TrustScoreService');

type TrustCategory = 'PREMIUM' | 'GOOD' | 'WARNING' | 'RESTRICTED' | 'SUSPENDED';

export class TrustScoreService {
  // Rentang skor trust untuk setiap kategori
  private readonly CATEGORIES: Record<string, { min: number; max: number }> = {
    PREMIUM: { min: 80, max: 100 },    // 80-100: Premium, pengalaman terbaik
    GOOD: { min: 50, max: 79 },        // 50-79: Baik, standar
    WARNING: { min: 30, max: 49 },     // 30-49: Peringatan
    RESTRICTED: { min: 10, max: 29 },  // 10-29: Dibatasi
    SUSPENDED: { min: 0, max: 9 },     // 0-9: Di-suspend
  };

  /**
   * Update skor dari feedback rating
   */
  async updateFromFeedback(userId: string, rating: number): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { trustScore: true },
    });

    if (!user) return;

    // Hitung perubahan skor berdasarkan rating
    let scoreChange = 0;
    if (rating === 5) scoreChange = 2;      // Bintang 5: +2
    else if (rating === 4) scoreChange = 1; // Bintang 4: +1
    else if (rating === 3) scoreChange = 0; // Bintang 3: 0
    else if (rating === 2) scoreChange = -2; // Bintang 2: -2
    else if (rating === 1) scoreChange = -4; // Bintang 1: -4

    await this.updateScore(userId, user.trustScore, scoreChange);
  }

  /**
   * Update skor dari perilaku pengguna
   */
  async updateFromBehavior(userId: string, behaviorType: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { trustScore: true },
    });

    if (!user) return;

    let scoreChange = 0;

    switch (behaviorType) {
      case 'SKIP':
        // Skip sering-sering mengurangi trust
        const recentSkips = await this.countRecentSkips(userId);
        if (recentSkips > 5) scoreChange = -1;
        break;

      case 'REPORT_VALID':
        // Dilaporkan dengan alasan valid
        scoreChange = -10;
        break;

      case 'REPORT_INVALID':
        // Laporan palsu terhadap pengguna ini
        scoreChange = 1;
        break;

      case 'LONG_SESSION':
        // Sesi panjang menandakan interaksi bagus
        scoreChange = 1;
        break;

      case 'GIFT_SENT':
        // Kirim hadiah menunjukkan engagement positif
        scoreChange = 0.5;
        break;

      case 'GIFT_RECEIVED':
        // Terima hadiah menandakan orang lain menikmati
        scoreChange = 0.5;
        break;

      case 'AFK':
        // Perilaku AFK negatif
        scoreChange = -2;
        break;

      case 'FALSE_REPORT':
        // Membuat laporan palsu
        scoreChange = -5;
        break;
    }

    if (scoreChange !== 0) {
      await this.updateScore(userId, user.trustScore, scoreChange);
    }
  }

  /**
   * Update skor dan kategori
   */
  private async updateScore(
    userId: string,
    currentScore: number,
    change: number
  ): Promise<void> {
    // Hitung skor baru (batasi 0-100)
    const newScore = Math.max(0, Math.min(100, currentScore + change));

    // Tentukan kategori baru
    const newCategory = this.determineCategory(newScore);

    // Update pengguna
    await prisma.user.update({
      where: { id: userId },
      data: {
        trustScore: newScore,
        trustCategory: newCategory,
        updatedAt: new Date(),
      },
    });

    logger.info(`Trust score diupdate: user=${userId}, ${currentScore} -> ${newScore}, kategori=${newCategory}`);

    // Cek perubahan kategori dan ambil tindakan jika perlu
    if (newCategory === 'SUSPENDED') {
      await this.handleSuspension(userId);
    }
  }

  /**
   * Tentukan kategori dari skor
   */
  private determineCategory(score: number): TrustCategory {
    if (score >= 80) return 'PREMIUM';
    if (score >= 50) return 'GOOD';
    if (score >= 30) return 'WARNING';
    if (score >= 10) return 'RESTRICTED';
    return 'SUSPENDED';
  }

  /**
   * Hitung skip dalam 24 jam terakhir
   */
  private async countRecentSkips(userId: string): Promise<number> {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    return prisma.userBehavior.count({
      where: {
        userId,
        behaviorType: 'SKIP',
        createdAt: { gte: oneDayAgo },
      },
    });
  }

  /**
   * Tangani suspend pengguna
   */
  private async handleSuspension(userId: string): Promise<void> {
    logger.warn(`Pengguna di-suspend: ${userId}`);
    
    // Logika tambahan bisa ditambahkan di sini
    // misalnya: kirim email notifikasi, cabut sesi aktif, dll.
  }

  /**
   * Proses pemulihan skor secara berkala (dipanggil cron job)
   */
  async processRecovery(): Promise<void> {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // Cari pengguna yang layak pemulihan
    const eligibleUsers = await prisma.user.findMany({
      where: {
        trustScore: { lt: 80 },
        trustCategory: { in: ['WARNING', 'RESTRICTED'] },
        updatedAt: { lt: oneWeekAgo },
      },
      select: { id: true, trustScore: true },
    });

    for (const user of eligibleUsers) {
      // Pemulihan kecil untuk perilaku baik
      await this.updateScore(user.id, user.trustScore, 1);
    }

    logger.info(`Pemulihan trust score diproses untuk ${eligibleUsers.length} pengguna`);
  }
}
