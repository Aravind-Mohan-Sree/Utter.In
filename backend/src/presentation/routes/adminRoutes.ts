import express from 'express';
import { AdminRepository } from '~concrete-repositories/AdminRepository';
import { UserRepository } from '~concrete-repositories/UserRepository';
import { DataValidatorService } from '~concrete-services/DataValidatorService';
import { HashService } from '~concrete-services/HashService';
import { JwtService } from '~concrete-services/JwtService';
import { AuthController } from '~controllers/admin/AuthController';
import { UsersController } from '~controllers/admin/UsersController';
import { Admin } from '~entities/Admin';
import { Authenticate } from '~middlewares/Authenticate';
import { AuthMiddlewareBundler } from '~middlewares/AuthMiddlewareBundler';
import { Authorize } from '~middlewares/Authorize';
import { IAdmin } from '~models/AdminModel';
import { SigninUseCase } from '~use-cases/admin/auth/SigninUseCase';
import { FetchUsersUseCase } from '~use-cases/admin/users/FetchUsersUseCase';
import { GetEntityDataUseCase } from '~use-cases/shared/GetEntityDataUseCase';

// repositories
const adminRepository = new AdminRepository();
const userRepository = new UserRepository();

// services
const dataValidatorService = new DataValidatorService();
const hashService = new HashService();
const jwtService = new JwtService();

// use-cases
const signinUseCase = new SigninUseCase(
  adminRepository,
  jwtService,
  hashService,
);
const fetchUsersUseCase = new FetchUsersUseCase(userRepository);

// shared use cases
const getAdminDataUseCase = new GetEntityDataUseCase<Admin, IAdmin>(
  adminRepository,
);

// controllers
const authController = new AuthController(signinUseCase, dataValidatorService);
// const signoutController = new SignoutController();
const usersController = new UsersController(fetchUsersUseCase);

// wire auth middlewares
const authenticate = new Authenticate<Admin>(jwtService, getAdminDataUseCase);
const authorize = new Authorize();
const auth = new AuthMiddlewareBundler(authenticate, authorize, 'admin');

const router = express.Router();

// auth
router.post('/signin', authController.signin);

// admin management
// router.post('/signout', auth.verify(), signoutController.signout);

// users management
router.get('/users', auth.verify(), usersController.fetchUsers);

export const adminRouter = router;
