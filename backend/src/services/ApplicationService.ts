import ApplicationRepository from '../repositories/ApplicationRepository';
import JobRepository from '../repositories/JobRepository';
import UploadedCVRepository from '../repositories/UploadedCVRepository';
import UserCVRepository from '../repositories/UserCVRepository';
import { CreateApplicationDTO, UpdateApplicationDTO, ApplicationFilterDTO, PaginatedResult, ApplicationDTO, StatusHistoryItem } from '../types/application.types';
import { ApplicationStatus } from '../models/Application';
import NotificationService from './NotificationService';

class ApplicationService {
  async createApplication(candidateId: string, data: CreateApplicationDTO): Promise<ApplicationDTO> {
    const job = await JobRepository.findById(data.jobId);
    if (!job) {
      throw new Error('Tin tuyển dụng không tồn tại');
    }

    if (job.status !== 'approved') {
      throw new Error('Tin tuyển dụng chưa được duyệt hoặc đã hết hạn');
    }

    if (new Date(job.deadline) < new Date()) {
      throw new Error('Tin tuyển dụng đã hết hạn nộp hồ sơ');
    }

    await this.validateCV(candidateId, data.cvId, data.cvType);

    const duplicate = await ApplicationRepository.findDuplicate(candidateId, data.jobId, data.cvId);
    if (duplicate) {
      throw new Error('Bạn đã ứng tuyển vào công việc này với CV này rồi');
    }

    const application = await ApplicationRepository.create(candidateId, data);
    await ApplicationRepository.updateStatus(application.id, 'submitted', candidateId);

    // Notify Employer
    try {
      const CompanyRepository = require('../repositories/CompanyRepository').default;
      const company = await CompanyRepository.findById(job.companyId);
      if (company && company.userId) {
        await NotificationService.create({
          userId: company.userId,
          title: 'Ứng viên mới',
          message: `Có ứng viên mới ứng tuyển vào vị trí ${job.title}`,
          type: 'application',
          link: `/employer/applications?jobId=${job.id}`,
          relatedId: application.id
        });
      }
    } catch (error) {
      console.error('Failed to notify employer', error);
    }

    return await this.getApplication(application.id);
  }

  async updateApplication(applicationId: string, candidateId: string, data: UpdateApplicationDTO): Promise<ApplicationDTO> {
    const application = await ApplicationRepository.findById(applicationId);
    if (!application) {
      throw new Error('Đơn ứng tuyển không tồn tại');
    }

    if (application.candidateId !== candidateId) {
      throw new Error('Bạn không có quyền cập nhật đơn ứng tuyển này');
    }

    // Allow update regardless of status (except maybe withdrawn?)
    if (application.status === 'withdrawn') {
      throw new Error('Đơn ứng tuyển đã thu hồi, vui lòng tạo đơn mới');
    }

    if (data.cvId && data.cvType) {
      await this.validateCV(candidateId, data.cvId, data.cvType);
    }

    const updatedApplication = await ApplicationRepository.update(applicationId, data);
    if (!updatedApplication) {
      throw new Error('Cập nhật thất bại');
    }

    // Reset status to submitted => "Re-apply" logic
    await ApplicationRepository.updateStatus(applicationId, 'submitted', candidateId);

    return await this.getApplication(applicationId);
  }

  async withdrawApplication(applicationId: string, candidateId: string): Promise<ApplicationDTO> {
    const application = await ApplicationRepository.findById(applicationId);
    if (!application) {
      throw new Error('Đơn ứng tuyển không tồn tại');
    }

    if (application.candidateId !== candidateId) {
      throw new Error('Bạn không có quyền thu hồi đơn ứng tuyển này');
    }

    if (application.status !== 'submitted') {
      throw new Error('Chỉ có thể thu hồi đơn ứng tuyển ở trạng thái "Đã nộp"');
    }

    await ApplicationRepository.updateStatus(applicationId, 'withdrawn', candidateId);

    return await this.getApplication(applicationId);
  }

  async getApplication(applicationId: string): Promise<ApplicationDTO> {
    const application = await ApplicationRepository.findById(applicationId);
    if (!application) {
      throw new Error('Đơn ứng tuyển không tồn tại');
    }

    return await this.toDTO(application);
  }

