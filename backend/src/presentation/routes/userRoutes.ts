import express from 'express';
import passport from 'passport';
import { DataValidatorService } from '~concrete-services/DataValidatorService';
import { HashService } from '~concrete-services/HashService';
import { JwtService } from '~concrete-services/JwtService';
import { OtpService } from '~concrete-services/OtpService';
import { env } from '~config/env';
import { AuthController } from '~controllers/user/AuthController';
import { ForgotPasswordController } from '~controllers/shared/ForgotPasswordController';
import { UserGoogleAuthController } from '~controllers/user/UserGoogleAuthController';
import { OtpController } from '~controllers/user/OtpController';
import { SignoutController } from '~controllers/shared/SignoutController';
import { User } from '~entities/User';
import { PendingUserRepository } from '~concrete-repositories/PendingUserRepository';
import { UserRepository } from '~concrete-repositories/UserRepository';
import { Authenticate } from '~middlewares/Authenticate';
import { AuthMiddlewareBundler } from '~middlewares/AuthMiddlewareBundler';
import { Authorize } from '~middlewares/Authorize';
import { IUser } from '~models/UserModel';
import { GetEntityDataUseCase } from '~use-cases/shared/GetEntityDataUseCase';
import { RegisterUserFromPendingUseCase } from '~use-cases/user/auth/RegisterUserFromPendingUseCase';
import { RegisterUserUseCase } from '~use-cases/user/auth/RegisterUserUseCase';
import { SigninUserUseCase } from '~use-cases/user/auth/SigninUserUseCase';
import { UserGoogleSigninUseCase } from '~use-cases/user/auth/UserGoogleSigninUseCase';
import { ForgotPasswordOtpVerifyUseCase } from '~use-cases/user/user-management/ForgotPasswordOtpVerifyUseCase';
import { ForgotPasswordUseCase } from '~use-cases/user/user-management/ForgotPasswordUseCase';
import { ResetPasswordUseCase } from '~use-cases/user/user-management/ResetPasswordUseCase';
import { SendOtpUseCase } from '~use-cases/user/user-management/SendOtpUseCase';
import { VerifyOtpUseCase } from '~use-cases/user/user-management/VerifyOtpUseCase';
import { uploadMiddleware } from '~middlewares/multer';
import { GetDataController } from '~controllers/user/GetDataController';
import { GetDataUseCase } from '~use-cases/user/user-management/GetDataUseCase';
import { AvatarController } from '~controllers/shared/AvatarController';
import { S3Service } from '~concrete-services/S3Service';
import { UpdateProfileUseCase } from '~use-cases/user/user-management/UpdateProfileUseCase';
import { ChangePasswordUseCase } from '~use-cases/user/user-management/ChangePasswordUseCase';
import { ProfileController } from '~controllers/user/ProfileController';
import { AxiosImageGatewayService } from '~concrete-services/AxiosImageGatewayService';
import { UserGoogleRegisterUseCase } from '~use-cases/user/auth/UserGoogleRegisterUseCase';
import { UploadFileUseCase } from '~use-cases/shared/UploadFileUseCase';
import { DeleteFileUseCase } from '~use-cases/shared/DeleteFileUseCase';
import { UploadAvatarUseCase } from '~use-cases/shared/UploadAvatarUseCase';
import { FinishRegisterUserUseCase } from '~use-cases/user/auth/FinishRegisterUserUseCase';
import { UpdateFileUseCase } from '~use-cases/shared/UpdateFileUseCase';

// repositories
const userRepository = new UserRepository();
const pendingUserRepository = new PendingUserRepository();

// services
const otpService = new OtpService(env.NODEMAILER_USER, env.NODEMAILER_PASS);
const dataValidatorService = new DataValidatorService();
const hashService = new HashService();
const jwtService = new JwtService();
const s3Service = new S3Service({
  region: env.AWS_REGION,
  bucket: env.AWS_BUCKET,
  accessKeyId: env.AWS_ACCESS_KEY_ID,
  secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
});
const axiosImageGatewayService = new AxiosImageGatewayService();

