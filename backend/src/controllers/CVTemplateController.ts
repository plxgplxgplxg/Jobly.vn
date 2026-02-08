import { Request, Response } from 'express';
import CVTemplateService from '../services/CVTemplateService';
import PDFGenerator from '../utils/PDFGenerator';

class CVTemplateController {
  async listTemplates(req: Request, res: Response) {
    try {
      const templates = await CVTemplateService.listTemplates();
      res.json(templates);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getTemplate(req: Request, res: Response) {
    try {
      const template = await CVTemplateService.getTemplate(req.params.id as string);
      res.json(template);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }

  async previewTemplate(req: Request, res: Response) {
    try {
      const template = await CVTemplateService.getTemplate(req.params.id as string);

      let sampleData;

      if (template.category === 'IT Professional') {
        sampleData = {
          templateId: template.id,
          sections: {
            personal: {
              fullName: 'Nguyễn Văn A',
              dateOfBirth: '01/01/1998',
              gender: 'Nam',
              phone: '0901 234 567',
              email: 'nguyenvana@example.com',
              address: 'Quận 1, TP. Hồ Chí Minh',
              linkedin: 'linkedin.com/in/nguyenvana',
              github: 'github.com/nguyenvana'
            },
            objective: {
              content: 'Là một lập trình viên Full-stack, tôi mong muốn ứng tuyển vào vị trí phù hợp để phát huy kỹ năng lập trình, phát triển sản phẩm và tham gia đóng góp vào các dự án thực tế. Mục tiêu trong 2 năm tới là trở thành một developer có khả năng đảm nhận các nhiệm vụ phức tạp và định hướng trở thành Senior Developer trong 5 năm.'
            },
            skills: {
              languages: 'JavaScript, Python, Java, C#',
              frontend: 'HTML5, CSS3, ReactJS, VueJS',
              backend: 'NodeJS, ExpressJS, .NET Core, Django',
              database: 'MySQL, PostgreSQL, MongoDB',
              devops: 'Git, Docker, CI/CD (GitHub Actions), Linux',
              other: 'RESTful API, Agile/Scrum'
            },
            experience: {
              items: [
                '<div class="experience-item"><h3>Công ty ABC – Lập trình viên Full-stack</h3><p class="duration">01/2021 – Hiện tại</p><ul><li>Tham gia xây dựng hệ thống quản lý bán hàng bằng NodeJS và ReactJS</li><li>Thiết kế API, tối ưu hiệu năng backend (tốc độ phản hồi tăng 30%)</li><li>Phát triển UI/UX, nâng cấp component React theo chuẩn ES6+</li><li>Triển khai hệ thống lên Docker và tối ưu CI/CD</li></ul></div>',
                '<div class="experience-item"><h3>Công ty XYZ – Lập trình viên Front-end</h3><p class="duration">06/2019 – 12/2020</p><ul><li>Xây dựng giao diện web sử dụng ReactJS và Sass</li><li>Làm việc với team designer để tối ưu UI</li><li>Kết nối API và xử lý logic front-end</li></ul></div>'
              ]
            },
            projects: {
              items: [
                '<div class="project-item"><h3>Hệ thống Quản lý Kho - Website</h3><p><strong>Vai trò:</strong> Full-stack Developer</p><p><strong>Công nghệ:</strong> ReactJS, NodeJS, MongoDB</p><p><strong>Kết quả:</strong> Giảm 40% thời gian xử lý dữ liệu cho khách hàng</p></div>',
                '<div class="project-item"><h3>Ứng dụng Theo dõi Sức khỏe - Mobile App</h3><p><strong>Vai trò:</strong> Front-end Developer</p><p><strong>Công nghệ:</strong> React Native, Firebase</p></div>'
              ]
            },
            education: {
              school: 'Đại học Công nghệ Thông tin – ĐHQG TP.HCM',
              degree: 'Cử nhân Công nghệ Thông tin',
              year: '2015 – 2019'
            },
            certificates: {
              items: ['Google IT Support', 'AWS Cloud Practitioner', 'CCNA']
            },
            activities: {
              items: ['Thành viên CLB Lập trình UIT', 'Tham gia hackathon UIT năm 2018 – Top 5']
            },
            hobbies: {
              items: ['Đọc tài liệu công nghệ', 'Chơi cờ vua', 'Viết blog kỹ thuật']
            },
            references: {
              items: ['<div class="reference-item"><p><strong>Ông Trần Văn B</strong> – Trưởng phòng kỹ thuật Công ty ABC</p><p>Email: tranvanb@example.com</p><p>SĐT: 0909 888 777</p></div>']
            }
          }
        };
      } else {
        sampleData = {
          templateId: template.id,
          sections: {
            personal: {
              fullName: 'Nguyen Van A',
              email: 'nguyenvana@example.com',
              phone: '0123456789',
              address: 'Ha Noi, Viet Nam'
            },
            experience: {
              company: 'ABC Company',
              position: 'Senior Developer',
              duration: '2020 - 2024',
              description: 'Phát triển ứng dụng web với Node.js, React'
            },
            education: {
              school: 'Đại học Bách Khoa',
              degree: 'Kỹ sư CNTT',
              year: '2020'
            },
            skills: {
              skillList: ['JavaScript', 'TypeScript', 'Node.js', 'React', 'PostgreSQL']
            }
          }
        };
      }

      const html = await CVTemplateService.renderPreview(req.params.id as string, sampleData);
      res.send(html);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async createUserCV(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const userCV = await CVTemplateService.createUserCV(userId, req.body);
      res.json(userCV);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async updateUserCV(req: Request, res: Response) {
    try {
      const userCV = await CVTemplateService.updateUserCV(req.params.id as string, req.body);
      res.json(userCV);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async deleteUserCV(req: Request, res: Response) {
    try {
      await CVTemplateService.deleteUserCV(req.params.id as string);
      res.json({ message: 'Xóa CV thành công' });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async listUserCVs(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const userCVs = await CVTemplateService.listUserCVs(userId);
      res.json(userCVs);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getUserCV(req: Request, res: Response) {
    try {
      const userCV = await CVTemplateService.getUserCV(req.params.id as string);
      res.json(userCV);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }

  async renderPreview(req: Request, res: Response) {
    try {
      const html = await CVTemplateService.renderPreview(req.body.templateId, req.body.contentJSON);
      res.send(html);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async exportPDF(req: Request, res: Response) {
    try {
      const pdfBuffer = await CVTemplateService.exportPDF(req.params.id as string);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=cv_${req.params.id}.pdf`);
      res.send(pdfBuffer);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async generatePDF(req: Request, res: Response) {
    try {
      const data = req.body;
      const mapping = {
        templateId: req.params.id,
        sections: {
          personal: {
            ...data.personalInfo,
            dateOfBirth: data.personalInfo?.dateOfBirth ? new Date(data.personalInfo.dateOfBirth).toLocaleDateString('vi-VN') : '',
            // Map custom fields to common placeholders (looking for LinkedIn, GitHub etc)
            ...(data.personalInfo?.customFields || []).reduce((acc: any, field: any) => {
              const key = field.label.toLowerCase().trim().replace(/\s+/g, '');
              acc[key] = field.value;
              return acc;
            }, {}),
            // Consolidated custom info HTML
            custom_info: (data.personalInfo?.customFields || []).map((field: any) =>
              `<p><strong>${field.label}:</strong> ${field.value}</p>`
            ).join(''),
            title: data.personalInfo?.title || ''
          },
          objective: { content: data.summary || '' },
          skills: {
            languages: data.skills?.map((s: any) => s.name).join(', ') || '',
            items: data.skills?.map((s: any) => `
              <div class="skill-item">
                <strong>${s.name}:</strong> <span>${s.description}</span>
              </div>
            `).join('') || ''
          },
          experience: {
            items: data.experience?.map((exp: any) => `
              <div class="experience-item">
                <h3>${exp.position} – ${exp.company}</h3>
                <p class="duration">${exp.startDate ? new Date(exp.startDate).toLocaleDateString('vi-VN') : ''} – ${exp.isCurrent ? 'Hiện tại' : (exp.endDate ? new Date(exp.endDate).toLocaleDateString('vi-VN') : '')}</p>
                <p>${exp.description}</p>
              </div>
            `).join('') || ''
          },
          projects: {
            items: data.projects?.map((proj: any) => `
              <div class="project-item">
                <h3>${proj.name} – ${proj.role}</h3>
                <p>${proj.description}</p>
                ${proj.link ? `<p><a href="${proj.link}">${proj.link}</a></p>` : ''}
              </div>
            `).join('') || ''
          },
          education: data.education?.[0] ? {
            school: data.education[0].school,
            degree: `${data.education[0].degree} - ${data.education[0].field}`,
            year: `${data.education[0].startDate ? new Date(data.education[0].startDate).getFullYear() : ''} - ${data.education[0].endDate ? new Date(data.education[0].endDate).getFullYear() : 'Hiện tại'}`
          } : { school: '', degree: '', year: '' },
          certificates: { items: data.certificates?.join(', ') || '' },
          activities: { items: data.activities?.join(', ') || '' },
          hobbies: { items: data.hobbies?.join(', ') || '' },
          references: { items: data.references?.join(', ') || '' }
        }
      };

      // Render HTML từ template và mapping
      let html = await CVTemplateService.renderPreview(req.params.id as string, mapping as any);

      // Inject thêm style cho skills-list và skill-item nếu chưa có
      const extraStyles = `
        <style>
          .skills-list { display: flex; flex-direction: column; gap: 8px; }
          .skill-item { line-height: 1.5; }
          .skill-item strong { color: #2c3e50; min-width: 120px; display: inline-block; }
        </style>
      `;
      html = html.replace('</head>', `${extraStyles}</head>`);

      // Xử lý đặc biệt cho kỹ năng động
      if (mapping.sections.skills.items) {
        // Thay thế grid tĩnh bằng list động nếu tìm thấy
        const skillGridRegex = /<div class="skills-grid">[\s\S]*?<\/div>/;
        if (skillGridRegex.test(html)) {
          html = html.replace(skillGridRegex, `<div class="skills-list">${mapping.sections.skills.items}</div>`);
        } else {
          html = html.replace('{{skills.items}}', mapping.sections.skills.items);
        }
      }

      // Xóa các dòng LinkedIn/GitHub cứng nếu chúng còn sót lại từ template cũ trong DB
      html = html.replace(/<p><strong>LinkedIn:<\/strong>\s*(?:{{personal\.linkedin}})?\s*<\/p>/gi, '');
      html = html.replace(/<p><strong>GitHub:<\/strong>\s*(?:{{personal\.github}})?\s*<\/p>/gi, '');

      // Xóa vị trí ứng tuyển nếu trống (phải làm TRƯỚC khi xóa placeholder)
      if (!data.personalInfo?.title) {
        html = html.replace(/<h2[^>]*>{{personal\.title}}<\/h2>/gi, '');
        html = html.replace(/<h2[^>]*style="[^"]*">{{personal\.title}}<\/h2>/gi, '');
        // Xóa cả trường hợp h2 trống
        html = html.replace(/<h2[^>]*style="[^"]*"><\/h2>/gi, '');
      }

      // Xóa tất cả các placeholder {{...}} còn sót lại
      html = html.replace(/{{[a-zA-Z0-9_.]*}}/g, '');

      // Xóa các section trống khỏi HTML kết quả
      const sectionTitles: any = {
        objective: ['GIỚI THIỆU BẢN THÂN', 'MỤC TIÊU NGHỀ NGHIỆP'],
        skills: 'KỸ NĂNG CHUYÊN MÔN',
        experience: 'KINH NGHIỆM LÀM VIỆC',
        projects: 'DỰ ÁN TIÊU BIỂU',
        education: 'HỌC VẤN',
        certificates: 'CHỨNG CHỈ',
        activities: 'HOẠT ĐỘNG',
        hobbies: 'SỞ THÍCH',
        references: 'NGƯỜI THAM CHIẾU'
      };

      Object.entries(sectionTitles).forEach(([s, titleOrTitles]) => {
        const sec = mapping.sections[s as keyof typeof mapping.sections];
        const isEmpty = !sec ||
          ((sec as any).items === '') ||
          (s === 'education' && !(sec as any).school) ||
          (s === 'objective' && !(sec as any).content) ||
          (s === 'skills' && !(sec as any).items && !(sec as any).languages);

        if (isEmpty) {
          const titles = Array.isArray(titleOrTitles) ? titleOrTitles : [titleOrTitles];
          titles.forEach(title => {
            const sectionRegex = new RegExp(`<div[^>]*class="[^"]*section[^"]*"[^>]*>[^<]*<h2[^>]*>${title}<\\/h2>[\\s\\S]*?<\\/div>`, 'gi');
            html = html.replace(sectionRegex, '');
          });
        }
      });

      const pdfBuffer = await PDFGenerator.generatePDF(html);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Length', pdfBuffer.length);
      res.setHeader('Content-Disposition', `attachment; filename=cv_${req.params.id}.pdf`);
      res.send(pdfBuffer);
    } catch (error: any) {
      console.error('Generate PDF Error:', error);
      res.status(400).json({ error: error.message });
    }
  }
}

export default new CVTemplateController();
