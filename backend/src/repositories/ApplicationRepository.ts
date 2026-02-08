import { Op } from 'sequelize';
import Application, { ApplicationStatus } from '../models/Application';
import ApplicationStatusHistory from '../models/ApplicationStatusHistory';
import User from '../models/User';
import Job from '../models/Job';
import Company from '../models/Company';
import { CreateApplicationDTO, UpdateApplicationDTO, ApplicationFilterDTO, PaginatedResult } from '../types/application.types';

class ApplicationRepository {
  async create(candidateId: string, data: CreateApplicationDTO): Promise<Application> {
    return await Application.create({
      candidateId,
      ...data
    } as any);
  }

  async findById(id: string): Promise<Application | null> {
    return await Application.findByPk(id, {
      include: [
        {
          model: User,
          as: 'candidate',
          attributes: ['id', 'name', 'email', 'phone', 'address', 'experience', 'avatarUrl']
        },
        {
          model: Job,
          as: 'job',
          include: [{ model: Company, as: 'company' }]
        }
      ]
    });
  }

  async update(id: string, data: UpdateApplicationDTO): Promise<Application | null> {
    const application = await Application.findByPk(id);
    if (!application) return null;

    await application.update(data);
    return application;
  }

  async updateStatus(id: string, status: ApplicationStatus, changedBy?: string): Promise<Application | null> {
    const application = await Application.findByPk(id);
    if (!application) return null;

    await application.update({ status });

    // Lưu lịch sử thay đổi status
    await ApplicationStatusHistory.create({
      applicationId: id,
      status,
      changedBy
    } as any);

    return application;
  }

  async findDuplicate(candidateId: string, jobId: string, cvId: string): Promise<Application | null> {
    return await Application.findOne({
      where: {
        candidateId,
        jobId,
        cvId
      }
    });
  }

  async countByUserId(candidateId: string): Promise<number> {
    return await Application.count({
      where: { candidateId }
    });
  }

  async listByCandidateId(candidateId: string, filters: ApplicationFilterDTO): Promise<PaginatedResult<Application>> {
    const { status, dateFrom, dateTo, page, limit } = filters;
    const offset = (page - 1) * limit;

    const where: any = { candidateId };

    if (status) where.status = status;
    if (dateFrom) where.appliedAt = { [Op.gte]: dateFrom };
    if (dateTo) {
      where.appliedAt = where.appliedAt || {};
      where.appliedAt[Op.lte] = dateTo;
    }

    const { count, rows } = await Application.findAndCountAll({
      where,
      include: [
        {
          model: Job,
          as: 'job',
          include: [{ model: Company, as: 'company' }]
        }
      ],
      order: [['appliedAt', 'DESC']],
      limit,
      offset
    });

    return {
      items: rows,
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit)
    };
  }

  async listByJobId(jobId: string, filters: ApplicationFilterDTO): Promise<PaginatedResult<Application>> {
    const { status, dateFrom, dateTo, page, limit } = filters;
    const offset = (page - 1) * limit;

    const where: any = { jobId };

    if (status) where.status = status;
    if (dateFrom) where.appliedAt = { [Op.gte]: dateFrom };
    if (dateTo) {
      where.appliedAt = where.appliedAt || {};
      where.appliedAt[Op.lte] = dateTo;
    }

    const { count, rows } = await Application.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'candidate',
          attributes: ['id', 'name', 'email', 'phone', 'address', 'experience', 'avatarUrl']
        }
      ],
      order: [['appliedAt', 'DESC']],
      limit,
      offset
    });

    return {
      items: rows,
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit)
    };
  }

  async getStatusHistory(applicationId: string): Promise<ApplicationStatusHistory[]> {
    return await ApplicationStatusHistory.findAll({
      where: { applicationId },
      order: [['changedAt', 'DESC']]
    });
  }
}

export default new ApplicationRepository();
