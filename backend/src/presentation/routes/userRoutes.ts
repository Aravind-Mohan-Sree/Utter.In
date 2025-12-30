import express, { Request, Response } from 'express';
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
import { UserGoogleAuthUseCase } from '~use-cases/user/auth/UserGoogleAuthUseCase';
import { ForgotPasswordOtpVerifyUseCase } from '~use-cases/user/user-management/ForgotPasswordOtpVerifyUseCase';
import { ForgotPasswordUseCase } from '~use-cases/user/user-management/ForgotPasswordUseCase';
import { ResetPasswordUseCase } from '~use-cases/user/user-management/ResetPasswordUseCase';
import { SendOtpUseCase } from '~use-cases/user/user-management/SendOtpUseCase';
import { VerifyOtpUseCase } from '~use-cases/user/user-management/VerifyOtpUseCase';
import { uploadMiddleware } from '~middlewares/multer';
import { GetDataController } from '~controllers/user/GetDataController';
import { GetDataUseCase } from '~use-cases/user/user-management/GetDataUseCase';

// repositories
const userRepository = new UserRepository();
const pendingUserRepository = new PendingUserRepository();

// services
const otpService = new OtpService(env.APP_EMAIL, env.GOOGLE_APP_PASSWORD);
const dataValidatorService = new DataValidatorService();
const hashService = new HashService();
const jwtService = new JwtService();

// use-cases
const registerUserUseCase = new RegisterUserUseCase(
  userRepository,
  pendingUserRepository,
  hashService,
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
const userGoogleAuthUseCase = new UserGoogleAuthUseCase(
  userRepository,
  jwtService,
);
const signinUserUseCase = new SigninUserUseCase(
  userRepository,
  hashService,
  jwtService,
);
const getDataUseCase = new GetDataUseCase(userRepository);

// shared use cases
const getUserDataUseCase = new GetEntityDataUseCase<User, IUser>(
  userRepository,
);

// controllers
const authController = new AuthController(
  registerUserUseCase,
  signinUserUseCase,
  dataValidatorService,
  sendOtpUseCase,
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
  userGoogleAuthUseCase,
);
const signoutController = new SignoutController();
const getDataController = new GetDataController(getDataUseCase);

// wire auth middlewares
const authenticate = new Authenticate<User>(jwtService, getUserDataUseCase);
const authorize = new Authorize();
const auth = new AuthMiddlewareBundler(authenticate, authorize, 'user');

const router = express.Router();

// google auth
router.get(
  '/auth/google',
  passport.authenticate('google-user', { scope: ['profile', 'email'] }),
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
router.patch('/update-profile', getDataController.getAccountDetails);

// home
router.get('/users', auth.verify(), (req: Request, res: Response) =>
  res.end('users'),
);

export const userRouter = router;
