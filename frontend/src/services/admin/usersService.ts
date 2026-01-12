import { API_ROUTES } from '~constants/routes';
import axios from '~utils/axiosConfig';

export const fetchUsers = async (
  page: number,
  limit: number,
  query: string,
  filter: string,
) => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      query,
      filter,
    });

    const res = await axios.get(
      `${API_ROUTES.ADMIN.FETCH_USERS}?${params.toString()}`,
    );

    return res.data;
  } catch (error) {
    throw error;
  }
};
