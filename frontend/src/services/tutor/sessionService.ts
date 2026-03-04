import { API_ROUTES } from '~constants/routes';
import { CreateSessionRequest, CreateSessionResponse, TutorGetSessionsResponse } from '~types/tutor';
import axios from '~utils/axiosConfig';

export const createSession = async (sessionData: CreateSessionRequest): Promise<CreateSessionResponse> => {
    try {
        const res = await axios.post(`${API_ROUTES.TUTOR.CREATE_SESSION}`, sessionData);
        return res.data;
    } catch (error) {
        throw error;
    }
};

export const getSessions = async (date: string): Promise<TutorGetSessionsResponse> => {
    try {
        const res = await axios.get(`${API_ROUTES.TUTOR.GET_SESSIONS}?date=${date}`);
        return res.data;
    } catch (error) {
        throw error;
    }
};

export const cancelSession = async (sessionId: string): Promise<{ message: string }> => {
    try {
        const res = await axios.delete(`${API_ROUTES.TUTOR.CANCEL_SESSION}/${sessionId}`);
        return res.data;
    } catch (error) {
        throw error;
    }
};