  async listCandidateApplications(candidateId: string, filters: ApplicationFilterDTO): Promise<PaginatedResult<ApplicationDTO>> {
    const result = await ApplicationRepository.listByCandidateId(candidateId, filters);

    const items = await Promise.all(
      result.items.map(app => this.toDTO(app))
    );

    return {
      ...result,
      items
    };
  }

  async listJobApplications(jobId: string, employerId: string, filters: ApplicationFilterDTO): Promise<PaginatedResult<ApplicationDTO>> {
    const job = await JobRepository.findById(jobId);
    if (!job) {
      throw new Error('Tin tuyển dụng không tồn tại');
    }

    const companyId = job.companyId;
    const CompanyRepository = require('../repositories/CompanyRepository').default;
    const company = await CompanyRepository.findById(companyId);

    if (!company || company.userId !== employerId) {
      throw new Error('Bạn không có quyền xem danh sách ứng tuyển của tin này');
    }

    const result = await ApplicationRepository.listByJobId(jobId, filters);

    const items = await Promise.all(
      result.items.map(app => this.toDTO(app))
    );

    return {
      ...result,
      items
    };
  }

  async listAllEmployerApplications(employerId: string, filters: ApplicationFilterDTO): Promise<PaginatedResult<ApplicationDTO>> {
    const CompanyRepository = require('../repositories/CompanyRepository').default;
    const companies = await CompanyRepository.findByUserId(employerId);

    if (!companies || companies.length === 0) {
      throw new Error('Không tìm thấy công ty của bạn');
    }

    const company = companies[0];
    const jobs = await JobRepository.listByCompanyIds([company.id], { page: 1, limit: 1000 });
    const jobIds = jobs.items.map((job: any) => job.id);

    if (jobIds.length === 0) {
      return {
        items: [],
        total: 0,
        page: filters.page || 1,
        limit: filters.limit || 10,
        totalPages: 0
      };
    }

    const result = await ApplicationRepository.listByJobIds(jobIds, filters);

    const items = await Promise.all(
      result.items.map(app => this.toDTO(app))
    );

    return {
      ...result,
      items
    };
  }

  async updateApplicationStatus(applicationId: string, employerId: string, status: ApplicationStatus, data?: any): Promise<ApplicationDTO> {
    const application = await ApplicationRepository.findById(applicationId);
    if (!application) {
      throw new Error('Đơn ứng tuyển không tồn tại');
    }

    // Verify job belongs to employer
    const CompanyRepository = require('../repositories/CompanyRepository').default;
    const companies = await CompanyRepository.findByUserId(employerId);
    if (!companies || companies.length === 0) {
      throw new Error('Không tìm thấy công ty của bạn');
    }
    const company = companies[0];

    const job = await JobRepository.findById(application.jobId);
    if (!job || job.companyId !== company.id) {
      throw new Error('Bạn không có quyền cập nhật đơn ứng tuyển này');
    }

    this.validateStatusTransition(application.status, status);

    await ApplicationRepository.updateStatus(applicationId, status, employerId, data);

    try {
      let message = `Trạng thái đơn ứng tuyển vị trí ${job.title} đã được cập nhật.`;
      let type: any = 'status_update';

      if (status === 'interview') {
        type = 'interview';
        message = `Nhà tuyển dụng đã hẹn phỏng vấn bạn cho vị trí ${job.title}. Vui lòng kiểm tra chi tiết.`;
      } else if (status === 'rejected') {
        type = 'error';
        message = `Rất tiếc, hồ sơ ứng tuyển vị trí ${job.title} của bạn chưa phù hợp.`;
      } else if (status === 'accepted') {
        type = 'success';
        message = `Chúc mừng! Bạn đã được nhận vào vị trí ${job.title}.`;
      } else if (status === 'reviewing') {
        type = 'info';
        message = `Hồ sơ cho vị trí ${job.title} của bạn đã được nhà tuyển dụng xem.`;
      }

      await NotificationService.create({
        userId: application.candidateId,
        title: 'Cập nhật trạng thái ứng tuyển',
        message,
        type,
        link: `/candidate/applications`,
        relatedId: applicationId
      });
    } catch (error) {
      console.error('Failed to send notification', error);
    }

    return await this.getApplication(applicationId);
  }

