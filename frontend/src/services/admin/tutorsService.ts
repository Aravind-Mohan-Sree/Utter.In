import { API_ROUTES } from '~constants/routes';
import axios from '~utils/axiosConfig';

export const fetchTutors = async (
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
      `${API_ROUTES.ADMIN.TUTORS}?${params.toString()}`,
    );

    return res.data;
  } catch (error) {
    throw error;
  }
};

export const toggleStatus = async (id: string) => {
  try {
    const res = await axios.patch(`${API_ROUTES.ADMIN.TUTORS}/${id}/status`);

    return res.data;
  } catch (error) {
    throw error;
  }
};

export const approve = async (id: string, certificationType: string) => {
  try {
    const res = await axios.patch(
      `${API_ROUTES.ADMIN.TUTORS}/${id}/approve?certificationType=${certificationType}`,
    );

    return res.data;
  } catch (error) {
    throw error;
  }
};

export const reject = async (id: string, rejectionReason: string) => {
  try {
    const res = await axios.patch(
      `${API_ROUTES.ADMIN.TUTORS}/${id}/reject?rejectionReason=${rejectionReason}`,
    );

    return res.data;
  } catch (error) {
    throw error;
  }
};
