import z from 'zod';

const FileListSafe =
  typeof FileList !== 'undefined' ? FileList : class FileList {};
const FileSafe = typeof File !== 'undefined' ? File : class File {};

const FileSchema = z
  .union([z.instanceof(FileListSafe), z.instanceof(FileSafe)])
  .refine((file) => {
    const fileObj =
      file instanceof FileListSafe ? (file as unknown as Array<File>)[0] : file;
    const standardFileObj = fileObj as File;

    if (fileObj) return standardFileObj.size <= 5000000; // 5MB(5000000) max

    return true;
  }, 'File too large');

const BaseAuthSchema = z.object({
  name: z
    .string()
    .trim()
    .nonempty('Name is required')
    .regex(/^((?!\s{2,}).)*$/, "Name can't include consecutive space")
    .regex(/^\D*$/, "Name can't include numbers")
    .regex(/^[a-zA-Z0-9 ]*$/, "Name can't include special characters")
    .transform((val) => val.replace(/\s+/g, ''))
    .refine((val) => val.length >= 3, {
      message: 'Name minimum length is 3',
    })
    .refine((val) => val.length <= 16, {
      message: 'Name maximum length is 16',
    }),

  email: z
    .string()
    .trim()
    .nonempty('Email is required')
    .regex(/^\S*$/, "Email can't include space")
    .regex(/^(?![0-9]+@)([a-z0-9]+)@([a-z]+)\.com$/, 'Invalid email format'),

  languages: z
    .array(z.string().trim().nonempty("Language can't be empty"))
    .min(1, 'Language is required')
    .max(3, 'Maximum three languages allowed'),

  experience: z
    .string()
    .min(1, 'Experience is required')
    .refine((val) => val !== '', {
      message: 'Experience is required',
    }),

  introVideo: z.nullable(FileSchema).or(z.undefined()),

  certificate: z.nullable(FileSchema).or(z.undefined()),

  password: z
    .string()
    .trim()
    .nonempty('Password is required')
    .min(8, 'Password minimum length is 8')
    .max(30, 'Password maximum length is 30')
    .regex(/^\S*$/, "Password can't include space")
    .regex(/\d/, 'Password must include a number')
    .regex(/[^\w\s]/, 'Password must include a special character')
    .regex(/(?=.*[A-Z])/, 'Password must include an uppercase character')
    .regex(/(?=.*[a-z])/, 'Password must include a lowercase character'),

  confirmPassword: z.string().trim().nonempty('Confirm password is required'),
});

export const SigninSchema = BaseAuthSchema.pick({
  email: true,
  password: true,
});

export const UserSignupSchema = BaseAuthSchema.pick({
  name: true,
  email: true,
  languages: true,
  password: true,
  confirmPassword: true,
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export const TutorSignupSchema = BaseAuthSchema.refine(
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