// use-cases
const registerUserUseCase = new RegisterUserUseCase(
  userRepository,
  pendingUserRepository,
  hashService,
);
const finishRegisterUserUseCase = new FinishRegisterUserUseCase(
  pendingUserRepository,
  userRepository,
  jwtService,
);
const sendOtpUseCase = new SendOtpUseCase(otpService, pendingUserRepository);
const verifyOtpUseCase = new VerifyOtpUseCase(
  otpService,
  pendingUserRepository,
);
const registerUserFromPendingUseCase = new RegisterUserFromPendingUseCase(
  pendingUserRepository,
  userRepository,
);
const forgotPasswordUseCase = new ForgotPasswordUseCase(
  userRepository,
  pendingUserRepository,
);
const forgotPasswordOtpVerifyUseCase = new ForgotPasswordOtpVerifyUseCase(
  pendingUserRepository,
  otpService,
  jwtService,
);
const resetPasswordUseCase = new ResetPasswordUseCase(
  jwtService,
  userRepository,
  hashService,
);
const userGoogleRegisterUseCase = new UserGoogleRegisterUseCase(
  pendingUserRepository,
);
const userGoogleSigninUseCase = new UserGoogleSigninUseCase(
  userRepository,
  jwtService,
);
const signinUserUseCase = new SigninUserUseCase(
  userRepository,
  hashService,
  jwtService,
);
const getDataUseCase = new GetDataUseCase(userRepository);
const uploadFileUseCase = new UploadFileUseCase(s3Service);
const updateFileUseCase = new UpdateFileUseCase(s3Service);
const deleteAvatarUseCase = new DeleteFileUseCase(s3Service);
const updateProfileUseCase = new UpdateProfileUseCase(userRepository);
const changePasswordUseCase = new ChangePasswordUseCase(
  userRepository,
  hashService,
);
const uploadAvatarUseCase = new UploadAvatarUseCase(
  s3Service,
  axiosImageGatewayService,
);

// shared use cases
const getUserDataUseCase = new GetEntityDataUseCase<User, IUser>(
  userRepository,
);

// controllers
const authController = new AuthController(
  registerUserUseCase,
  finishRegisterUserUseCase,
  signinUserUseCase,
  dataValidatorService,
  sendOtpUseCase,
  updateFileUseCase,
);
const otpController = new OtpController(
  verifyOtpUseCase,
  sendOtpUseCase,
  registerUserFromPendingUseCase,
);
const forgotPasswordController = new ForgotPasswordController(
  forgotPasswordUseCase,
  sendOtpUseCase,
  forgotPasswordOtpVerifyUseCase,
  dataValidatorService,
  resetPasswordUseCase,
);
const userGoogleAuthController = new UserGoogleAuthController(
  getDataUseCase,
  userGoogleRegisterUseCase,
  userGoogleSigninUseCase,
  uploadAvatarUseCase,
);
const signoutController = new SignoutController();
const getDataController = new GetDataController(getDataUseCase);
const avatarController = new AvatarController(
  uploadFileUseCase,
  deleteAvatarUseCase,
  dataValidatorService,
);
const profileController = new ProfileController(
  updateProfileUseCase,
  changePasswordUseCase,
  dataValidatorService,
);

// wire auth middlewares
const authenticate = new Authenticate<User>(jwtService, getUserDataUseCase);
const authorize = new Authorize();
const auth = new AuthMiddlewareBundler(authenticate, authorize, 'user');

const router = express.Router();

// google auth
router.get(
  '/auth/google',
  passport.authenticate('google-user', {
    scope: ['profile', 'email'],
    prompt: 'select_account',
  }),
);
router.get(
  '/auth/google/callback',
  passport.authenticate('google-user', {
    failureRedirect: '/signin',
    session: false,
  }),
  (req, res, next) => userGoogleAuthController.handleSuccess(req, res, next),
);

// auth
router.post('/signup', uploadMiddleware, authController.register);
router.post('/finish-signup', uploadMiddleware, authController.finishRegister);
router.post('/signin', authController.signin);

// user management
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
  '/get-account-details/:userEmail',
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

export const userRouter = router;
