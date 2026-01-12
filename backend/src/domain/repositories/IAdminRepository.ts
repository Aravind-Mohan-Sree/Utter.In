import { Admin } from '~entities/Admin';
import { IBaseRepository } from './IBaseRepository';
import { IAdmin } from '~models/AdminModel';

export interface IAdminRepository extends IBaseRepository<Admin, IAdmin> {}
