import axios, { AxiosError } from 'axios';
import { getApiBaseUrl } from '@/utils/assetUrl';

export const http = axios.create({
  baseURL: getApiBaseUrl(),
  withCredentials: true,
});

http.interceptors.request.use((config) => {
  const accessToken = window.localStorage.getItem('accessToken');

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

http.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => Promise.reject(error),
);
