import axios, { InternalAxiosRequestConfig } from 'axios';
import { store } from '~store/store';

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
      const responseMessage = error.response?.data?.message;

      store.dispatch({ type: 'signout' });

      if (typeof window !== 'undefined') {
        const isAdminRoute = window.location.pathname.startsWith('/admin');
        const target = isAdminRoute ? '/admin/signin' : '/signin';
        const encoded = encodeURIComponent(String(responseMessage ?? ''));

        window.location.href = `${target}?responseMessage=${encoded}`;
      }
    }

    return Promise.reject(error);
  },
);

export default axios;
