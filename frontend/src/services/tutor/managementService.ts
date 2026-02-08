import { API_ROUTES } from '~constants/routes';
import axios from '~utils/axiosConfig';

export const resubmitAccount = async (userType: string, body: object) => {
  try {
    const res = await axios.patch(API_ROUTES.TUTOR.RESUBMIT_ACCOUNT, body);

    return res.data;
  } catch (error) {
    throw error;
  }
};
