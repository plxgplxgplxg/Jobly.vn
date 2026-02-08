import CVTemplateRepository from '../repositories/CVTemplateRepository';
import UserCVRepository from '../repositories/UserCVRepository';
import UserRepository from '../repositories/UserRepository';
import TemplateRenderer from '../utils/TemplateRenderer';
import PDFGenerator from '../utils/PDFGenerator';
import { CVTemplateDTO, UserCVDTO, CreateUserCVDTO, UpdateUserCVDTO, CVContentJSON } from '../types/cv.types';
import path from 'path';
import fs from 'fs';

class CVTemplateService {
  async listTemplates(): Promise<CVTemplateDTO[]> {
    const templates = await CVTemplateRepository.findAll();

    return templates.map(template => ({
      id: template.id,
      name: template.name,
      description: template.description,
      category: template.category,
      structureJSON: template.structureJSON as any,
      htmlTemplate: template.htmlTemplate,
      cssStyles: template.cssStyles,
      previewImageUrl: template.previewImageUrl,
      createdAt: template.createdAt
    }));
  }

  async getTemplate(templateId: string): Promise<CVTemplateDTO> {
    const template = await CVTemplateRepository.findById(templateId);
    if (!template) {
      throw new Error('Template không tồn tại');
    }

    return {
      id: template.id,
      name: template.name,
      description: template.description,
      category: template.category,
      structureJSON: template.structureJSON as any,
      htmlTemplate: template.htmlTemplate,
      cssStyles: template.cssStyles,
      previewImageUrl: template.previewImageUrl,
      createdAt: template.createdAt
    };
  }

  async createUserCV(userId: string, data: CreateUserCVDTO): Promise<UserCVDTO> {
    const template = await CVTemplateRepository.findById(data.templateId);
    if (!template) {
      throw new Error('Template không tồn tại');
    }

    const user = await UserRepository.findById(userId);
    if (!user) {
      throw new Error('Người dùng không tồn tại');
    }

    const contentJSON = this.mergeUserProfileToCV(user, data.contentJSON);

    const html = TemplateRenderer.render(
      {
        id: template.id,
        name: template.name,
        category: template.category,
        structureJSON: template.structureJSON as any,
        htmlTemplate: template.htmlTemplate,
        cssStyles: template.cssStyles,
        previewImageUrl: template.previewImageUrl,
        createdAt: template.createdAt
      },
      contentJSON
    );

    const pdfBuffer = await PDFGenerator.generatePDF(html);

    const uploadDir = path.join(__dirname, '../../uploads/cvs');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const fileName = `${userId}_${Date.now()}.pdf`;
    const filePath = path.join(uploadDir, fileName);
    fs.writeFileSync(filePath, pdfBuffer);

    const pdfUrl = `/uploads/cvs/${fileName}`;

    const userCV = await UserCVRepository.create({
      userId,
      templateId: data.templateId,
      contentJSON,
      pdfUrl
    });

    return {
      id: userCV.id,
      userId: userCV.userId,
      templateId: userCV.templateId,
      contentJSON: userCV.contentJSON as CVContentJSON,
      pdfUrl: userCV.pdfUrl,
      createdAt: userCV.createdAt,
      updatedAt: userCV.updatedAt
    };
  }

  private mergeUserProfileToCV(user: any, contentJSON: CVContentJSON): CVContentJSON {
    if (!contentJSON.sections.personal) {
      contentJSON.sections.personal = {};
    }

    if (!contentJSON.sections.personal.fullName && user.name) {
      contentJSON.sections.personal.fullName = user.name;
    }
    if (!contentJSON.sections.personal.email && user.email) {
      contentJSON.sections.personal.email = user.email;
    }
    if (!contentJSON.sections.personal.phone && user.phone) {
      contentJSON.sections.personal.phone = user.phone;
    }
    if (!contentJSON.sections.personal.address && user.address) {
      contentJSON.sections.personal.address = user.address;
    }
    if (!contentJSON.sections.personal.dateOfBirth && user.dateOfBirth) {
      contentJSON.sections.personal.dateOfBirth = new Date(user.dateOfBirth).toLocaleDateString('vi-VN');
    }

    return contentJSON;
  }

