import { AbuseReport } from '~entities/AbuseReport';
import { IBaseRepository } from './IBaseRepository';
import { IAbuseReport } from '~models/AbuseReportModel';

export interface IAbuseReportRepository extends IBaseRepository<AbuseReport, IAbuseReport> {
  findAllReports(page: number, limit: number, search?: string, status?: string): Promise<{ reports: AbuseReport[]; total: number }>;
  findByReporter(userId: string, page: number, limit: number, status?: string): Promise<{ reports: AbuseReport[]; total: number }>;
  getRecentReports(limit: number): Promise<AbuseReport[]>;
}
