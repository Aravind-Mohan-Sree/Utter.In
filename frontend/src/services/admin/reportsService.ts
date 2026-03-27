import { API_ROUTES } from '~constants/routes';
import axios from '~utils/axiosConfig';

export const getAbuseReports = async (params?: { page?: number; limit?: number; search?: string; status?: string }) => {
  const response = await axios.get(API_ROUTES.ADMIN.REPORTS, { params });
  return response.data;
};

export const handleAbuseReport = async (reportId: string, status: 'Resolved' | 'Rejected', rejectionReason?: string) => {
  const response = await axios.patch(API_ROUTES.ADMIN.HANDLE_REPORT(reportId), { status, rejectionReason });
  return response.data;
};
