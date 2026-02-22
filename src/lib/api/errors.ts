export type ApiErrorCode =
  // 식당
  | 'DATA_NOT_EXIST'      // 존재하지 않는 storeId
  // 리뷰
  | 'DATA_ALREADY_EXIST'  // 이미 좋아요한 리뷰
  | 'ACCESS_DENIED'       // 타인 리뷰 삭제 시도
  // 공통
  | 'UNKNOWN';

export interface ApiErrorResponse {
  code: ApiErrorCode;
  message: string;
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

export const parseApiError = (error: unknown): ApiError => {
  if (error instanceof ApiError) return error;

  const axiosError = error as {
    response?: { status: number; data?: ApiErrorResponse };
  };

  if (axiosError.response) {
    const { status, data } = axiosError.response;
    return new ApiError(
      status,
      data?.code ?? 'UNKNOWN',
      data?.message ?? '알 수 없는 오류가 발생했습니다.'
    );
  }

  return new ApiError(0, 'UNKNOWN', '네트워크 오류가 발생했습니다.');
};