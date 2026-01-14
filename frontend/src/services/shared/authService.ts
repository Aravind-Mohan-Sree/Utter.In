import { API_ROUTES } from '~constants/routes';
import { UserType } from '~types/auth/UserType';
import axios from '~utils/axiosConfig';

export const register = async (userType: UserType, body: object) => {
  try {
    const res = await axios.post(
      userType === 'user' ? API_ROUTES.USER.SIGNUP : API_ROUTES.TUTOR.SIGNUP,
      body,
    );

    return res.data;
  } catch (error) {
    throw error;
  }
};

export const verifyOtp = async (userType: UserType, body: object) => {
  try {
    const res = await axios.post(
      userType === 'user'
        ? API_ROUTES.USER.VERIFY_OTP
        : API_ROUTES.TUTOR.VERIFY_OTP,
      body,
    );

    return res.data;
  } catch (error) {
    throw error;
  }
};

export const signin = async (userType: UserType, body: object) => {
  try {
    const res = await axios.post(
      userType === 'user' ? API_ROUTES.USER.SIGNIN : API_ROUTES.TUTOR.SIGNIN,
      body,
    );

    return res.data;
  } catch (error) {
    throw error;
  }
};

export const resendOtp = async (userType: UserType, body: object) => {
  try {
    const res = await axios.patch(
      userType === 'user'
        ? API_ROUTES.USER.RESEND_OTP
        : API_ROUTES.TUTOR.RESEND_OTP,
      body,
    );

    return res.data;
  } catch (error) {
    throw error;
  }
};

export const verifyEmail = async (userType: UserType, body: object) => {
  try {
    const res = await axios.post(
      userType === 'user'
        ? API_ROUTES.USER.VERIFY_EMAIL
        : API_ROUTES.TUTOR.VERIFY_EMAIL,
      body,
    );

    return res.data;
  } catch (error) {
    throw error;
  }
};

export const forgotPasswordOtpVerify = async (
  userType: UserType,
  body: object,
) => {
  try {
    const res = await axios.post(
      userType === 'user'
        ? API_ROUTES.USER.FORGOT_PASSWORD_OTP_VERIFY
        : API_ROUTES.TUTOR.FORGOT_PASSWORD_OTP_VERIFY,
      body,
    );

    return res.data;
  } catch (error) {
    throw error;
  }
};

export const resetPassword = async (userType: UserType, body: object) => {
  try {
    const res = await axios.patch(
      userType === 'user'
        ? API_ROUTES.USER.RESET_PASSWORD
        : API_ROUTES.TUTOR.RESET_PASSWORD,
      body,
    );

    return res.data;
  } catch (error) {
    throw error;
  }
};
