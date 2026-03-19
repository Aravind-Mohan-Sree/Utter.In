import { API_ROUTES } from '~constants/routes';
import axios from '~utils/axiosConfig';

export const fetchUsers = async (params: {
  q?: string;
  page?: number;
  limit?: number;
  sort?: string;
  language?: string;
}) => {
  const response = await axios.get(API_ROUTES.USER.CHAT_SEARCH, {
    params
  });
  return response.data;
};
