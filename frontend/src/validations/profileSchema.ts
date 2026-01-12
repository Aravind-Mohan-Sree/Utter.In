import { BaseSchema } from './BaseSchema';

export const userProfileUpdateSchema = BaseSchema.pick({
  name: true,
  bio: true,
  languages: true,
});

export const tutorProfileUpdateSchema = BaseSchema.pick({
  name: true,
  bio: true,
  languages: true,
  experience: true,
});

export const changePasswordSchema = BaseSchema.pick({
  currentPassword: true,
  password: true,
  confirmPassword: true,
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});
