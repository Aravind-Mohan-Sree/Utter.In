export interface DashboardStatsResponseDTO {
  totalUsers: number;
  userGrowth: number;
  activeTutors: number;
  tutorGrowth: number;
  sessionsCompleted: number;
  sessionGrowth: number;
  totalEarnings: number;
  earningsGrowth: number;
}

export interface ActivityDTO {
  type: 'user_registration' | 'session_completed' | 'tutor_verification' | 'abuse_report';
  message: string;
  timestamp: Date;
}

export interface LanguageStatDTO {
  language: string;
  sessionCount: number;
}

export interface SystemStatusDTO {
  server: 'online' | 'offline';
  database: 'healthy' | 'unhealthy';
  storageUsed: number;
  apiResponseTime: number;
}

export interface DashboardDataResponseDTO {
  stats: DashboardStatsResponseDTO;
  recentActivity: ActivityDTO[];
  popularLanguages: LanguageStatDTO[];
  systemStatus: SystemStatusDTO;
}
