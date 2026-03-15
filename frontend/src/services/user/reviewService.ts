import { API_ROUTES } from '~constants/routes';
import axios from '~utils/axiosConfig';

export interface Review {
  id: string;
  userId: string;
  tutorId: string;
  rating: number;
  note: string;
  createdAt: string;
  updatedAt: string;
  userName?: string;
  userAvatar?: string;
}

export interface GetReviewsResponse {
  success: boolean;
  reviews: Review[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

export interface EligibilityResponse {
  success: boolean;
  canReview: boolean;
  alreadyReviewed: boolean;
}

export const getTutorReviews = async (
  tutorId: string,
  page: number = 1,
  limit: number = 5,
): Promise<GetReviewsResponse> => {
  const res = await axios.get(API_ROUTES.USER.TUTOR_REVIEWS(tutorId), {
    params: { page, limit },
  });
  return res.data;
};

export const checkReviewEligibility = async (tutorId: string): Promise<EligibilityResponse> => {
  const res = await axios.get(API_ROUTES.USER.REVIEW_ELIGIBILITY(tutorId));
  return res.data;
};

export const addReview = async (tutorId: string, rating: number, note: string) => {
  const res = await axios.post(API_ROUTES.USER.REVIEWS, { tutorId, rating, note });
  return res.data;
};

export const updateReview = async (id: string, rating: number, note: string) => {
  const res = await axios.patch(`${API_ROUTES.USER.REVIEWS}/${id}`, { rating, note });
  return res.data;
};

export const deleteReview = async (id: string) => {
  const res = await axios.delete(`${API_ROUTES.USER.REVIEWS}/${id}`);
  return res.data;
};
