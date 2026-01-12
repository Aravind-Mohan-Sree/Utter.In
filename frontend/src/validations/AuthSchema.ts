import { BaseSchema } from './BaseSchema';

export const SigninSchema = BaseSchema.pick({
  email: true,
  password: true,
});

export const UserSignupSchema = BaseSchema.pick({
  name: true,
  email: true,
  languages: true,
  password: true,
  confirmPassword: true,
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export const TutorSignupSchema = BaseSchema.refine(
  (data) => data.password === data.confirmPassword,
  {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  },
)
  .refine(
    (data) => {
      const video = data.introVideo;

      if (!video) return false;

      if (video instanceof FileList) {
        return video.length > 0;
      }

      if (video instanceof File) {
        return true;
      }

      return false;
    },
    {
      message: 'Intro video is required',
      path: ['introVideo'],
    },
  )
  .refine(
    (data) => {
      const cert = data.certificate;

      if (!cert) return false;

      if (cert instanceof FileList) {
        return cert.length > 0;
      }

      if (cert instanceof File) {
        return true;
      }

      return false;
    },
    {
      message: 'Certificate is required',
      path: ['certificate'],
    },
  );

export const ForgotPasswordSchema = BaseSchema.pick({
  email: true,
});

export const ResetPasswordSchema = BaseSchema.pick({
  password: true,
  confirmPassword: true,
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});
