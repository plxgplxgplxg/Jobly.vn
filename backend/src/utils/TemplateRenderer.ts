import { CVTemplateDTO, CVContentJSON } from '../types/cv.types';

class TemplateRenderer {
  render(template: CVTemplateDTO, content: CVContentJSON): string {
    let html = template.htmlTemplate;

    for (const [sectionId, sectionData] of Object.entries(content.sections)) {
      for (const [fieldName, fieldValue] of Object.entries(sectionData)) {
        const placeholder = `{{${sectionId}.${fieldName}}}`;
        html = html.replace(new RegExp(placeholder, 'g'), this.formatValue(fieldValue));
      }
    }

    html = html.replace('</head>', `<style>${template.cssStyles}</style></head>`);

    return html;
  }

  private formatValue(value: any): string {
    if (Array.isArray(value)) {
      return value.map(item => `<li>${item}</li>`).join('');
    }
    if (value instanceof Date) {
      return value.toLocaleDateString('vi-VN');
    }
    return String(value);
  }
}

export default new TemplateRenderer();
