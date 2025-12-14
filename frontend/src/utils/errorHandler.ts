import axios from 'axios';

export function errorHandler(error: unknown): string {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || 'Request failed. Please try again.';
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Something went wrong.';
}
