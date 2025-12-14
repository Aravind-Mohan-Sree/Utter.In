import { toast } from 'sonner';

const defaultOptions = {
  duration: 3000,
  id: 'utter',
};

export const utterToast = {
  success: (message: string) => {
    toast.success(message, defaultOptions);
  },
  error: (message: string) => {
    toast.error(message, defaultOptions);
  },
};
