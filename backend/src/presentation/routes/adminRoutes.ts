import express from 'express';
import { AdminRepository } from '~concrete-repositories/AdminRepository';
import { TutorRepository } from '~concrete-repositories/TutorRepository';
import { UserRepository } from '~concrete-repositories/UserRepository';
import { BookingRepository } from '~concrete-repositories/BookingRepository';
import { DataValidatorService } from '~concrete-services/DataValidatorService';
import { HashService } from '~concrete-services/HashService';
import { JwtService } from '~concrete-services/JwtService';
import { AuthController } from '~controllers/admin/AuthController';
import { TutorsController } from '~controllers/admin/TutorsController';
import { UsersController } from '~controllers/admin/UsersController';
import { Admin } from '~entities/Admin';
import { Authenticate } from '~middlewares/Authenticate';
import { AuthMiddlewareBundler } from '~middlewares/AuthMiddlewareBundler';
import { Authorize } from '~middlewares/Authorize';
import { IAdmin } from '~models/AdminModel';
import { SigninUseCase } from '~use-cases/admin/auth/SigninUseCase';
import { FetchTutorsUseCase } from '~use-cases/admin/tutors/FetchTutorsUseCase';
import { FetchUsersUseCase } from '~use-cases/admin/users/FetchUsersUseCase';
import { ToggleUserStatusUseCase } from '~use-cases/admin/users/ToggleStatusUseCase';
import { ToggleTutorStatusUseCase } from '~use-cases/admin/tutors/ToggleStatusUseCase';
import { GetEntityDataUseCase } from '~use-cases/shared/GetEntityDataUseCase';
import { ApproveUseCase } from '~use-cases/admin/tutors/ApproveUseCase';
import { RejectUseCase } from '~use-cases/admin/tutors/RejectUseCase';
import { HandleLanguageVerificationUseCase } from '~use-cases/admin/tutors/HandleLanguageVerificationUseCase';
import { S3Service } from '~concrete-services/S3Service';
import { env } from '~config/env';
import { SignoutController } from '~controllers/shared/SignoutController';
import { DeleteFileUseCase } from '~use-cases/shared/DeleteFileUseCase';
import { MailService } from '~concrete-services/MailService';
import { UpdateFileUseCase } from '~use-cases/shared/UpdateFileUseCase';
import { AbuseReportRepository } from '~concrete-repositories/AbuseReportRepository';
import { GetAbuseReportsUseCase } from '~use-cases/admin/report/GetAbuseReportsUseCase';
import { HandleAbuseReportUseCase } from '~use-cases/admin/report/HandleAbuseReportUseCase';
import { AdminAbuseReportController } from '~controllers/admin/AbuseReportController';
import { GetDashboardDataUseCase } from '~use-cases/admin/dashboard/GetDashboardDataUseCase';
import { AdminDashboardController } from '~controllers/admin/DashboardController';

// repositories
const adminRepository = new AdminRepository();
const userRepository = new UserRepository();
const tutorRepository = new TutorRepository();
const abuseReportRepository = new AbuseReportRepository();
const bookingRepository = new BookingRepository();

// services
const mailService = new MailService();
const dataValidatorService = new DataValidatorService();
const hashService = new HashService();
const jwtService = new JwtService();
const s3Service = new S3Service({
  region: env.AWS_REGION,
  bucket: env.AWS_BUCKET,
  accessKeyId: env.AWS_ACCESS_KEY_ID,
  secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
});

// use-cases
const signinUseCase = new SigninUseCase(
  adminRepository,
  jwtService,
  hashService,
);
const fetchUsersUseCase = new FetchUsersUseCase(userRepository);
const fetchTutorsUseCase = new FetchTutorsUseCase(tutorRepository);
const toggleUserStatusUseCase = new ToggleUserStatusUseCase(userRepository);
const toggleTutorStatusUseCase = new ToggleTutorStatusUseCase(tutorRepository);
const approveUseCase = new ApproveUseCase(tutorRepository, mailService);
const rejectUseCase = new RejectUseCase(tutorRepository, mailService);
const updateFileUseCase = new UpdateFileUseCase(s3Service);
const deleteFileUseCase = new DeleteFileUseCase(s3Service);
const handleLanguageVerificationUseCase = new HandleLanguageVerificationUseCase(
  tutorRepository,
  mailService,
  deleteFileUseCase,
);

const getAbuseReportsUseCase = new GetAbuseReportsUseCase(abuseReportRepository, userRepository, tutorRepository);
const handleAbuseReportUseCase = new HandleAbuseReportUseCase(abuseReportRepository, userRepository, tutorRepository, mailService);
const getDashboardDataUseCase = new GetDashboardDataUseCase(userRepository, tutorRepository, bookingRepository, abuseReportRepository);

// shared use cases
const getAdminDataUseCase = new GetEntityDataUseCase<Admin, IAdmin>(
  adminRepository,
);

// controllers
const authController = new AuthController(signinUseCase, dataValidatorService);
const signoutController = new SignoutController();
const usersController = new UsersController(
  fetchUsersUseCase,
  toggleUserStatusUseCase,
);
const tutorsController = new TutorsController(
  fetchTutorsUseCase,
  toggleTutorStatusUseCase,
  approveUseCase,
  rejectUseCase,
  handleLanguageVerificationUseCase,
  updateFileUseCase,
  deleteFileUseCase,
);
const abuseReportController = new AdminAbuseReportController(getAbuseReportsUseCase, handleAbuseReportUseCase);
const dashboardController = new AdminDashboardController(getDashboardDataUseCase);

// wire auth middlewares
const authenticate = new Authenticate<Admin>(jwtService, getAdminDataUseCase);
const authorize = new Authorize();
const auth = new AuthMiddlewareBundler(authenticate, authorize, 'admin');

const router = express.Router();

// auth
router.post('/signin', authController.signin);

// dashboard
router.get('/dashboard', auth.verify(), dashboardController.getDashboardData);

// admin management
router.post('/signout', auth.verify(), signoutController.signout);

// users management
router.get('/users', auth.verify(), usersController.fetchUsers);
router.get('/tutors', auth.verify(), tutorsController.fetchTutors);
router.patch('/users/:id/status', auth.verify(), usersController.toggleStatus);
router.patch(
  '/tutors/:id/status',
  auth.verify(),
  tutorsController.toggleStatus,
);
router.patch('/tutors/:id/approve', auth.verify(), tutorsController.approve);
router.patch('/tutors/:id/reject', auth.verify(), tutorsController.reject);
router.patch(
  '/tutors/:id/verify-languages',
  auth.verify(),
  tutorsController.handleLanguageVerification,
);

// abuse reports
router.get('/reports', auth.verify(), abuseReportController.getReports);
router.patch('/reports/:reportId', auth.verify(), abuseReportController.handleReport);

export const adminRouter = router;
