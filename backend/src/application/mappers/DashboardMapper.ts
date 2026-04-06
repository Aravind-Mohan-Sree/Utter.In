import { DashboardDataResponseDTO } from '~dtos/DashboardDTO';

export class DashboardMapper {
  static toResponse(data: DashboardDataResponseDTO): DashboardDataResponseDTO {
    return {
      stats: {
        totalUsers: data.stats.totalUsers,
        userGrowth: data.stats.userGrowth,
        activeTutors: data.stats.activeTutors,
        tutorGrowth: data.stats.tutorGrowth,
        sessionsCompleted: data.stats.sessionsCompleted,
        sessionGrowth: data.stats.sessionGrowth,
        totalEarnings: data.stats.totalEarnings,
        earningsGrowth: data.stats.earningsGrowth,
      },
      recentActivity: data.recentActivity.map((activity) => ({
        type: activity.type,
        message: activity.message,
        timestamp: activity.timestamp,
      })),
      popularLanguages: data.popularLanguages.map((lang) => ({
        language: lang.language,
        sessionCount: lang.sessionCount,
      })),
      systemStatus: {
        server: data.systemStatus.server,
        database: data.systemStatus.database,
        storageUsed: data.systemStatus.storageUsed,
        apiResponseTime: data.systemStatus.apiResponseTime,
      },
    };
  }
}
