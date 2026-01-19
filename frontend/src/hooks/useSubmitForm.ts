import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { ZodTypeAny } from 'zod';
import { signIn } from '~features/authSlice';
import { errorHandler } from '~utils/errorHandler';
import { utterToast } from '~utils/utterToast';

export interface ApiResponse {
  message: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export const useSubmitForm = <
  T extends object,
  E extends Record<keyof T, string>,
  U extends string,
>(
  userType: U,
  formData: T,
  error: E,
  setError: React.Dispatch<React.SetStateAction<E>>,
) => {
  const router = useRouter();
  const dispatch = useDispatch();

  const handleSubmission = async (
    schema: ZodTypeAny,
    apiCall: (type: U, data: FormData) => Promise<ApiResponse>,
    successRedirect: string,
  ) => {
    if (error['introVideo' as keyof T]) return;

    const validation = schema.safeParse(formData);

    const clearedState = (Object.keys(error) as Array<keyof T>).reduce(
      (acc, key) => ({ ...acc, [key]: '' }),
      {} as E,
    );

    if (!validation.success) {
      const zodErrors = validation.error.issues.reduce(
        (acc, issue) => {
          const fieldName = issue.path[0] as keyof T;
          if (fieldName in acc && !acc[fieldName]) {
            acc[fieldName] = issue.message as E[keyof T];
          }
          return acc;
        },
        { ...clearedState } as E,
      );

      setError(zodErrors);
      return;
    }

    setError(clearedState);

    const apiFormData = new FormData();
    (Object.entries(formData) as Array<[string, unknown]>).forEach(
      ([key, value]) => {
        if (value instanceof File) {
          apiFormData.append(key, value);
        } else if (Array.isArray(value)) {
          value.forEach((item) => apiFormData.append(`${key}[]`, String(item)));
        } else if (value !== null && value !== undefined) {
          apiFormData.append(key, String(value));
        }
      },
    );

    try {
      const res = await apiCall(userType, apiFormData);

      if (res.user) {
        dispatch(
          signIn({
            id: res.user.id,
            name: res.user.name,
            email: res.user.email,
            role: res.user.role,
          }),
        );
      }

      utterToast.success(res.message);
      router.push(successRedirect);
    } catch (err: unknown) {
      const message: string = errorHandler(err);

      if (message.startsWith('Session expired'))
        router.replace(`/signup?mode=${userType}`);

      utterToast.error(message);
    }
  };

  return { handleSubmission };
};
