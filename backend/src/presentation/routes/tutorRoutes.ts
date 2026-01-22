import express from 'express';
import passport from 'passport';
import { DataValidatorService } from '~concrete-services/DataValidatorService';
import { HashService } from '~concrete-services/HashService';
import { JwtService } from '~concrete-services/JwtService';
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
import { TutorGoogleSigninUseCase } from '~use-cases/tutor/auth/TutorGoogleSigninUseCase';
import { ForgotPasswordOtpVerifyUseCase } from '~use-cases/tutor/tutor-management/ForgotPasswordOtpVerifyUseCase';
import { ForgotPasswordUseCase } from '~use-cases/tutor/tutor-management/ForgotPasswordUseCase';
import { ResetPasswordUseCase } from '~use-cases/tutor/tutor-management/ResetPasswordUseCase';
import { SendOtpUseCase } from '~use-cases/tutor/tutor-management/SendOtpUseCase';
import { VerifyOtpUseCase } from '~use-cases/tutor/tutor-management/VerifyOtpUseCase';
import { uploadMiddleware } from '~middlewares/multer';
import { VideoMetadataService } from '~concrete-services/VideoMetadataService';
import { S3Service } from '~concrete-services/S3Service';
import { GetDataController } from '~controllers/tutor/GetDataController';
import { GetDataUseCase } from '~use-cases/tutor/tutor-management/GetDataUseCase';
import { AvatarController } from '~controllers/shared/AvatarController';
import { ProfileController } from '~controllers/tutor/ProfileController';
import { UpdateProfileUseCase } from '~use-cases/tutor/tutor-management/UpdateProfileUseCase';
import { ChangePasswordUseCase } from '~use-cases/tutor/tutor-management/ChangePasswordUseCase';
import { AxiosImageGatewayService } from '~concrete-services/AxiosImageGatewayService';
import { TutorGoogleRegisterUseCase } from '~use-cases/tutor/auth/TutorGoogleRegisterUseCase';
import { FinishRegisterTutorUseCase } from '~use-cases/tutor/auth/FinishRegisterTutorUseCase';
import { UploadFileUseCase } from '~use-cases/shared/UploadFileUseCase';
import { UpdateFileUseCase } from '~use-cases/shared/UpdateFileUseCase';
import { DeleteFileUseCase } from '~use-cases/shared/DeleteFileUseCase';
import { UploadAvatarUseCase } from '~use-cases/shared/UploadAvatarUseCase';
import { MailService } from '~concrete-services/MailService';

// repositories
const tutorRepository = new TutorRepository();
const pendingTutorRepository = new PendingTutorRepository();

// services
const mailService = new MailService();
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
const axiosImageGatewayService = new AxiosImageGatewayService();

// use-cases
const registerTutorUseCase = new RegisterTutorUseCase(
  tutorRepository,
  pendingTutorRepository,
  hashService,
);
const finishRegisterTutorUseCase = new FinishRegisterTutorUseCase(
  pendingTutorRepository,
  tutorRepository,
);
const sendOtpUseCase = new SendOtpUseCase(mailService, pendingTutorRepository);
const verifyOtpUseCase = new VerifyOtpUseCase(
  mailService,
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
  mailService,
  jwtService,
);
const resetPasswordUseCase = new ResetPasswordUseCase(
  jwtService,
  tutorRepository,
  hashService,
);
const tutorGoogleRegisterUseCase = new TutorGoogleRegisterUseCase(
  pendingTutorRepository,
);
const tutorGoogleSigninUseCase = new TutorGoogleSigninUseCase(
  tutorRepository,
  jwtService,
);
const signinTutorUseCase = new SigninTutorUseCase(
  tutorRepository,
  hashService,
  jwtService,
);
const uploadFileUseCase = new UploadFileUseCase(s3Service);
const updateFileUseCase = new UpdateFileUseCase(s3Service);
const getDataUseCase = new GetDataUseCase(tutorRepository);
const deleteFileUseCase = new DeleteFileUseCase(s3Service);
const updateProfileUseCase = new UpdateProfileUseCase(tutorRepository);
const changePasswordUseCase = new ChangePasswordUseCase(
  tutorRepository,
  hashService,
);
const uploadAvatarUseCase = new UploadAvatarUseCase(
  s3Service,
  axiosImageGatewayService,
);

// shared use cases
const getTutorDataUseCase = new GetEntityDataUseCase<Tutor, ITutor>(
  tutorRepository,
);

// controllers
const authController = new AuthController(
  registerTutorUseCase,
  finishRegisterTutorUseCase,
  signinTutorUseCase,
  dataValidatorService,
  sendOtpUseCase,
  videoMetadataService,
  uploadFileUseCase,
  updateFileUseCase,
);
const otpController = new OtpController(
  verifyOtpUseCase,
  sendOtpUseCase,
  registerTutorFromPendingUseCase,
  updateFileUseCase,
);
const forgotPasswordController = new ForgotPasswordController(
  forgotPasswordUseCase,
  sendOtpUseCase,
  forgotPasswordOtpVerifyUseCase,
  dataValidatorService,
  resetPasswordUseCase,
);
const tutorGoogleAuthController = new TutorGoogleAuthController(
  getDataUseCase,
  tutorGoogleRegisterUseCase,
  tutorGoogleSigninUseCase,
  uploadAvatarUseCase,
);
const signoutController = new SignoutController();
const getDataController = new GetDataController(getDataUseCase);
const avatarController = new AvatarController(
  uploadFileUseCase,
  deleteFileUseCase,
  dataValidatorService,
);
const profileController = new ProfileController(
  updateProfileUseCase,
  changePasswordUseCase,
  dataValidatorService,
);

// wire auth middlewares
const authenticate = new Authenticate<Tutor>(jwtService, getTutorDataUseCase);
const authorize = new Authorize();
const auth = new AuthMiddlewareBundler(authenticate, authorize, 'tutor');

const router = express.Router();

// google auth
router.get(
  '/auth/google',
  passport.authenticate('google-tutor', {
    scope: ['profile', 'email'],
    prompt: 'select_account',
  }),
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
router.post('/finish-signup', uploadMiddleware, authController.finishRegister);
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
router.post('/signout', auth.verify(), signoutController.signout);
router.get(
  '/get-account-details/:tutorEmail',
  auth.verify(),
  getDataController.getAccountDetails,
);
router.post(
  '/upload-avatar',
  auth.verify(),
  uploadMiddleware,
  avatarController.uploadAvatar,
);
router.delete('/delete-avatar', auth.verify(), avatarController.deleteAvatar);
router.patch('/update-profile', auth.verify(), profileController.updateProfile);
router.patch(
  '/change-password',
  auth.verify(),
  profileController.changePassword,
);

export const tutorRouter = router;
