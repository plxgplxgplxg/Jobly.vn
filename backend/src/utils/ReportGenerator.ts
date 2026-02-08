import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import { ReportType } from '../types/admin.types';

class ReportGenerator {
  async generateExcel(data: any[], type: ReportType): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Report');

    // Thêm headers và data dựa trên type
    switch (type) {
      case 'users':
        worksheet.columns = [
          { header: 'ID', key: 'id', width: 40 },
          { header: 'Tên', key: 'name', width: 30 },
          { header: 'Email', key: 'email', width: 30 },
          { header: 'Vai trò', key: 'role', width: 15 },
          { header: 'Trạng thái', key: 'status', width: 15 },
          { header: 'Ngày tạo', key: 'createdAt', width: 20 }
        ];
        break;

      case 'jobs':
        worksheet.columns = [
          { header: 'ID', key: 'id', width: 40 },
          { header: 'Tiêu đề', key: 'title', width: 40 },
          { header: 'Công ty', key: 'company', width: 30 },
          { header: 'Địa điểm', key: 'location', width: 20 },
          { header: 'Lương', key: 'salary', width: 20 },
          { header: 'Trạng thái', key: 'status', width: 15 },
          { header: 'VIP', key: 'vipFlag', width: 10 },
          { header: 'Ngày tạo', key: 'createdAt', width: 20 }
        ];
        break;

      case 'applications':
        worksheet.columns = [
          { header: 'ID', key: 'id', width: 40 },
          { header: 'Ứng viên', key: 'candidateName', width: 30 },
          { header: 'Công việc', key: 'jobTitle', width: 40 },
          { header: 'Trạng thái', key: 'status', width: 15 },
          { header: 'Ngày nộp', key: 'appliedAt', width: 20 }
        ];
        break;
    }

    // Thêm data
    worksheet.addRows(data);

    // Style header
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  async generatePDF(data: any[], type: ReportType): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const buffers: Buffer[] = [];

      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      // Tiêu đề
      doc.fontSize(20).text('Báo cáo ' + this.getReportTitle(type), { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`Ngày xuất: ${new Date().toLocaleDateString('vi-VN')}`, {
        align: 'center'
      });
      doc.moveDown(2);

      // Nội dung dựa trên type
      doc.fontSize(10);

      switch (type) {
        case 'users':
          this.addUsersContent(doc, data);
          break;
        case 'jobs':
          this.addJobsContent(doc, data);
          break;
        case 'applications':
          this.addApplicationsContent(doc, data);
          break;
      }

      doc.end();
    });
  }

  private getReportTitle(type: ReportType): string {
    switch (type) {
      case 'users':
        return 'Người dùng';
      case 'jobs':
        return 'Tin tuyển dụng';
      case 'applications':
        return 'Đơn ứng tuyển';
      default:
        return 'Báo cáo';
    }
  }

  private addUsersContent(doc: PDFKit.PDFDocument, data: any[]): void {
    doc.text(`Tổng số người dùng: ${data.length}`, { underline: true });
    doc.moveDown();

    data.forEach((user, index) => {
      doc.text(`${index + 1}. ${user.name} (${user.email})`);
      doc.text(`   Vai trò: ${user.role} | Trạng thái: ${user.status}`);
      doc.text(`   Ngày tạo: ${new Date(user.createdAt).toLocaleDateString('vi-VN')}`);
      doc.moveDown(0.5);
    });
  }

  private addJobsContent(doc: PDFKit.PDFDocument, data: any[]): void {
    doc.text(`Tổng số tin tuyển dụng: ${data.length}`, { underline: true });
    doc.moveDown();

    data.forEach((job, index) => {
      doc.text(`${index + 1}. ${job.title}`);
      doc.text(`   Công ty: ${job.company || 'N/A'}`);
      doc.text(`   Địa điểm: ${job.location} | Lương: ${job.salary}`);
      doc.text(`   Trạng thái: ${job.status} | VIP: ${job.vipFlag ? 'Có' : 'Không'}`);
      doc.text(`   Ngày tạo: ${new Date(job.createdAt).toLocaleDateString('vi-VN')}`);
      doc.moveDown(0.5);
    });
  }

  private addApplicationsContent(doc: PDFKit.PDFDocument, data: any[]): void {
    doc.text(`Tổng số đơn ứng tuyển: ${data.length}`, { underline: true });
    doc.moveDown();

    data.forEach((app, index) => {
      doc.text(`${index + 1}. ${app.candidateName} - ${app.jobTitle}`);
      doc.text(`   Trạng thái: ${app.status}`);
      doc.text(`   Ngày nộp: ${new Date(app.appliedAt).toLocaleDateString('vi-VN')}`);
      doc.moveDown(0.5);
    });
  }
}

export default new ReportGenerator();
