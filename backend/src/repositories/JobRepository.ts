import { Op } from 'sequelize';
import Job, { JobStatus } from '../models/Job';
import Company from '../models/Company';
import { CreateJobDTO, UpdateJobDTO, SearchJobDTO, JobFilterDTO, PaginatedResult, JobDTO } from '../types/job.types';

class JobRepository {
  async create(data: CreateJobDTO): Promise<Job> {
    return await Job.create(data as any);
  }

  async findById(id: string): Promise<Job | null> {
    return await Job.findByPk(id, {
      include: [{ model: Company, as: 'company' }]
    });
  }

  async update(id: string, data: UpdateJobDTO): Promise<Job | null> {
    const job = await Job.findByPk(id);
    if (!job) return null;
    
    await job.update(data);
    return job;
  }

  async updateStatus(id: string, status: JobStatus): Promise<Job | null> {
    const job = await Job.findByPk(id);
    if (!job) return null;
    
    await job.update({ status });
    return job;
  }

  async updateVIPStatus(id: string, vipFlag: boolean, vipExpiresAt?: Date): Promise<Job | null> {
    const job = await Job.findByPk(id);
    if (!job) return null;
    
    await job.update({ vipFlag, vipExpiresAt });
    return job;
  }

  async softDelete(id: string): Promise<boolean> {
    const job = await Job.findByPk(id);
    if (!job) return false;
    
    await job.update({ status: 'deleted' });
    return true;
  }

  async search(query: SearchJobDTO): Promise<PaginatedResult<Job>> {
    const { keyword, industry, location, salaryMin, salaryMax, vipOnly, page, limit } = query;
    const offset = (page - 1) * limit;

    const where: any = {
      status: 'approved'
    };

    // Full-text search
    if (keyword) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${keyword}%` } },
        { description: { [Op.iLike]: `%${keyword}%` } },
        { requirements: { [Op.iLike]: `%${keyword}%` } }
      ];
    }

    if (location) {
      where.location = { [Op.iLike]: `%${location}%` };
    }

    if (vipOnly) {
      where.vipFlag = true;
    }

    const { count, rows } = await Job.findAndCountAll({
      where,
      include: [{ model: Company, as: 'company' }],
      order: [
        ['vipFlag', 'DESC'],
        ['createdAt', 'DESC']
      ],
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

  async list(filters: JobFilterDTO): Promise<PaginatedResult<Job>> {
    const { companyId, status, vipFlag, page, limit } = filters;
    const offset = (page - 1) * limit;

    const where: any = {};

    if (companyId) where.companyId = companyId;
    if (status) where.status = status;
    if (vipFlag !== undefined) where.vipFlag = vipFlag;

    const { count, rows } = await Job.findAndCountAll({
      where,
      include: [{ model: Company, as: 'company' }],
      order: [
        ['vipFlag', 'DESC'],
        ['createdAt', 'DESC']
      ],
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

  async listByCompanyIds(companyIds: string[], filters: JobFilterDTO): Promise<PaginatedResult<Job>> {
    const { status, vipFlag, page, limit } = filters;
    const offset = (page - 1) * limit;

    const where: any = {
      companyId: { [Op.in]: companyIds }
    };

    if (status) where.status = status;
    if (vipFlag !== undefined) where.vipFlag = vipFlag;

    const { count, rows } = await Job.findAndCountAll({
      where,
      include: [{ model: Company, as: 'company' }],
      order: [
        ['vipFlag', 'DESC'],
        ['createdAt', 'DESC']
      ],
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

  async findExpiredJobs(): Promise<Job[]> {
    return await Job.findAll({
      where: {
        deadline: { [Op.lt]: new Date() },
        status: { [Op.in]: ['approved', 'pending'] }
      }
    });
  }
}

export default new JobRepository();
