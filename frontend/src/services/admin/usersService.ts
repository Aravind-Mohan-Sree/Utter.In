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
      `${API_ROUTES.ADMIN.USERS}?${params.toString()}`,
    );

    return res.data;
  } catch (error) {
    throw error;
  }
};

export const toggleStatus = async (id: string) => {
  try {
    const res = await axios.patch(`${API_ROUTES.ADMIN.USERS}/${id}/status`);

    return res.data;
  } catch (error) {
    throw error;
  }
};
