import axios from '~utils/axiosConfig';
import { API_ROUTES } from '~constants/routes';

export const createSession = async (sessionData: any) => {
    try {
        const res = await axios.post(`${API_ROUTES.TUTOR.CREATE_SESSION}`, sessionData);
        return res.data;
    } catch (error) {
        throw error;
    }
};

export const getSessions = async (date: string) => {
    try {
        const res = await axios.get(`${API_ROUTES.TUTOR.GET_SESSIONS}?date=${date}`);
        return res.data;
    } catch (error) {
        throw error;
    }
};

export const cancelSession = async (sessionId: string) => {
    try {
        const res = await axios.delete(`${API_ROUTES.TUTOR.CANCEL_SESSION}/${sessionId}`);
        return res.data;
    } catch (error) {
        throw error;
    }
};
