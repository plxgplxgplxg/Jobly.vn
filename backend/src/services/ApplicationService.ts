import ApplicationRepository from '../repositories/ApplicationRepository';
import JobRepository from '../repositories/JobRepository';
import UploadedCVRepository from '../repositories/UploadedCVRepository';
import UserCVRepository from '../repositories/UserCVRepository';
import { CreateApplicationDTO, UpdateApplicationDTO, ApplicationFilterDTO, PaginatedResult, ApplicationDTO, StatusHistoryItem } from '../types/application.types';
import { ApplicationStatus } from '../models/Application';

class ApplicationService {
  async createApplication(candidateId: string, data: CreateApplicationDTO): Promise<ApplicationDTO> {
    // Validate job exists và active
    const job = await JobRepository.findById(data.jobId);
    if (!job) {
      throw new Error('Tin tuyển dụng không tồn tại');
    }

    if (job.status !== 'approved') {
      throw new Error('Tin tuyển dụng chưa được duyệt hoặc đã hết hạn');
    }

    // Check job not expired
    if (new Date(job.deadline) < new Date()) {
      throw new Error('Tin tuyển dụng đã hết hạn nộp hồ sơ');
    }

    // Validate CV exists
    await this.validateCV(candidateId, data.cvId, data.cvType);

    // Check duplicate application
    const duplicate = await ApplicationRepository.findDuplicate(candidateId, data.jobId, data.cvId);
    if (duplicate) {
      throw new Error('Bạn đã ứng tuyển vào công việc này với CV này rồi');
    }

    // Tạo application
    const application = await ApplicationRepository.create(candidateId, data);

    // Lưu lịch sử status ban đầu
    await ApplicationRepository.updateStatus(application.id, 'submitted', candidateId);

    // TODO: Gửi notification cho Employer

    return await this.getApplication(application.id);
  }

  async updateApplication(applicationId: string, candidateId: string, data: UpdateApplicationDTO): Promise<ApplicationDTO> {
    const application = await ApplicationRepository.findById(applicationId);
    if (!application) {
      throw new Error('Đơn ứng tuyển không tồn tại');
    }

    // Verify ownership
    if (application.candidateId !== candidateId) {
      throw new Error('Bạn không có quyền cập nhật đơn ứng tuyển này');
    }

    // Chỉ cho phép update khi status = submitted
    if (application.status !== 'submitted') {
      throw new Error('Chỉ có thể cập nhật đơn ứng tuyển ở trạng thái "Đã nộp"');
    }

    // Validate CV nếu có thay đổi
    if (data.cvId && data.cvType) {
      await this.validateCV(candidateId, data.cvId, data.cvType);
    }

    const updatedApplication = await ApplicationRepository.update(applicationId, data);
    if (!updatedApplication) {
      throw new Error('Cập nhật thất bại');
    }

    return await this.getApplication(applicationId);
  }

  async withdrawApplication(applicationId: string, candidateId: string): Promise<ApplicationDTO> {
    const application = await ApplicationRepository.findById(applicationId);
    if (!application) {
      throw new Error('Đơn ứng tuyển không tồn tại');
    }

    // Verify ownership
    if (application.candidateId !== candidateId) {
      throw new Error('Bạn không có quyền thu hồi đơn ứng tuyển này');
    }

    // Chỉ cho phép withdraw khi status = submitted
    if (application.status !== 'submitted') {
      throw new Error('Chỉ có thể thu hồi đơn ứng tuyển ở trạng thái "Đã nộp"');
    }

    await ApplicationRepository.updateStatus(applicationId, 'withdrawn', candidateId);

    // TODO: Gửi notification cho Employer

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
    // Verify job thuộc về employer
    const job = await JobRepository.findById(jobId);
    if (!job) {
      throw new Error('Tin tuyển dụng không tồn tại');
    }

    // Check ownership thông qua company - cần load company từ job
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

  async updateApplicationStatus(applicationId: string, employerId: string, status: ApplicationStatus): Promise<ApplicationDTO> {
    const application = await ApplicationRepository.findById(applicationId);
    if (!application) {
      throw new Error('Đơn ứng tuyển không tồn tại');
    }

    // Verify job thuộc về employer - cần load job và company
    const job = await JobRepository.findById(application.jobId);
    if (!job) {
      throw new Error('Tin tuyển dụng không tồn tại');
    }

    const CompanyRepository = require('../repositories/CompanyRepository').default;
    const company = await CompanyRepository.findById(job.companyId);

    if (!company || company.userId !== employerId) {
      throw new Error('Bạn không có quyền cập nhật trạng thái đơn ứng tuyển này');
    }

    // Validate status transition
    this.validateStatusTransition(application.status, status);

    await ApplicationRepository.updateStatus(applicationId, status, employerId);

    // TODO: Gửi notification cho Candidate

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
    // Không cho phép chuyển từ withdrawn
    if (currentStatus === 'withdrawn') {
      throw new Error('Không thể thay đổi trạng thái đơn ứng tuyển đã thu hồi');
    }

    // Không cho phép chuyển về submitted
    if (newStatus === 'submitted') {
      throw new Error('Không thể chuyển trạng thái về "Đã nộp"');
    }

    // Không cho phép chuyển về withdrawn (chỉ candidate mới được withdraw)
    if (newStatus === 'withdrawn') {
      throw new Error('Không thể chuyển trạng thái thành "Đã thu hồi"');
    }
  }

  private async toDTO(application: any): Promise<ApplicationDTO> {
    // Lấy CV Info
    let cvUrl = '';
    let cvName = '';

    if (application.cvType === 'uploaded') {
      const cv = await UploadedCVRepository.findById(application.cvId);
      cvUrl = cv?.fileUrl || '';
      cvName = cv?.fileName || 'Uploaded CV';
    } else if (application.cvType === 'template') {
      const cv = await UserCVRepository.findById(application.cvId);
      // Giả sử UserCV có field pdfUrl và title
      cvUrl = (cv as any)?.pdfUrl || '';
      cvName = (cv as any)?.title || 'Jobly CV';
    }

    // Lấy status history
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
          description: application.job.company.description
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
      createdAt: application.appliedAt,
      updatedAt: application.updatedAt,
      statusHistory: statusHistory.map((h: any) => ({
        status: h.status,
        changedAt: h.changedAt,
        changedBy: h.changedBy
      }))
    };
  }
}

export default new ApplicationService();
