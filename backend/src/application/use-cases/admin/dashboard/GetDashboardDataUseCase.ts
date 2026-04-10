import { IGetDashboardDataUseCase } from '~use-case-interfaces/admin/IDashboardUseCase';
import { IUserRepository } from '~repository-interfaces/IUserRepository';
import { ITutorRepository } from '~repository-interfaces/ITutorRepository';
import { IBookingRepository } from '~repository-interfaces/IBookingRepository';
import { IAbuseReportRepository } from '~repository-interfaces/IAbuseReportRepository';
import { DashboardDataResponseDTO, ActivityDTO } from '~dtos/DashboardDTO';
import mongoose from 'mongoose';

export class GetDashboardDataUseCase implements IGetDashboardDataUseCase {
  constructor(
    private _userRepo: IUserRepository,
    private _tutorRepo: ITutorRepository,
    private _bookingRepo: IBookingRepository,
    private _reportRepo: IAbuseReportRepository,
  ) {}

  async execute(): Promise<DashboardDataResponseDTO> {
    const startTime = Date.now();
    const now = new Date();
    
    // Start of current month
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Start of last month
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    
    const [
      totalUsers,
      thisMonthUsers,
      lastMonthUsers,
      activeTutors,
      thisMonthTutors,
      lastMonthTutors,
      currentStats,
      lastMonthStats,
      recentUsers,
      recentTutors,
      recentSessions,
      recentReports,
    ] = await Promise.all([
      this._userRepo.countRecords({ role: 'user' }),
      this._userRepo.countRecords({ role: 'user', createdAt: { $gte: startOfThisMonth } }),
      this._userRepo.countRecords({ 
        role: 'user', 
        createdAt: { $gte: startOfLastMonth, $lt: startOfThisMonth }, 
      }),
      this._tutorRepo.countRecords({ isVerified: true }),
      this._tutorRepo.countRecords({ 
        isVerified: true, 
        updatedAt: { $gte: startOfThisMonth }, 
      }),
      this._tutorRepo.countRecords({ 
        isVerified: true, 
        updatedAt: { $gte: startOfLastMonth, $lt: startOfThisMonth }, 
      }),
      this._bookingRepo.getDashboardStats(),
      this._bookingRepo.getStatsForPeriod(startOfLastMonth, startOfThisMonth),
      this._userRepo.getRecentUsers(2),
      this._tutorRepo.getRecentVerifications(2),
      this._bookingRepo.getRecentSessions(3),
      this._reportRepo.getRecentReports(2),
    ]);

    const calculateGrowth = (current: number, previous: number): number => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    const userGrowth = calculateGrowth(thisMonthUsers, lastMonthUsers);
    const tutorGrowth = calculateGrowth(thisMonthTutors, lastMonthTutors);
    const sessionGrowth = calculateGrowth(currentStats.completedSessions, lastMonthStats.completedSessions);
    const earningsGrowth = calculateGrowth(currentStats.totalEarnings, lastMonthStats.totalEarnings);

    const activities: ActivityDTO[] = [
      ...recentUsers.map(u => ({
        type: 'user_registration' as const,
        message: `New user ${u.name} registered`,
        timestamp: u.createdAt!,
      })),
      ...recentTutors.map(t => ({
        type: 'tutor_verification' as const,
        message: `Tutor ${t.name} verified`,
        timestamp: t.updatedAt!,
      })),
      ...recentSessions.filter(s => s.status === 'Completed').map(s => ({
        type: 'session_completed' as const,
        message: `Session completed: ${s.topic}`,
        timestamp: s.date,
      })),
      ...recentReports.map(r => ({
        type: 'abuse_report' as const,
        message: `New abuse report submitted`,
        timestamp: r.createdAt!,
      })),
    ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 5);

    const apiResponseTime = Date.now() - startTime;
    const dbStatus = mongoose.connection.readyState === 1 ? 'healthy' : 'unhealthy';

    return {
      stats: {
        totalUsers,
        userGrowth,
        activeTutors,
        tutorGrowth,
        sessionsCompleted: currentStats.completedSessions,
        sessionGrowth,
        totalEarnings: currentStats.totalEarnings,
        earningsGrowth,
      },
      recentActivity: activities,
      popularLanguages: currentStats.languageStats,
      systemStatus: {
        server: 'online',
        database: dbStatus as 'healthy' | 'unhealthy',
        storageUsed: 78,
        apiResponseTime: apiResponseTime,
      },
    };
  }
}
