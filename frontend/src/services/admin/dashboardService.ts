import axios from '~utils/axiosConfig';

export interface DashboardStats {
  totalUsers: number;
  userGrowth: number;
  activeTutors: number;
  tutorGrowth: number;
  sessionsCompleted: number;
  sessionGrowth: number;
  totalEarnings: number;
  earningsGrowth: number;
}

export interface Activity {
  type: 'user_registration' | 'session_completed' | 'tutor_verification' | 'abuse_report';
  message: string;
  timestamp: string;
}

export interface LanguageStat {
  language: string;
  sessionCount: number;
}

export interface SystemStatus {
  server: 'online' | 'offline';
  database: 'healthy' | 'unhealthy';
  storageUsed: number;
  apiResponseTime: number;
}

export interface DashboardData {
  stats: DashboardStats;
  recentActivity: Activity[];
  popularLanguages: LanguageStat[];
  systemStatus: SystemStatus;
}

export const getDashboardData = async (): Promise<DashboardData> => {
  const response = await axios.get('/admin/dashboard');
  return response.data;
};
