import express, { Request, Response } from 'express';
import passport from 'passport';
import { DataValidatorService } from '~concrete-services/DataValidatorService';
import { HashService } from '~concrete-services/HashService';
import { JwtService } from '~concrete-services/JwtService';
import { OtpService } from '~concrete-services/OtpService';
import { env } from '~config/env';
import { AuthController } from '~controllers/tutor/AuthController';
import { ForgotPasswordController } from '~controllers/shared/ForgotPasswordController';
import { TutorGoogleAuthController } from '~controllers/tutor/TutorGoogleAuthController';
import { OtpController } from '~controllers/tutor/OtpController';
import { SignoutController } from '~controllers/shared/SignoutController';
import { Tutor } from '~entities/Tutor';
import { PendingTutorRepository } from '~concrete-repositories/PendingTutorRepository';
import { TutorRepository } from '~concrete-repositories/TutorRepository';
import { Authenticate } from '~middlewares/Authenticate';
import { AuthMiddlewareBundler } from '~middlewares/AuthMiddlewareBundler';
import { Authorize } from '~middlewares/Authorize';
import { ITutor } from '~models/TutorModel';
import { GetEntityDataUseCase } from '~use-cases/shared/GetEntityDataUseCase';
import { RegisterTutorFromPendingUseCase } from '~use-cases/tutor/auth/RegisterTutorFromPendingUseCase';
import { RegisterTutorUseCase } from '~use-cases/tutor/auth/RegisterTutorUseCase';
import { SigninTutorUseCase } from '~use-cases/tutor/auth/SigninTutorUseCase';
import { TutorGoogleAuthUseCase } from '~use-cases/tutor/auth/TutorGoogleAuthUseCase';
import { ForgotPasswordOtpVerifyUseCase } from '~use-cases/tutor/tutor-management/ForgotPasswordOtpVerifyUseCase';
import { ForgotPasswordUseCase } from '~use-cases/tutor/tutor-management/ForgotPasswordUseCase';
import { ResetPasswordUseCase } from '~use-cases/tutor/tutor-management/ResetPasswordUseCase';
import { SendOtpUseCase } from '~use-cases/tutor/tutor-management/SendOtpUseCase';
import { VerifyOtpUseCase } from '~use-cases/tutor/tutor-management/VerifyOtpUseCase';
import { uploadMiddleware } from '~middlewares/multer';
import { VideoMetadataService } from '~concrete-services/VideoMetadataService';
import { UploadTutorFilesUseCase } from '~use-cases/tutor/tutor-management/UploadTutorFilesUseCase';
import { S3Service } from '~concrete-services/S3Service';
import { UpdateTutorFilesUseCase } from '~use-cases/tutor/tutor-management/UpdateTutorFilesUseCase';
import { GetDataController } from '~controllers/tutor/GetDataController';
import { GetDataUseCase } from '~use-cases/tutor/tutor-management/GetDataUseCase';

// repositories
const tutorRepository = new TutorRepository();
const pendingTutorRepository = new PendingTutorRepository();

// services
const otpService = new OtpService(env.APP_EMAIL, env.GOOGLE_APP_PASSWORD);
const dataValidatorService = new DataValidatorService();
const hashService = new HashService();
const jwtService = new JwtService();
const videoMetadataService = new VideoMetadataService();
const s3Service = new S3Service({
  region: env.AWS_REGION,
  bucket: env.AWS_BUCKET,
  accessKeyId: env.AWS_ACCESS_KEY_ID,
  secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
});

// use-cases
const registerTutorUseCase = new RegisterTutorUseCase(
  tutorRepository,
  pendingTutorRepository,
  hashService,
);
const sendOtpUseCase = new SendOtpUseCase(otpService, pendingTutorRepository);
const verifyOtpUseCase = new VerifyOtpUseCase(
  otpService,
  pendingTutorRepository,
);
const registerTutorFromPendingUseCase = new RegisterTutorFromPendingUseCase(
  pendingTutorRepository,
  tutorRepository,
);
const forgotPasswordUseCase = new ForgotPasswordUseCase(
  tutorRepository,
  pendingTutorRepository,
);
const forgotPasswordOtpVerifyUseCase = new ForgotPasswordOtpVerifyUseCase(
  pendingTutorRepository,
  otpService,
  jwtService,
);
const resetPasswordUseCase = new ResetPasswordUseCase(
  jwtService,
  tutorRepository,
  hashService,
);
const tutorGoogleAuthUseCase = new TutorGoogleAuthUseCase(
  tutorRepository,
  jwtService,
);
const signinTutorUseCase = new SigninTutorUseCase(
  tutorRepository,
  hashService,
  jwtService,
);
const uploadTutorFilesUseCase = new UploadTutorFilesUseCase(
  s3Service,
  pendingTutorRepository,
);
const updateTutorFilesUseCase = new UpdateTutorFilesUseCase(s3Service);
const getDataUseCase = new GetDataUseCase(tutorRepository);

// shared use cases
const getTutorDataUseCase = new GetEntityDataUseCase<Tutor, ITutor>(
  tutorRepository,
);

// controllers
const authController = new AuthController(
  registerTutorUseCase,
  signinTutorUseCase,
  dataValidatorService,
  sendOtpUseCase,
  videoMetadataService,
  uploadTutorFilesUseCase,
);
const otpController = new OtpController(
  verifyOtpUseCase,
  sendOtpUseCase,
  registerTutorFromPendingUseCase,
  updateTutorFilesUseCase,
);
const forgotPasswordController = new ForgotPasswordController(
  forgotPasswordUseCase,
  sendOtpUseCase,
  forgotPasswordOtpVerifyUseCase,
  dataValidatorService,
  resetPasswordUseCase,
);
const tutorGoogleAuthController = new TutorGoogleAuthController(
  tutorGoogleAuthUseCase,
);
const signoutController = new SignoutController();
const getDataController = new GetDataController(getDataUseCase);

// wire auth middlewares
const authenticate = new Authenticate<Tutor>(jwtService, getTutorDataUseCase);
const authorize = new Authorize();
const auth = new AuthMiddlewareBundler(authenticate, authorize, 'tutor');

const router = express.Router();

// google auth
router.get(
  '/auth/google',
  passport.authenticate('google-tutor', { scope: ['profile', 'email'] }),
);
router.get(
  '/auth/google/callback',
  passport.authenticate('google-tutor', {
    failureRedirect: '/signin',
    session: false,
  }),
  (req, res, next) => tutorGoogleAuthController.handleSuccess(req, res, next),
);

// auth
router.post('/signup', uploadMiddleware, authController.register);
router.post('/signin', authController.signin);

// tutor management
router.post('/verify-otp', otpController.verify);
router.patch('/resend-otp', otpController.resend);
router.post('/verify-email', forgotPasswordController.registerForgotPassword);
router.post(
  '/forgot-password-otp-verify',
  forgotPasswordController.ForgotPasswordOtpVerify,
);
router.patch('/reset-password', forgotPasswordController.resetPassword);
router.post('/signout', signoutController.signout);
router.get(
  '/get-account-details/:tutorEmail',
  auth.verify(),
  getDataController.getAccountDetails,
);
router.patch('/update-profile', getDataController.getAccountDetails);

// home
router.get('/tutors', auth.verify(), (req: Request, res: Response) =>
  res.end('tutors'),
);

export const tutorRouter = router;
