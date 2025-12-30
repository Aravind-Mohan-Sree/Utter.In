import { BaseAuthSchema } from './AuthSchema';

export const userProfileUpdateSchema = BaseAuthSchema.pick({
  name: true,
  bio: true,
  languages: true,
});

export const tutorProfileUpdateSchema = BaseAuthSchema.pick({
  name: true,
  bio: true,
  languages: true,
  experience: true,
});

export const changePasswordSchema = BaseAuthSchema.pick({
  currentPassword: true,
  password: true,
  confirmPassword: true,
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});
