import {
  IValidateDataService,
  ValidatedData,
} from '~service-interfaces/IValidateDataService';
import * as z from 'zod';

const toValidatedData = (data: z.ZodSafeParseResult<object>) => {
  return {
    success: data.success,
    message: data.error?.issues[0]?.message || 'Validation failed',
  };
};

const FileListSafe =
  typeof FileList !== 'undefined' ? FileList : class FileList {};
const FileSafe = typeof File !== 'undefined' ? File : class File {};

const FileSchema = z
  .union([z.instanceof(FileListSafe), z.instanceof(FileSafe)])
  .refine((file) => {
    const fileObj =
      file instanceof FileListSafe ? (file as unknown as File[])[0] : file;
    const standardFileObj = fileObj as File;

    if (fileObj) return standardFileObj.size <= 5000000; // 5MB(5000000) max

    return true;
  }, 'File too large');

export class DataValidatorService implements IValidateDataService {
  validateName(name: string): ValidatedData {
    const nameSchema = z.object({
      name: z
        .string()
        .trim()
        .nonempty('Name is required.')
        .regex(/^((?!\s{2,}).)*$/, "Name can't include consecutive space")
        .regex(/^\D*$/, "Name can't include numbers")
        .regex(/^[a-zA-Z0-9 ]*$/, "Name can't include special characters")
        .transform((val) => val.replace(/\s+/g, ''))
        .refine((val) => val.length >= 3, {
          message: 'Name minimum length is 3.',
        })
        .refine((val) => val.length <= 16, {
          message: 'Name maximum length is 16.',
        }),
    });

    return toValidatedData(nameSchema.safeParse({ name }));
  }

  validateEmail(email: string): ValidatedData {
    const emailSchema = z.object({
      email: z
        .string()
        .trim()
        .nonempty('Email is required')
        .regex(/^\S*$/, "Email can't include space")
        .regex(
          /^(?![0-9]+@)([a-z0-9._+-]+)@([a-z]+)\.com$/,
          'Invalid email format',
        ),
    });

    return toValidatedData(emailSchema.safeParse({ email }));
  }

  validateKnownLanguages(knownLanguages: string[]): ValidatedData {
    const languagesSchema = z.object({
      knownLanguages: z
        .array(z.string().trim().nonempty('Language cannot be empty'))
        .min(1, 'At least one language is required')
        .max(3, 'Maximum three languages allowed'),
    });

    return toValidatedData(languagesSchema.safeParse({ knownLanguages }));
  }

  validateExperience(experience: string): ValidatedData {
    const experienceSchema = z.object({
      experience: z.enum(['0-1', '1-2', '2-3', '3-5', '5-10', '10+'], {
        message: 'Please select a valid experience range',
      }),
    });

    return toValidatedData(experienceSchema.safeParse({ experience }));
  }

  validateIntroVideo(introVideo: File): ValidatedData {
    const introVideoSchema = z
      .object({
        introVideo: z.nullable(FileSchema).or(z.undefined()),
      })
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
      );

    return toValidatedData(introVideoSchema.safeParse({ introVideo }));
  }

  validateCertificate(certificate: File): ValidatedData {
    const certificateSchema = z
      .object({
        certificate: z.nullable(FileSchema).or(z.undefined()),
      })
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

    return toValidatedData(certificateSchema.safeParse({ certificate }));
  }

  validatePassword(password: string): ValidatedData {
    const passwordSchema = z.object({
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
    });

    return toValidatedData(passwordSchema.safeParse({ password }));
  }

  validateOtp(otp: string): ValidatedData {
    const otpSchema = z.object({
      otp: z
        .string()
        .length(6, { message: 'OTP must be 6 digits long' })
        .regex(/^\d{6}$/, { message: 'OTP must contain only digits' }),
    });

    return toValidatedData(otpSchema.safeParse({ otp }));
  }
}
