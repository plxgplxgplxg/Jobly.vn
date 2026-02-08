import { useState, useEffect, useRef } from 'react'
import type { CVTemplate, CVData } from '../../../services/api/cvTemplate.service'

interface CVPreviewProps {
  template: CVTemplate
  data: CVData
}

export function CVPreview({ template, data }: CVPreviewProps) {
  const [previewHtml, setPreviewHtml] = useState<string>('')
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    generatePreview()
  }, [template, data])

  const generatePreview = () => {
    let html = template.htmlTemplate

    // Mapping data từ form sang format template
    const mapping: any = {
      personal: {
        ...data.personalInfo,
        dateOfBirth: data.personalInfo?.dateOfBirth ? new Date(data.personalInfo.dateOfBirth).toLocaleDateString('vi-VN') : '',
        // Map custom fields to common placeholders (old way)
        ...(data.personalInfo?.customFields || []).reduce((acc: any, field: any) => {
          const key = field.label.toLowerCase().trim().replace(/\s+/g, '');
          acc[key] = field.value;
          return acc;
        }, {}),
        // Consolidated custom info HTML (new way)
        custom_info: (data.personalInfo?.customFields || []).map((field: any) =>
          `<p><strong>${field.label}:</strong> ${field.value}</p>`
        ).join(''),
        title: data.personalInfo?.title || ''
      },
      objective: { content: data.summary || '' },
      skills: {
        languages: data.skills?.map(s => s.name).join(', ') || '',
        // Map specific skills if needed, or just let them show up in list
        items: data.skills?.map(s => `
          <div class="skill-item">
            <strong>${s.name}:</strong> <span>${s.description}</span>
          </div>
        `).join('') || ''
      },
      experience: {
        items: data.experience?.map(exp => `
          <div class="experience-item">
            <h3>${exp.position} – ${exp.company}</h3>
            <p class="duration">${exp.startDate ? new Date(exp.startDate).toLocaleDateString('vi-VN') : ''} – ${exp.isCurrent ? 'Hiện tại' : (exp.endDate ? new Date(exp.endDate).toLocaleDateString('vi-VN') : '')}</p>
            <p>${exp.description}</p>
          </div>
        `).join('') || ''
      },
      projects: {
        items: data.projects?.map(proj => `
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

    // Replace placeholders: {{section.field}}
    Object.entries(mapping).forEach(([sectionId, fields]: [string, any]) => {
      Object.entries(fields).forEach(([fieldName, value]: [string, any]) => {
        const placeholder = `{{${sectionId}.${fieldName}}}`
        html = html.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), String(value || ''))
      })
    })

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
    if (mapping.skills.items) {
      // Thay thế grid tĩnh bằng list động nếu tìm thấy
      const skillGridRegex = /<div class="skills-grid">[\s\S]*?<\/div>/;
      if (skillGridRegex.test(html)) {
        html = html.replace(skillGridRegex, `<div class="skills-list">${mapping.skills.items}</div>`);
      } else {
        html = html.replace('{{skills.items}}', mapping.skills.items);
      }
    }

    // Xóa các dòng LinkedIn/GitHub cứng nếu chúng còn sót lại từ template cũ trong DB
    // Regex này tìm các dòng có nhãn LinkedIn/GitHub mà phía sau là khoảng trắng hoặc placeholder trống
    html = html.replace(/<p><strong>LinkedIn:<\/strong>\s*(?:{{personal\.linkedin}})?\s*<\/p>/gi, '');
    html = html.replace(/<p><strong>GitHub:<\/strong>\s*(?:{{personal\.github}})?\s*<\/p>/gi, '');

    // Xóa vị trí ứng tuyển nếu trống (phải làm TRƯỚC khi xóa placeholder)
    if (!data.personalInfo?.title) {
      html = html.replace(/<h2[^>]*>{{personal\.title}}<\/h2>/gi, '');
      html = html.replace(/<h2[^>]*style="[^"]*">{{personal\.title}}<\/h2>/gi, '');
      // Xóa cả trường hợp h2 trống
      html = html.replace(/<h2[^>]*style="[^"]*"><\/h2>/gi, '');
    }

    // Xóa tất cả các placeholder {{...}} còn sót lại (những trường không có dữ liệu)
    html = html.replace(/{{[a-zA-Z0-9_.]*}}/g, '');

    // Xóa các section trống (Logic: Nếu items trống, xóa container bọc nó)
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
      const isSectionEmpty = !mapping[s] ||
        (mapping[s].items === '') ||
        (s === 'education' && !mapping[s].school) ||
        (s === 'objective' && !mapping[s].content) ||
        (s === 'skills' && !mapping[s].items && !mapping[s].languages);

      if (isSectionEmpty) {
        const titles = Array.isArray(titleOrTitles) ? titleOrTitles : [titleOrTitles];
        titles.forEach(title => {
          const sectionRegex = new RegExp(`<div[^>]*class="[^"]*section[^"]*"[^>]*>[^<]*<h2[^>]*>${title}<\\/h2>[\\s\\S]*?<\\/div>`, 'gi');
          html = html.replace(sectionRegex, '');
        });
      }
    })

    // Combine với CSS
    const fullHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            ${template.cssStyles}
            
            body {
              margin: 0;
              padding: 20px;
              font-family: Arial, sans-serif;
              background: white;
            }
            
            .experience-item, .education-item {
              margin-bottom: 20px;
            }
            
            .experience-header, .education-header {
              display: flex;
              justify-content: space-between;
              align-items: baseline;
              margin-bottom: 5px;
            }
            
            .experience-header h4, .education-header h4 {
              margin: 0;
              font-size: 16px;
              font-weight: 600;
            }
            
            .company, .school {
              color: #666;
              font-size: 14px;
            }
            
            .experience-date, .education-date {
              color: #888;
              font-size: 13px;
              margin-bottom: 8px;
            }
            
            .experience-description, .education-description {
              margin: 0;
              line-height: 1.6;
              color: #333;
            }
            
            .skill-tag {
              display: inline-block;
              padding: 4px 12px;
              margin: 4px;
              background: #e3f2fd;
              color: #1976d2;
              border-radius: 16px;
              font-size: 13px;
            }
          </style>
        </head>
        <body>
          ${html}
        </body>
      </html>
    `

    setPreviewHtml(fullHtml)

    // Update iframe
    if (iframeRef.current) {
      const doc = iframeRef.current.contentDocument
      if (doc) {
        doc.open()
        doc.write(fullHtml)
        doc.close()
      }
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      <div className="bg-gray-100 dark:bg-gray-700 px-4 py-3 border-b border-gray-200 dark:border-gray-600">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Xem trước CV
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          CV sẽ được cập nhật tự động khi bạn nhập thông tin
        </p>
      </div>

      <div className="relative bg-gray-50 dark:bg-gray-900" style={{ height: '800px' }}>
        <iframe
          ref={iframeRef}
          title="CV Preview"
          className="w-full h-full border-0"
          sandbox="allow-same-origin"
        />

        {/* Loading overlay */}
        {!previewHtml && (
          <div className="absolute inset-0 flex items-center justify-center bg-white dark:bg-gray-800">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Đang tải preview...</p>
            </div>
          </div>
        )}
      </div>

      <div className="bg-gray-100 dark:bg-gray-700 px-4 py-3 border-t border-gray-200 dark:border-gray-600">
        <p className="text-xs text-gray-600 dark:text-gray-400">
          💡 Tip: Điền đầy đủ thông tin để xem CV hoàn chỉnh
        </p>
      </div>
    </div>
  )
}
