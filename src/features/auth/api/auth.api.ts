import { http } from '@/lib/api/http';
import { parseApiError } from '@/lib/api/errors';

export type SignUpRequest = {
  email: string;
  password: string;
  nickname: string;
  gender?: string;
  age?: string;
  eatingLevel: string;
};

export type EmailSendRequest = {
  email: string;
};

export type EmailVerifyRequest = {
  email: string;
  authCode: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  email: string;
  accessToken: string;
  refreshToken: string;
};

export const sendVerificationEmail = async (body: EmailSendRequest): Promise<void> => {
  try {
    await http.post('/api/auth/email-verification/send', body);
  } catch (error) {
    throw parseApiError(error);
  }
};

export const verifyEmailCode = async (body: EmailVerifyRequest): Promise<void> => {
  try {
    await http.post('/api/auth/email-verification/verify', body);
  } catch (error) {
    throw parseApiError(error);
  }
};

export const signUp = async (body: SignUpRequest): Promise<void> => {
  try {
    await http.post('/api/auth/signup', body);
  } catch (error) {
    throw parseApiError(error);
  }
};

export const login = async (body: LoginRequest): Promise<LoginResponse> => {
  try {
    const { data } = await http.post('/api/auth/login', body);
    return data;
  } catch (error) {
    throw parseApiError(error);
  }
};

export const logout = async (): Promise<void> => {
  try {
    await http.post('/api/auth/logout');
  } catch (error) {
    throw parseApiError(error);
  }
};
