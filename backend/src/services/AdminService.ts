import { Op } from 'sequelize';
import User from '../models/User';
import Job from '../models/Job';
import CVTemplate from '../models/CVTemplate';
import UserCV from '../models/UserCV';
import Application from '../models/Application';
import AdminLog from '../models/AdminLog';
import Company from '../models/Company';
import ReportGenerator from '../utils/ReportGenerator';
import {
  UserFilterDTO,
  CreateTemplateDTO,
  UpdateTemplateDTO,
  CVTemplateDTO,
  TemplateFilterDTO,
  StatisticsDTO,
  ReportType,
  AdminLogDTO
} from '../types/admin.types';
import { UserProfileDTO } from '../types/user.types';
import { JobDTO } from '../types/job.types';
import { PaginatedResult } from '../types/job.types';

class AdminService {
  // Ghi log admin action
  private async logAdminAction(
    adminId: string,
    action: string,
    targetType?: string,
    targetId?: string,
    details?: object
  ): Promise<void> {
    await AdminLog.create({
      adminId,
      action,
      targetType,
      targetId,
      details
    });
  }

  // Quản lý người dùng
  async listUsers(filters: UserFilterDTO): Promise<PaginatedResult<UserProfileDTO>> {
    const where: any = {};

    if (filters.role) {
      where.role = filters.role;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.keyword) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${filters.keyword}%` } },
        { email: { [Op.iLike]: `%${filters.keyword}%` } }
      ];
    }

    const offset = (filters.page - 1) * filters.limit;

    const { count, rows } = await User.findAndCountAll({
      where,
      limit: filters.limit,
      offset,
      order: [['createdAt', 'DESC']]
    });

    const items: UserProfileDTO[] = rows.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
      address: user.address,
      dateOfBirth: user.dateOfBirth,
      experience: user.experience,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }));

    return {
      items,
      total: count,
      page: filters.page,
      limit: filters.limit,
      totalPages: Math.ceil(count / filters.limit)
    };
  }

  async lockUser(userId: string, reason: string, adminId: string): Promise<UserProfileDTO> {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }

    user.status = 'locked';
    await user.save();

    await this.logAdminAction(adminId, 'LOCK_USER', 'user', userId, { reason });

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
      address: user.address,
      dateOfBirth: user.dateOfBirth,
      experience: user.experience,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
  }

  async unlockUser(userId: string, adminId: string): Promise<UserProfileDTO> {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }

    user.status = 'active';
    await user.save();

    await this.logAdminAction(adminId, 'UNLOCK_USER', 'user', userId);

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
      address: user.address,
      dateOfBirth: user.dateOfBirth,
      experience: user.experience,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
  }

  async rejectUser(userId: string, adminId: string, reason: string): Promise<UserProfileDTO> {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }

    user.status = 'deleted';
    await user.save();

    await this.logAdminAction(adminId, 'REJECT_USER', 'user', userId, { reason });

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
      address: user.address,
      dateOfBirth: user.dateOfBirth,
      experience: user.experience,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
  }

  async sendWarning(userId: string, message: string, adminId: string): Promise<void> {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }

    await this.logAdminAction(adminId, 'SEND_WARNING', 'user', userId, { message });

    // TODO: Gửi notification cho user (implement sau)
  }

  async deleteUser(userId: string, adminId: string): Promise<boolean> {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }

    user.status = 'deleted';
    await user.save();

    await this.logAdminAction(adminId, 'DELETE_USER', 'user', userId);

    return true;
  }

  // Duyệt tin tuyển dụng
  async listPendingJobs(filters: any): Promise<PaginatedResult<JobDTO>> {
    const where: any = { status: 'pending' };

    const offset = (filters.page - 1) * filters.limit;

    const { count, rows } = await Job.findAndCountAll({
      where,
      include: [
        {
          model: Company,
          as: 'company'
        }
      ],
      limit: filters.limit,
      offset,
      order: [['createdAt', 'DESC']]
    });

    const items: JobDTO[] = rows.map(job => ({
      id: job.id,
      title: job.title,
      description: job.description,
      requirements: job.requirements,
      salary: job.salary,
      location: job.location,
      deadline: job.deadline,
      status: job.status,
      vipFlag: job.vipFlag,
      vipExpiresAt: job.vipExpiresAt,
      companyId: job.companyId,
      company: (job as any).company ? {
        id: (job as any).company.id,
        name: (job as any).company.name,
        taxCode: (job as any).company.taxCode,
        industry: (job as any).company.industry,
        logoUrl: (job as any).company.logoUrl,
        description: (job as any).company.description
      } : undefined,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt
    }));

    return {
      items,
      total: count,
      page: filters.page,
      limit: filters.limit,
      totalPages: Math.ceil(count / filters.limit)
    };
  }

  async approveJob(jobId: string, adminId: string): Promise<JobDTO> {
    const job = await Job.findByPk(jobId, {
      include: [{ model: Company, as: 'company' }]
    });

    if (!job) {
      throw new Error('Job not found');
    }

    job.status = 'approved';
    await job.save();

    await this.logAdminAction(adminId, 'APPROVE_JOB', 'job', jobId);

    // TODO: Gửi notification cho Employer (implement sau)

    return {
      id: job.id,
      title: job.title,
      description: job.description,
      requirements: job.requirements,
      salary: job.salary,
      location: job.location,
      deadline: job.deadline,
      status: job.status,
      vipFlag: job.vipFlag,
      vipExpiresAt: job.vipExpiresAt,
      companyId: job.companyId,
      company: (job as any).company ? {
        id: (job as any).company.id,
        name: (job as any).company.name,
        taxCode: (job as any).company.taxCode,
        industry: (job as any).company.industry,
        logoUrl: (job as any).company.logoUrl,
        description: (job as any).company.description
      } : undefined,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt
    };
  }

  async rejectJob(jobId: string, adminId: string, reason: string): Promise<JobDTO> {
    const job = await Job.findByPk(jobId, {
      include: [{ model: Company, as: 'company' }]
    });

    if (!job) {
      throw new Error('Job not found');
    }

    job.status = 'rejected';
    await job.save();

    await this.logAdminAction(adminId, 'REJECT_JOB', 'job', jobId, { reason });

    // TODO: Gửi notification cho Employer (implement sau)

    return {
      id: job.id,
      title: job.title,
      description: job.description,
      requirements: job.requirements,
      salary: job.salary,
      location: job.location,
      deadline: job.deadline,
      status: job.status,
      vipFlag: job.vipFlag,
      vipExpiresAt: job.vipExpiresAt,
      companyId: job.companyId,
      company: (job as any).company ? {
        id: (job as any).company.id,
        name: (job as any).company.name,
        taxCode: (job as any).company.taxCode,
        industry: (job as any).company.industry,
        logoUrl: (job as any).company.logoUrl,
        description: (job as any).company.description
      } : undefined,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt
    };
  }

  // Quản lý CV Templates
  async createTemplate(data: CreateTemplateDTO, adminId: string): Promise<CVTemplateDTO> {
    const template = await CVTemplate.create({
      name: data.name,
      category: data.category,
      structureJSON: data.structureJSON,
      htmlTemplate: data.htmlTemplate,
      cssStyles: data.cssStyles,
      previewImageUrl: data.previewImageUrl
    });

    await this.logAdminAction(adminId, 'CREATE_TEMPLATE', 'cv_template', template.id);

    return {
      id: template.id,
      name: template.name,
      category: template.category,
      structureJSON: template.structureJSON as any,
      htmlTemplate: template.htmlTemplate,
      cssStyles: template.cssStyles,
      previewImageUrl: template.previewImageUrl,
      createdAt: template.createdAt
    };
  }

  async updateTemplate(
    templateId: string,
    data: UpdateTemplateDTO,
    adminId: string
  ): Promise<CVTemplateDTO> {
    const template = await CVTemplate.findByPk(templateId);
    if (!template) {
      throw new Error('Template not found');
    }

    if (data.name) template.name = data.name;
    if (data.category) template.category = data.category;
    if (data.structureJSON) template.structureJSON = data.structureJSON as any;
    if (data.htmlTemplate) template.htmlTemplate = data.htmlTemplate;
    if (data.cssStyles) template.cssStyles = data.cssStyles;
    if (data.previewImageUrl) template.previewImageUrl = data.previewImageUrl;

    await template.save();

    await this.logAdminAction(adminId, 'UPDATE_TEMPLATE', 'cv_template', templateId);

    return {
      id: template.id,
      name: template.name,
      category: template.category,
      structureJSON: template.structureJSON as any,
      htmlTemplate: template.htmlTemplate,
      cssStyles: template.cssStyles,
      previewImageUrl: template.previewImageUrl,
      createdAt: template.createdAt
    };
  }

  async deleteTemplate(templateId: string, adminId: string): Promise<boolean> {
    const template = await CVTemplate.findByPk(templateId);
    if (!template) {
      throw new Error('Template not found');
    }

    // Kiểm tra có User_CV nào đang dùng không
    const userCVCount = await UserCV.count({ where: { templateId } });
    if (userCVCount > 0) {
      throw new Error('Cannot delete template: currently in use by user CVs');
    }

    await template.destroy();

    await this.logAdminAction(adminId, 'DELETE_TEMPLATE', 'cv_template', templateId);

    return true;
  }

  async listTemplates(filters: TemplateFilterDTO): Promise<PaginatedResult<CVTemplateDTO>> {
    const where: any = {};

    if (filters.category) {
      where.category = filters.category;
    }

    const offset = (filters.page - 1) * filters.limit;

    const { count, rows } = await CVTemplate.findAndCountAll({
      where,
      limit: filters.limit,
      offset,
      order: [['createdAt', 'DESC']]
    });

    const items: CVTemplateDTO[] = rows.map(template => ({
      id: template.id,
      name: template.name,
      category: template.category,
      structureJSON: template.structureJSON as any,
      htmlTemplate: template.htmlTemplate,
      cssStyles: template.cssStyles,
      previewImageUrl: template.previewImageUrl,
      createdAt: template.createdAt
    }));

    return {
      items,
      total: count,
      page: filters.page,
      limit: filters.limit,
      totalPages: Math.ceil(count / filters.limit)
    };
  }

  // Báo cáo thống kê
  async getStatistics(dateFrom: Date, dateTo: Date): Promise<StatisticsDTO> {
    // Tổng số users
    const totalUsers = await User.count({ where: { status: { [Op.ne]: 'deleted' } } });
    const totalCandidates = await User.count({
      where: { role: 'candidate', status: { [Op.ne]: 'deleted' } }
    });
    const totalEmployers = await User.count({
      where: { role: 'employer', status: { [Op.ne]: 'deleted' } }
    });

    // Tổng số jobs
    const totalJobs = await Job.count({ where: { status: { [Op.ne]: 'deleted' } } });

    // Tổng số applications
    const totalApplications = await Application.count();

    // Biểu đồ users mới theo ngày
    const newUsersChart = await this.getChartData(
      User,
      'createdAt',
      dateFrom,
      dateTo,
      { status: { [Op.ne]: 'deleted' } }
    );

    // Biểu đồ jobs theo ngày
    const jobsChart = await this.getChartData(
      Job,
      'createdAt',
      dateFrom,
      dateTo,
      { status: { [Op.ne]: 'deleted' } }
    );

    // Biểu đồ applications theo ngày
    const applicationsChart = await this.getChartData(Application, 'appliedAt', dateFrom, dateTo);

    return {
      totalUsers,
      totalCandidates,
      totalEmployers,
      totalJobs,
      totalApplications,
      newUsersChart,
      jobsChart,
      applicationsChart
    };
  }

  private async getChartData(
    model: any,
    dateField: string,
    dateFrom: Date,
    dateTo: Date,
    additionalWhere: any = {}
  ): Promise<any[]> {
    const columnMap: Record<string, string> = {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      appliedAt: 'applied_at',
    };
    const dbColumn = columnMap[dateField] || dateField;

    const data = await model.findAll({
      attributes: [
        [model.sequelize.fn('DATE', model.sequelize.col(dbColumn)), 'date'],
        [model.sequelize.fn('COUNT', model.sequelize.col('id')), 'value']
      ],
      where: {
        [dateField]: {
          [Op.between]: [dateFrom, dateTo]
        },
        ...additionalWhere
      },
      group: [model.sequelize.fn('DATE', model.sequelize.col(dbColumn))],
      order: [[model.sequelize.fn('DATE', model.sequelize.col(dbColumn)), 'ASC']],
      raw: true
    });

    return data.map((item: any) => ({
      date: item.date,
      value: parseInt(item.value)
    }));
  }

  async exportReport(
    type: ReportType,
    dateFrom: Date,
    dateTo: Date,
    format: 'excel' | 'pdf' = 'excel'
  ): Promise<Buffer> {
    let data: any[] = [];

    // Lấy data dựa trên type
    switch (type) {
      case 'users':
        const users = await User.findAll({
          where: {
            createdAt: { [Op.between]: [dateFrom, dateTo] },
            status: { [Op.ne]: 'deleted' }
          },
          order: [['createdAt', 'DESC']]
        });
        data = users.map(u => ({
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role,
          status: u.status,
          createdAt: u.createdAt
        }));
        break;

      case 'jobs':
        const jobs = await Job.findAll({
          where: {
            createdAt: { [Op.between]: [dateFrom, dateTo] },
            status: { [Op.ne]: 'deleted' }
          },
          include: [{ model: Company, as: 'company' }],
          order: [['createdAt', 'DESC']]
        });
        data = jobs.map(j => ({
          id: j.id,
          title: j.title,
          company: (j as any).company?.name || 'N/A',
          location: j.location,
          salary: j.salary,
          status: j.status,
          vipFlag: j.vipFlag,
          createdAt: j.createdAt
        }));
        break;

      case 'applications':
        const applications = await Application.findAll({
          where: {
            appliedAt: { [Op.between]: [dateFrom, dateTo] }
          },
          include: [
            { model: User, as: 'candidate' },
            { model: Job, as: 'job' }
          ],
          order: [['appliedAt', 'DESC']]
        });
        data = applications.map(a => ({
          id: a.id,
          candidateName: (a as any).candidate?.name || 'N/A',
          jobTitle: (a as any).job?.title || 'N/A',
          status: a.status,
          appliedAt: a.appliedAt
        }));
        break;
    }

    // Generate report
    if (format === 'excel') {
      return await ReportGenerator.generateExcel(data, type);
    } else {
      return await ReportGenerator.generatePDF(data, type);
    }
  }
}

export default new AdminService();
