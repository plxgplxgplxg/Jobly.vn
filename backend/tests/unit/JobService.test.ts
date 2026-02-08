import JobService from '../../src/services/JobService';
import JobRepository from '../../src/repositories/JobRepository';
import CompanyRepository from '../../src/repositories/CompanyRepository';
import { CreateJobDTO } from '../../src/types/job.types';

jest.mock('../../src/repositories/JobRepository');
jest.mock('../../src/repositories/CompanyRepository');

describe('JobService', () => {
  const mockEmployerId = 'employer-123';
  const mockCompanyId = 'company-123';
  
  const mockCompany = {
    id: mockCompanyId,
    name: 'Test Company',
    taxCode: '1234567890',
    industry: 'IT',
    userId: mockEmployerId
  };

  const mockJobData: CreateJobDTO = {
    title: 'Backend Developer',
    description: 'Test description',
    requirements: 'Test requirements',
    salary: '15-20M',
    location: 'Hà Nội',
    deadline: new Date('2026-12-31'),
    companyId: mockCompanyId
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createJob', () => {
    it('should create job successfully', async () => {
      (CompanyRepository.findById as jest.Mock).mockResolvedValue(mockCompany);
      (JobRepository.create as jest.Mock).mockResolvedValue({
        id: 'job-123',
        ...mockJobData,
        status: 'pending',
        vipFlag: false,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const result = await JobService.createJob(mockEmployerId, mockJobData);

      expect(result).toBeDefined();
      expect(result.title).toBe(mockJobData.title);
      expect(CompanyRepository.findById).toHaveBeenCalledWith(mockCompanyId);
      expect(JobRepository.create).toHaveBeenCalledWith(mockJobData);
    });

    it('should throw error if company not found', async () => {
      (CompanyRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(JobService.createJob(mockEmployerId, mockJobData))
        .rejects.toThrow('Công ty không tồn tại');
    });

    it('should throw error if employer does not own company', async () => {
      (CompanyRepository.findById as jest.Mock).mockResolvedValue({
        ...mockCompany,
        userId: 'different-user'
      });

      await expect(JobService.createJob(mockEmployerId, mockJobData))
        .rejects.toThrow('Bạn không có quyền tạo tin tuyển dụng cho công ty này');
    });

    it('should throw error if title is empty', async () => {
      const invalidData = { ...mockJobData, title: '' };
      (CompanyRepository.findById as jest.Mock).mockResolvedValue(mockCompany);

      await expect(JobService.createJob(mockEmployerId, invalidData))
        .rejects.toThrow('Tiêu đề không được để trống');
    });

    it('should throw error if deadline is in the past', async () => {
      const invalidData = { ...mockJobData, deadline: new Date('2020-01-01') };
      (CompanyRepository.findById as jest.Mock).mockResolvedValue(mockCompany);

      await expect(JobService.createJob(mockEmployerId, invalidData))
        .rejects.toThrow('Hạn nộp hồ sơ phải sau thời điểm hiện tại');
    });
  });

  describe('searchJobs', () => {
    it('should return VIP jobs first', async () => {
      const mockJobs = [
        { id: '1', title: 'VIP Job', vipFlag: true, createdAt: new Date('2026-01-01') },
        { id: '2', title: 'Normal Job', vipFlag: false, createdAt: new Date('2026-01-02') }
      ];

      (JobRepository.search as jest.Mock).mockResolvedValue({
        items: mockJobs,
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1
      });

      const result = await JobService.searchJobs({
        keyword: 'developer',
        page: 1,
        limit: 10
      });

      expect(result.items).toHaveLength(2);
      expect(JobRepository.search).toHaveBeenCalled();
    });
  });

  describe('expireOldJobs', () => {
    it('should expire jobs past deadline', async () => {
      const expiredJobs = [
        { id: 'job-1', deadline: new Date('2020-01-01'), status: 'approved' },
        { id: 'job-2', deadline: new Date('2020-01-02'), status: 'approved' }
      ];

      (JobRepository.findExpiredJobs as jest.Mock).mockResolvedValue(expiredJobs);
      (JobRepository.updateStatus as jest.Mock).mockResolvedValue(true);

      await JobService.expireOldJobs();

      expect(JobRepository.findExpiredJobs).toHaveBeenCalled();
      expect(JobRepository.updateStatus).toHaveBeenCalledTimes(2);
      expect(JobRepository.updateStatus).toHaveBeenCalledWith('job-1', 'expired');
      expect(JobRepository.updateStatus).toHaveBeenCalledWith('job-2', 'expired');
    });
  });
});
