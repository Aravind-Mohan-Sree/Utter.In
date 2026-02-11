import axios from '~utils/axiosConfig';
import { API_ROUTES } from '~constants/routes';
import { GetTutorDetailsResponse, GetTutorSessionsResponse } from '~types/tutor';

export const fetchTutors = async (
    page: number,
    limit: number,
    query: string,
    sort: string,
    language: string
) => {
    try {
        const res = await axios.get(API_ROUTES.USER.GET_TUTORS, {
            params: { page, limit, query, sort, language },
        });
        return res.data;
    } catch (error) {
        throw error;
    }
};



export const getTutorDetails = async (id: string): Promise<GetTutorDetailsResponse> => {
    try {
        const res = await axios.get(`${API_ROUTES.USER.GET_TUTORS}/${id}`);
        return res.data;
    } catch (error) {
        console.error('Error fetching tutor details:', error);
        throw error;
    }
};

export const getTutorSessions = async (id: string, date?: string): Promise<GetTutorSessionsResponse> => {
    try {
        const res = await axios.get(`${API_ROUTES.USER.GET_TUTORS}/${id}/sessions`, {
            params: { date }
        });
        return res.data;
    } catch (error) {
        throw error;
    }
};
export const createBookingOrder = async (amount: number, currency: string, sessionId: string) => {
    try {
        const res = await axios.post(API_ROUTES.USER.CREATE_ORDER, { amount, currency, sessionId });
        return res.data;
    } catch (error) {
        throw error;
    }
};

export const verifyBookingPayment = async (data: any) => {
    try {
        const res = await axios.post(API_ROUTES.USER.VERIFY_PAYMENT, data);
        return res.data;
    } catch (error) {
        throw error;
    }
};
