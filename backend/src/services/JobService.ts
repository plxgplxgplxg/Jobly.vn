import JobRepository from '../repositories/JobRepository';
import CompanyRepository from '../repositories/CompanyRepository';
import { CreateJobDTO, UpdateJobDTO, SearchJobDTO, JobFilterDTO, PaginatedResult, JobDTO } from '../types/job.types';
import { JobStatus } from '../models/Job';

class JobService {
  async createJob(employerId: string, data: CreateJobDTO): Promise<JobDTO> {
    // Validate
    this.validateJobData(data);

    // Tim company cua employer
    const companies = await CompanyRepository.findByUserId(employerId);
    if (companies.length === 0) {
      throw new Error('Bạn chưa có công ty. Vui lòng tạo công ty trước khi đăng tin tuyển dụng');
    }

    // Lay company dau tien (mot employer chi nen co 1 company)
    const company = companies[0];

    // Tao job voi companyId tu company cua employer
    const jobData = {
      ...data,
      companyId: company.id
    };

    const job = await JobRepository.create(jobData);

    return this.toDTO(job);
  }

  async updateJob(jobId: string, employerId: string, data: UpdateJobDTO): Promise<JobDTO> {
    const job = await JobRepository.findById(jobId);
    if (!job) {
      throw new Error('Tin tuyển dụng không tồn tại');
    }

    // Verify quyen so huu
    const company = await CompanyRepository.findById(job.companyId);
    if (!company || company.userId !== employerId) {
      throw new Error('Bạn không có quyền chỉnh sửa tin tuyển dụng này');
    }

    // Chi cho phep update khi status = pending hoac approved
    if (!['pending', 'approved'].includes(job.status)) {
      throw new Error('Không thể chỉnh sửa tin tuyển dụng ở trạng thái này');
    }

    // Validate neu co data
    if (data.title || data.description || data.deadline) {
      this.validateJobData({ ...job.toJSON(), ...data } as CreateJobDTO);
    }

    const updatedJob = await JobRepository.update(jobId, data);
    if (!updatedJob) {
      throw new Error('Cập nhật thất bại');
    }

    return this.toDTO(updatedJob);
  }

  async deleteJob(jobId: string, employerId: string): Promise<boolean> {
    const job = await JobRepository.findById(jobId);
    if (!job) {
      throw new Error('Tin tuyển dụng không tồn tại');
    }

    // Verify quyen so huu
    const company = await CompanyRepository.findById(job.companyId);
    if (!company || company.userId !== employerId) {
      throw new Error('Bạn không có quyền xóa tin tuyển dụng này');
    }

    return await JobRepository.softDelete(jobId);
  }

  async getJob(jobId: string): Promise<JobDTO> {
    const job = await JobRepository.findById(jobId);
    if (!job) {
      throw new Error('Tin tuyển dụng không tồn tại');
    }

    // Khong hien thi job da xoa
    if (job.status === 'deleted') {
      throw new Error('Tin tuyển dụng không tồn tại');
    }

    return this.toDTO(job);
  }

  async listJobs(filters: JobFilterDTO): Promise<PaginatedResult<JobDTO>> {
    const result = await JobRepository.list(filters);

    return {
      ...result,
      items: result.items.map(job => this.toDTO(job))
    };
  }

  async listEmployerJobs(employerId: string, filters: JobFilterDTO): Promise<PaginatedResult<JobDTO>> {
    // Lay tat ca companies cua employer
    const companies = await CompanyRepository.findByUserId(employerId);
    const companyIds = companies.map(c => c.id);

    if (companyIds.length === 0) {
      return {
        items: [],
        total: 0,
        page: filters.page,
        limit: filters.limit,
        totalPages: 0
      };
    }

    // List jobs cua cac companies nay
    const result = await JobRepository.listByCompanyIds(companyIds, filters);

    return {
      ...result,
      items: result.items.map(job => this.toDTO(job))
    };
  }

  async searchJobs(query: SearchJobDTO): Promise<PaginatedResult<JobDTO>> {
    const result = await JobRepository.search(query);

    return {
      ...result,
      items: result.items.map(job => this.toDTO(job))
    };
  }

  async updateVIPStatus(jobId: string, isVIP: boolean, expiresAt?: Date): Promise<JobDTO> {
    const updatedJob = await JobRepository.updateVIPStatus(jobId, isVIP, expiresAt);
    if (!updatedJob) {
      throw new Error('Cập nhật VIP status thất bại');
    }

    return this.toDTO(updatedJob);
  }

  async updateJobStatus(jobId: string, status: JobStatus): Promise<JobDTO> {
    const updatedJob = await JobRepository.updateStatus(jobId, status);
    if (!updatedJob) {
      throw new Error('Cập nhật status thất bại');
    }

    return this.toDTO(updatedJob);
  }

  async expireOldJobs(): Promise<void> {
    const expiredJobs = await JobRepository.findExpiredJobs();

    for (const job of expiredJobs) {
      await JobRepository.updateStatus(job.id, 'expired');
    }

    console.log(`Đã expire ${expiredJobs.length} tin tuyển dụng`);
  }

  private validateJobData(data: CreateJobDTO): void {
    if (!data.title || data.title.trim().length === 0) {
      throw new Error('Tiêu đề không được để trống');
    }

    if (!data.description || data.description.trim().length === 0) {
      throw new Error('Mô tả công việc không được để trống');
    }

    if (!data.requirements || data.requirements.trim().length === 0) {
      throw new Error('Yêu cầu công việc không được để trống');
    }

    const deadline = new Date(data.deadline);
    if (deadline <= new Date()) {
      throw new Error('Hạn nộp hồ sơ phải sau thời điểm hiện tại');
    }
  }

  private toDTO(job: any): JobDTO {
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
      company: job.company ? {
        id: job.company.id,
        name: job.company.name,
        taxCode: job.company.taxCode,
        industry: job.company.industry,
        logoUrl: job.company.logoUrl,
        description: job.company.description
      } : undefined,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt
    };
  }
}

export default new JobService();
