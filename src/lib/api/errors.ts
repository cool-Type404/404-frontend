export type ApiErrorCode =
  | 'DATA_NOT_EXIST'
  | 'DATA_ALREADY_EXIST'
  | 'ACCESS_DENIED'
  | 'UNKNOWN';

export interface ApiErrorResponse {
  code?: ApiErrorCode;
  message?: string;
  error?: string;
  status?: number;
  path?: string;
  timestamp?: string;
}

export class ApiError extends Error {
  public status: number;
  public code: ApiErrorCode;

  constructor(status: number, code: ApiErrorCode, message: string) {
    super(message);
    this.status = status;
    this.code = code;
    this.name = 'ApiError';
  }
}

const fallbackMessageByStatus = (status: number) => {
  switch (status) {
    case 400:
      return '요청 형식이 올바르지 않거나 입력값이 유효하지 않습니다.';
    case 401:
      return '인증이 필요합니다.';
    case 403:
      return '접근 권한이 없습니다.';
    case 404:
      return '요청한 정보를 찾을 수 없습니다.';
    case 409:
      return '이미 처리된 요청이거나 중복된 데이터입니다.';
    case 500:
      return '서버 오류가 발생했습니다.';
    default:
      return '알 수 없는 오류가 발생했습니다.';
  }
};

export const parseApiError = (error: unknown): ApiError => {
  if (error instanceof ApiError) return error;

  const axiosError = error as {
    response?: { status: number; data?: ApiErrorResponse | string };
    message?: string;
  };

  if (axiosError.response) {
    const { status, data } = axiosError.response;

    if (typeof data === 'string' && data.trim()) {
      return new ApiError(status, 'UNKNOWN', data);
    }

    const responseData = (data ?? {}) as ApiErrorResponse;
    const message =
      responseData.message ||
      responseData.error ||
      fallbackMessageByStatus(status);

    return new ApiError(status, responseData.code ?? 'UNKNOWN', message);
  }

  return new ApiError(0, 'UNKNOWN', axiosError.message || '네트워크 오류가 발생했습니다.');
};
