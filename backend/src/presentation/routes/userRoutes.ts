import express from 'express';
import { DataValidatorService } from '~/services/DataValidatorService';
import { HashService } from '~/services/HashService';
import { OtpService } from '~/services/OtpService';
import { env } from '~config/env';
import { AuthController } from '~controllers/user/authController';
import { VerifyOtpController } from '~controllers/user/VerifyOtpController';
import { PendingUserRepository } from '~infrastructure-repositories/PendingUserRepository';
import { UserRepository } from '~infrastructure-repositories/UserRepository';
import { RegisterUserFromPendingUseCase } from '~use-cases/user/auth/RegisterUserFromPendingUseCase';
import { RegisterUserUseCase } from '~use-cases/user/auth/RegisterUserUseCase';
import { SendOtpUseCase } from '~use-cases/user/auth/SendOtpUseCase';
import { VerifyOtpUseCase } from '~use-cases/user/auth/VerifyOtpUseCase';

// repositories
const userRepository = new UserRepository();
const pendingUserRepository = new PendingUserRepository();

// services
const otpService = new OtpService(env.APP_EMAIL, env.GOOGLE_APP_PASSWORD);
const dataValidatorService = new DataValidatorService();
const hashService = new HashService();

// use-cases
const registerUserUseCase = new RegisterUserUseCase(userRepository, pendingUserRepository, hashService);
const sendOtpUseCase = new SendOtpUseCase(otpService, pendingUserRepository);
const verifyOtpUseCase = new VerifyOtpUseCase(otpService, pendingUserRepository);
const registerUserFromPendingUseCase = new RegisterUserFromPendingUseCase(pendingUserRepository, userRepository);

// controllers
const authController = new AuthController(registerUserUseCase, dataValidatorService, sendOtpUseCase);
const verifyOtpController = new VerifyOtpController(verifyOtpUseCase, registerUserFromPendingUseCase);

const router = express.Router();

router.post('/signup', authController.register);
router.post('/otp', verifyOtpController.verify);

export const userRouter = router;