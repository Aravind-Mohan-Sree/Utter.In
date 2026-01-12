import { IAdmin, AdminModel } from '~models/AdminModel';
import { BaseRepository } from './BaseRepository';
import { Admin } from '~entities/Admin';
import { Document } from 'mongoose';
import { IAdminRepository } from '~repository-interfaces/IAdminRepository';

export class AdminRepository
  extends BaseRepository<Admin, IAdmin>
  implements IAdminRepository
{
  constructor() {
    super(AdminModel);
  }

  protected toSchema(entity: Admin | Partial<Admin>): IAdmin | Partial<IAdmin> {
    return {
      name: entity.name,
      email: entity.email,
      role: entity.role,
      password: entity.password,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }

  protected toEntity(doc: (IAdmin & Document<unknown>) | null): Admin | null {
    if (!doc) return null;

    return new Admin(
      doc.name,
      doc.email,
      doc.role,
      doc.password,
      String(doc._id),
      doc.createdAt,
      doc.updatedAt,
    );
  }
}