  private async validateCV(userId: string, cvId: string, cvType: 'uploaded' | 'template'): Promise<void> {
    if (cvType === 'uploaded') {
      const cv = await UploadedCVRepository.findById(cvId);
      if (!cv) {
        throw new Error('CV không tồn tại');
      }
      if (cv.userId !== userId) {
        throw new Error('CV không thuộc về bạn');
      }
    } else if (cvType === 'template') {
      const cv = await UserCVRepository.findById(cvId);
      if (!cv) {
        throw new Error('CV không tồn tại');
      }
      if (cv.userId !== userId) {
        throw new Error('CV không thuộc về bạn');
      }
    } else {
      throw new Error('Loại CV không hợp lệ');
    }
  }

  private validateStatusTransition(currentStatus: ApplicationStatus, newStatus: ApplicationStatus): void {
    if (currentStatus === 'withdrawn') {
      throw new Error('Không thể thay đổi trạng thái đơn ứng tuyển đã thu hồi');
    }

    if (newStatus === 'submitted') {
      throw new Error('Không thể chuyển trạng thái về "Đã nộp"');
    }

    if (newStatus === 'withdrawn') {
      throw new Error('Không thể chuyển trạng thái thành "Đã thu hồi"');
    }
  }

  private async toDTO(application: any): Promise<ApplicationDTO> {
    let cvUrl = '';
    let cvName = '';

    if (application.cvType === 'uploaded') {
      const cv = await UploadedCVRepository.findById(application.cvId);
      cvUrl = cv?.fileUrl || '';
      cvName = cv?.fileName || 'Uploaded CV';
    } else if (application.cvType === 'template') {
      const cv = await UserCVRepository.findById(application.cvId);
      cvUrl = (cv as any)?.pdfUrl || '';
      cvName = (cv as any)?.title || 'Jobly CV';
    }

    const statusHistory = await ApplicationRepository.getStatusHistory(application.id);

    return {
      id: application.id,
      candidateId: application.candidateId,
      candidate: application.candidate ? {
        id: application.candidate.id,
        name: application.candidate.name,
        email: application.candidate.email,
        phone: application.candidate.phone,
        role: application.candidate.role,
        status: application.candidate.status,
        address: application.candidate.address,
        experience: application.candidate.experience,
        avatarUrl: application.candidate.avatarUrl,
        createdAt: application.candidate.createdAt,
        updatedAt: application.candidate.updatedAt
      } : undefined,
      jobId: application.jobId,
      job: application.job ? {
        id: application.job.id,
        title: application.job.title,
        description: application.job.description,
        requirements: application.job.requirements,
        salary: application.job.salary,
        location: application.job.location,
        deadline: application.job.deadline,
        status: application.job.status,
        vipFlag: application.job.vipFlag,
        vipExpiresAt: application.job.vipExpiresAt,
        companyId: application.job.companyId,
        company: application.job.company ? {
          id: application.job.company.id,
          name: application.job.company.name,
          taxCode: application.job.company.taxCode,
          industry: application.job.company.industry,
          logo: application.job.company.logoUrl,
          description: application.job.company.description,
          userId: application.job.company.userId
        } : undefined,
        createdAt: application.job.createdAt,
        updatedAt: application.job.updatedAt
      } : undefined,
      cvId: application.cvId,
      cvType: application.cvType,
      cvName,
      cvUrl,
      coverLetter: application.coverLetter,
      status: application.status,
      interviewDate: application.interviewDate,
      interviewTime: application.interviewTime,
      interviewLocation: application.interviewLocation,
      interviewNote: application.interviewNote,
      createdAt: application.appliedAt,
      updatedAt: application.updatedAt,
      statusHistory: statusHistory.map((h: any) => ({
        status: h.status,
        changedAt: h.changedAt,
        changedBy: h.changedBy
      }))
    };
  }

  async getMyApplicationForJob(candidateId: string, jobId: string): Promise<any> {
    const application = await ApplicationRepository.findByCandidateAndJob(candidateId, jobId);
    if (!application) return null;
    return this.toDTO(application);
  }
}

export default new ApplicationService();
