import axios, { InternalAxiosRequestConfig } from 'axios';
import { utterToast } from './utterToast';
import { store } from '~store/store';
import { signout } from '~features/authSlice';

axios.interceptors.request.use(
  (config: InternalAxiosRequestConfig<unknown>) => {
    config.baseURL = process.env.NEXT_PUBLIC_BASE_URL;
    config.withCredentials = true;
    return config;
  },
  (error) => Promise.reject(error),
);

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      store.dispatch(signout());
      utterToast.error(error.response?.data?.message || 'Unauthorized access');

      setTimeout(() => {
        window.location.href = '/signin';
      }, 600);
    }
    return Promise.reject(error);
  },
);

export default axios;