  async updateUserCV(cvId: string, data: UpdateUserCVDTO): Promise<UserCVDTO> {
    const userCV = await UserCVRepository.findById(cvId);
    if (!userCV) {
      throw new Error('CV không tồn tại');
    }

    const template = await CVTemplateRepository.findById(userCV.templateId);
    if (!template) {
      throw new Error('Template không tồn tại');
    }

    const html = TemplateRenderer.render(
      {
        id: template.id,
        name: template.name,
        category: template.category,
        structureJSON: template.structureJSON as any,
        htmlTemplate: template.htmlTemplate,
        cssStyles: template.cssStyles,
        previewImageUrl: template.previewImageUrl,
        createdAt: template.createdAt
      },
      data.contentJSON
    );

    const pdfBuffer = await PDFGenerator.generatePDF(html);

    if (userCV.pdfUrl) {
      const oldPdfPath = path.join(__dirname, '../../', userCV.pdfUrl);
      if (fs.existsSync(oldPdfPath)) {
        fs.unlinkSync(oldPdfPath);
      }
    }

    const uploadDir = path.join(__dirname, '../../uploads/cvs');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const fileName = `${userCV.userId}_${Date.now()}.pdf`;
    const filePath = path.join(uploadDir, fileName);
    fs.writeFileSync(filePath, pdfBuffer);

    const pdfUrl = `/uploads/cvs/${fileName}`;

    await UserCVRepository.update(cvId, {
      contentJSON: data.contentJSON,
      pdfUrl
    });

    return this.getUserCV(cvId);
  }

  async deleteUserCV(cvId: string): Promise<boolean> {
    const userCV = await UserCVRepository.findById(cvId);
    if (!userCV) {
      throw new Error('CV không tồn tại');
    }

    if (userCV.pdfUrl) {
      const pdfPath = path.join(__dirname, '../../', userCV.pdfUrl);
      if (fs.existsSync(pdfPath)) {
        fs.unlinkSync(pdfPath);
      }
    }

    await UserCVRepository.delete(cvId);
    return true;
  }

  async listUserCVs(userId: string): Promise<UserCVDTO[]> {
    const userCVs = await UserCVRepository.findByUserId(userId);

    return userCVs.map(cv => ({
      id: cv.id,
      userId: cv.userId,
      templateId: cv.templateId,
      contentJSON: cv.contentJSON as CVContentJSON,
      pdfUrl: cv.pdfUrl,
      createdAt: cv.createdAt,
      updatedAt: cv.updatedAt
    }));
  }

  async getUserCV(cvId: string): Promise<UserCVDTO> {
    const userCV = await UserCVRepository.findById(cvId);
    if (!userCV) {
      throw new Error('CV không tồn tại');
    }

    return {
      id: userCV.id,
      userId: userCV.userId,
      templateId: userCV.templateId,
      contentJSON: userCV.contentJSON as CVContentJSON,
      pdfUrl: userCV.pdfUrl,
      createdAt: userCV.createdAt,
      updatedAt: userCV.updatedAt
    };
  }

  async renderPreview(templateId: string, content: CVContentJSON): Promise<string> {
    const template = await CVTemplateRepository.findById(templateId);
    if (!template) {
      throw new Error('Template không tồn tại');
    }

    return TemplateRenderer.render(
      {
        id: template.id,
        name: template.name,
        category: template.category,
        structureJSON: template.structureJSON as any,
        htmlTemplate: template.htmlTemplate,
        cssStyles: template.cssStyles,
        previewImageUrl: template.previewImageUrl,
        createdAt: template.createdAt
      },
      content
    );
  }

  async exportPDF(cvId: string): Promise<Buffer> {
    const userCV = await UserCVRepository.findById(cvId);
    if (!userCV) {
      throw new Error('CV không tồn tại');
    }

    if (!userCV.pdfUrl) {
      throw new Error('PDF chưa được tạo');
    }

    const pdfPath = path.join(__dirname, '../../', userCV.pdfUrl);
    if (!fs.existsSync(pdfPath)) {
      throw new Error('File PDF không tồn tại');
    }

    return fs.readFileSync(pdfPath);
  }

  async generatePDFFromData(templateId: string, content: CVContentJSON): Promise<Buffer> {
    const template = await CVTemplateRepository.findById(templateId);
    if (!template) {
      throw new Error('Template không tồn tại');
    }

    const html = TemplateRenderer.render(
      {
        id: template.id,
        name: template.name,
        category: template.category,
        structureJSON: template.structureJSON as any,
        htmlTemplate: template.htmlTemplate,
        cssStyles: template.cssStyles,
        previewImageUrl: template.previewImageUrl,
        createdAt: template.createdAt
      },
      content
    );

    return await PDFGenerator.generatePDF(html);
  }
}

export default new CVTemplateService();
