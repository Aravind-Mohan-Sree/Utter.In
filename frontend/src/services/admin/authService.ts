import { API_ROUTES } from '~constants/routes';
import axios from '~utils/axiosConfig';

export const signin = async (body: object) => {
  try {
    const res = await axios.post(API_ROUTES.ADMIN.SIGNIN, body);

    return res.data;
  } catch (error) {
    throw error;
  }
};
