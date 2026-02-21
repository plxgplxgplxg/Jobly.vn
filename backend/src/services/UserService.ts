import UserRepository from '../repositories/UserRepository';
import UploadedCVRepository from '../repositories/UploadedCVRepository';
import CompanyRepository from '../repositories/CompanyRepository';
import ApplicationRepository from '../repositories/ApplicationRepository';
import MessageRepository from '../repositories/MessageRepository';
import { UserProfileDTO, UpdateProfileDTO, CVDTO, CompanyDTO } from '../types/user.types';
import path from 'path';
import fs from 'fs';

import SavedJobService from './SavedJobService';
import SavedCandidateService from './SavedCandidateService';

class UserService {
  // Dashboard stats
  async getDashboardStats(userId: string) {
    const user = await UserRepository.findById(userId);
    if (!user) {
      throw new Error('Người dùng không tồn tại');
    }

    const applicationsCount = await ApplicationRepository.countByUserId(userId);
    const cvsCount = await UploadedCVRepository.countByUserId(userId);
    const messagesCount = await MessageRepository.countUnreadByUserId(userId);

    let savedCount = 0;
    if (user.role === 'candidate') {
      savedCount = await SavedJobService.count(userId);
    } else if (user.role === 'employer') {
      savedCount = await SavedCandidateService.count(userId);
    }

    return {
      applications: applicationsCount,
      savedJobs: savedCount, // This will store savedProfiles for employers too, frontend should handle label
      cvs: cvsCount,
      messages: messagesCount
    };
  }
  // Profile management
  async getProfile(userId: string): Promise<UserProfileDTO> {
    const user = await UserRepository.findById(userId);
    if (!user) {
      throw new Error('Người dùng không tồn tại');
    }

    const userData = user.toJSON() as any;
    const company = userData.companies && userData.companies.length > 0 ? userData.companies[0] : undefined;

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
      desiredPosition: user.desiredPosition,
      experienceLevel: user.experienceLevel,
      jobLevel: user.jobLevel,
      workType: user.workType,
      gender: user.gender,
      expectedSalary: user.expectedSalary,
      industry: user.industry,
      province: user.province,
      district: user.district,
      ward: user.ward,
      willingToRelocate: user.willingToRelocate,
      profileCompleted: user.profileCompleted,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      company: company ? {
        id: company.id,
        name: company.name,
        taxCode: company.taxCode,
        industry: company.industry,
        logoUrl: company.logoUrl,
        description: company.description,
        userId: company.userId,
        createdAt: company.createdAt,
        updatedAt: company.updatedAt
      } : undefined
    };
  }

  async updateProfile(userId: string, data: UpdateProfileDTO): Promise<UserProfileDTO> {
    const user = await UserRepository.findById(userId);
    if (!user) {
      throw new Error('Người dùng không tồn tại');
    }

    await user.update(data);
    return this.getProfile(userId);
  }

  async completeProfile(userId: string, data: UpdateProfileDTO): Promise<UserProfileDTO> {
    const user = await UserRepository.findById(userId);
    if (!user) {
      throw new Error('Người dùng không tồn tại');
    }

    // Mark user as having completed profile
    await user.update({
      ...data,
      status: 'active',
      profileCompleted: true
    });

    return this.getProfile(userId);
  }

  async uploadAvatar(userId: string, file: Express.Multer.File): Promise<string> {
    // Validate file type
    const allowedTypes = ['.jpg', '.jpeg', '.png'];
    const fileExt = path.extname(file.originalname).toLowerCase();
    if (!allowedTypes.includes(fileExt)) {
      throw new Error('Định dạng ảnh không hợp lệ. Chỉ chấp nhận JPG, PNG');
    }

    // Validate file size (2MB)
    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error('Kích thước ảnh vượt quá 2MB');
    }

    const user = await UserRepository.findById(userId);
    if (!user) {
      throw new Error('Người dùng không tồn tại');
    }

    // Delete old avatar if exists
    if (user.avatarUrl) {
      const oldAvatarPath = path.join(__dirname, '../../', user.avatarUrl);
      if (fs.existsSync(oldAvatarPath)) {
        fs.unlinkSync(oldAvatarPath);
      }
    }

    // Save new avatar
    const uploadDir = path.join(__dirname, '../../uploads/avatars');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const fileName = `${userId}_${Date.now()}${fileExt}`;
    const filePath = path.join(uploadDir, fileName);
    fs.writeFileSync(filePath, file.buffer);

    const avatarUrl = `/uploads/avatars/${fileName}`;
    await user.update({ avatarUrl });

    return avatarUrl;
  }

  // CV management
  async uploadCV(userId: string, file: Express.Multer.File): Promise<CVDTO> {
    // Validate file type
    const allowedTypes = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'];
    const fileExt = path.extname(file.originalname).toLowerCase();
    if (!allowedTypes.includes(fileExt)) {
      throw new Error('Định dạng file không hợp lệ. Chỉ chấp nhận PDF, DOCX, JPG, PNG');
    }

    // Validate file size (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error('Kích thước file vượt quá 5MB');
    }

    // Check CV limit (max 10)
    const cvCount = await UploadedCVRepository.countByUserId(userId);
    if (cvCount >= 10) {
      throw new Error('Đã đạt giới hạn 10 CV. Vui lòng xóa CV cũ trước khi upload');
    }

    // Save file to storage
    const uploadDir = path.join(__dirname, '../../uploads/cvs');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const fileName = `${userId}_${Date.now()}${fileExt}`;
    const filePath = path.join(uploadDir, fileName);
    fs.writeFileSync(filePath, file.buffer);

    const fileUrl = `/uploads/cvs/${fileName}`;

    // Save to database via repository
    const cv = await UploadedCVRepository.create({
      userId,
      fileName: file.originalname,
      fileUrl,
      fileSize: file.size
    });

    return {
      id: cv.id,
      userId: cv.userId,
      fileName: cv.fileName,
      fileUrl: cv.fileUrl,
      fileSize: cv.fileSize,
      createdAt: cv.uploadedAt,
      isDefault: cv.isDefault
    };
  }

  async deleteCV(userId: string, cvId: string): Promise<boolean> {
    const cv = await UploadedCVRepository.findByUserIdAndId(userId, cvId);
    if (!cv) {
      throw new Error('CV không tồn tại');
    }

    // Delete file from storage
    const filePath = path.join(__dirname, '../../', cv.fileUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await UploadedCVRepository.delete(cvId);
    return true;
  }

  async listCVs(userId: string): Promise<CVDTO[]> {
    const cvs = await UploadedCVRepository.findByUserId(userId);

    return cvs.map(cv => ({
      id: cv.id,
      userId: cv.userId,
      fileName: cv.fileName,
      fileUrl: cv.fileUrl,
      fileSize: cv.fileSize,
      createdAt: cv.uploadedAt,
      isDefault: cv.isDefault
    }));
  }

  async setDefaultCV(userId: string, cvId: string): Promise<CVDTO> {
    const cv = await UploadedCVRepository.findByUserIdAndId(userId, cvId);
    if (!cv) {
      throw new Error('CV không tồn tại');
    }

    // Reset all CVs of this user to not default
    await UploadedCVRepository.resetDefaults(userId);

    // Set this CV as default
    await cv.update({ isDefault: true });

    return {
      id: cv.id,
      userId: cv.userId,
      fileName: cv.fileName,
      fileUrl: cv.fileUrl,
      fileSize: cv.fileSize,
      createdAt: cv.uploadedAt,
      isDefault: true
    };
  }

  // Company management
  async createCompany(userId: string, data: CompanyDTO): Promise<CompanyDTO> {
    // Validate tax code format
    const taxCodeRegex = /^[0-9]{10}$|^[0-9]{13}$/;
    if (!taxCodeRegex.test(data.taxCode)) {
      throw new Error('Mã số thuế phải có 10 hoặc 13 chữ số');
    }

    // Check if user already has a company
    const existingCompany = await CompanyRepository.findByUserId(userId);
    if (existingCompany) {
      throw new Error('Bạn đã có công ty. Vui lòng cập nhật thông tin công ty hiện tại');
    }

    // Check if tax code already exists
    const existingTaxCode = await CompanyRepository.findByTaxCode(data.taxCode);
    if (existingTaxCode) {
      throw new Error('Mã số thuế đã được sử dụng');
    }

    const company = await CompanyRepository.create({
      name: data.name,
      taxCode: data.taxCode,
      industry: data.industry,
      logoUrl: data.logoUrl,
      description: data.description,
      userId
    });

    return {
      id: company.id,
      name: company.name,
      taxCode: company.taxCode,
      industry: company.industry,
      logoUrl: company.logoUrl,
      description: company.description,
      userId: company.userId,
      createdAt: company.createdAt,
      updatedAt: company.updatedAt
    };
  }

  async updateCompany(companyId: string, data: CompanyDTO): Promise<CompanyDTO> {
    const company = await CompanyRepository.findById(companyId);
    if (!company) {
      throw new Error('Công ty không tồn tại');
    }

    // Validate tax code if changed
    if (data.taxCode && data.taxCode !== company.taxCode) {
      const taxCodeRegex = /^[0-9]{10}$|^[0-9]{13}$/;
      if (!taxCodeRegex.test(data.taxCode)) {
        throw new Error('Mã số thuế phải có 10 hoặc 13 chữ số');
      }

      const existingTaxCode = await CompanyRepository.findByTaxCode(data.taxCode);
      if (existingTaxCode) {
        throw new Error('Mã số thuế đã được sử dụng');
      }
    }

    await CompanyRepository.update(companyId, {
      name: data.name,
      taxCode: data.taxCode,
      industry: data.industry,
      logoUrl: data.logoUrl,
      description: data.description
    });

    return this.getCompany(companyId);
  }

  async getCompany(companyId: string): Promise<CompanyDTO> {
    const company = await CompanyRepository.findById(companyId);
    if (!company) {
      throw new Error('Công ty không tồn tại');
    }

    return {
      id: company.id,
      name: company.name,
      taxCode: company.taxCode,
      industry: company.industry,
      logoUrl: company.logoUrl,
      description: company.description,
      userId: company.userId,
      createdAt: company.createdAt,
      updatedAt: company.updatedAt
    };
  }

  async uploadLogo(companyId: string, file: Express.Multer.File): Promise<string> {
    // Validate file type
    const allowedTypes = ['.jpg', '.jpeg', '.png'];
    const fileExt = path.extname(file.originalname).toLowerCase();
    if (!allowedTypes.includes(fileExt)) {
      throw new Error('Định dạng ảnh không hợp lệ. Chỉ chấp nhận JPG, PNG');
    }

    // Validate file size (2MB)
    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error('Kích thước ảnh vượt quá 2MB');
    }

    const company = await CompanyRepository.findById(companyId);
    if (!company) {
      throw new Error('Công ty không tồn tại');
    }

    // Delete old logo if exists
    if (company.logoUrl) {
      const oldLogoPath = path.join(__dirname, '../../', company.logoUrl);
      if (fs.existsSync(oldLogoPath)) {
        fs.unlinkSync(oldLogoPath);
      }
    }

    // Save new logo
    const uploadDir = path.join(__dirname, '../../uploads/logos');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const fileName = `${companyId}_${Date.now()}${fileExt}`;
    const filePath = path.join(uploadDir, fileName);
    fs.writeFileSync(filePath, file.buffer);

    const logoUrl = `/uploads/logos/${fileName}`;
    await CompanyRepository.update(companyId, { logoUrl });

    return logoUrl;
  }

  async searchCandidates(query: string, page = 1, limit = 9) {
    const { rows, count } = await UserRepository.searchCandidates(query, page, limit);
    const items = rows.map(user => ({
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
      desiredPosition: user.desiredPosition,
      experienceLevel: user.experienceLevel,
      jobLevel: user.jobLevel,
      workType: user.workType,
      gender: user.gender,
      expectedSalary: user.expectedSalary,
      industry: user.industry,
      province: user.province,
      district: user.district,
      ward: user.ward,
      willingToRelocate: user.willingToRelocate,
      profileCompleted: user.profileCompleted,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }));
    return {
      items,
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit)
    }
  }
}

export default new UserService();
