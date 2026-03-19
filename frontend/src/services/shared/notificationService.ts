import { API_ROUTES } from '~constants/routes';
import axios from '~utils/axiosConfig';

export const getNotifications = async (role: 'user' | 'tutor', params: { filter: 'all' | 'unread', page: number, limit: number }) => {
  const route = role === 'user' ? API_ROUTES.USER.NOTIFICATIONS : API_ROUTES.TUTOR.NOTIFICATIONS;
  const response = await axios.get(route, { params });
  return response.data;
};

export const markAsRead = async (role: 'user' | 'tutor', id: string) => {
  const route = role === 'user' ? API_ROUTES.USER.MARK_READ(id) : API_ROUTES.TUTOR.MARK_READ(id);
  const response = await axios.patch(route);
  return response.data;
};

export const markAllAsRead = async (role: 'user' | 'tutor') => {
  const route = role === 'user' ? API_ROUTES.USER.MARK_ALL_READ : API_ROUTES.TUTOR.MARK_ALL_READ;
  const response = await axios.patch(route);
  return response.data;
};

export const getUnreadCount = async (role: 'user' | 'tutor') => {
  const route = role === 'user' ? API_ROUTES.USER.UNREAD_COUNT : API_ROUTES.TUTOR.UNREAD_COUNT;
  const response = await axios.get(route);
  return response.data;
};
