'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const templateId = '550e8400-e29b-41d4-a716-446655440002';

    await queryInterface.bulkInsert('cv_templates', [
      {
        id: templateId,
        name: 'CV Ngành IT - Đầy đủ',
        description: 'Mẫu CV chuyên sâu dành cho lập trình viên với đầy đủ các phần: Dự án, Kỹ năng chi tiết, Chứng chỉ... Giúp bạn nổi bật trước nhà tuyển dụng công nghệ.',
        category: 'IT Professional',
        structure_json: JSON.stringify({
          sections: [
            {
              id: 'personal',
              type: 'personal',
              label: 'Thông tin cá nhân',
              required: true,
              fields: [
                { name: 'fullName', type: 'text', label: 'Họ và tên', required: true },
                { name: 'dateOfBirth', type: 'date', label: 'Ngày sinh', required: false },
                { name: 'gender', type: 'text', label: 'Giới tính', required: false },
                { name: 'phone', type: 'text', label: 'Điện thoại', required: true },
                { name: 'email', type: 'text', label: 'Email', required: true },
                { name: 'address', type: 'text', label: 'Địa chỉ', required: false },
                { name: 'linkedin', type: 'text', label: 'LinkedIn', required: false },
                { name: 'github', type: 'text', label: 'GitHub', required: false }
              ]
            },
            {
              id: 'objective',
              type: 'custom',
              label: 'Mục tiêu nghề nghiệp',
              required: false,
              fields: [
                { name: 'content', type: 'textarea', label: 'Nội dung', required: false }
              ]
            },
            {
              id: 'skills',
              type: 'skills',
              label: 'Kỹ năng chuyên môn',
              required: false,
              fields: [
                { name: 'languages', type: 'text', label: 'Ngôn ngữ lập trình', required: false },
                { name: 'frontend', type: 'text', label: 'Front-end', required: false },
                { name: 'backend', type: 'text', label: 'Back-end', required: false },
                { name: 'database', type: 'text', label: 'Cơ sở dữ liệu', required: false },
                { name: 'devops', type: 'text', label: 'Công cụ/DevOps', required: false },
                { name: 'other', type: 'text', label: 'Khác', required: false }
              ]
            },
            {
              id: 'experience',
              type: 'experience',
              label: 'Kinh nghiệm làm việc',
              required: false,
              fields: [
                { name: 'items', type: 'list', label: 'Danh sách kinh nghiệm', required: false }
              ]
            },
            {
              id: 'projects',
              type: 'custom',
              label: 'Dự án tiêu biểu',
              required: false,
              fields: [
                { name: 'items', type: 'list', label: 'Danh sách dự án', required: false }
              ]
            },
            {
              id: 'education',
              type: 'education',
              label: 'Học vấn',
              required: false,
              fields: [
                { name: 'school', type: 'text', label: 'Trường', required: true },
                { name: 'degree', type: 'text', label: 'Bằng cấp', required: true },
                { name: 'year', type: 'text', label: 'Năm', required: true }
              ]
            },
            {
              id: 'certificates',
              type: 'custom',
              label: 'Chứng chỉ',
              required: false,
              fields: [
                { name: 'items', type: 'list', label: 'Danh sách chứng chỉ', required: false }
              ]
            },
            {
              id: 'activities',
              type: 'custom',
              label: 'Hoạt động',
              required: false,
              fields: [
                { name: 'items', type: 'list', label: 'Danh sách hoạt động', required: false }
              ]
            },
            {
              id: 'hobbies',
              type: 'custom',
              label: 'Sở thích',
              required: false,
              fields: [
                { name: 'items', type: 'list', label: 'Danh sách sở thích', required: false }
              ]
            },
            {
              id: 'references',
              type: 'custom',
              label: 'Người tham chiếu',
              required: false,
              fields: [
                { name: 'items', type: 'list', label: 'Danh sách người tham chiếu', required: false }
              ]
            }
          ]
        }),
        html_template: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>CV</title>
</head>
<body>
  <div class="cv-container">
    <div class="header">
      <h1>{{personal.fullName}}</h1>
      <h2 style="color: #3498db; margin: 0 0 20px 0; font-size: 20px;">{{personal.title}}</h2>
      <div class="contact-info">
        <p><strong>Ngày sinh:</strong> {{personal.dateOfBirth}}</p>
        <p><strong>Giới tính:</strong> {{personal.gender}}</p>
        <p><strong>Điện thoại:</strong> {{personal.phone}}</p>
        <p><strong>Email:</strong> {{personal.email}}</p>
        <p><strong>Địa chỉ:</strong> {{personal.address}}</p>
        {{personal.custom_info}}
      </div>
    </div>
    
    <div class="section">
      <h2>GIỚI THIỆU BẢN THÂN</h2>
      <p>{{objective.content}}</p>
    </div>
    
    <div class="section">
      <h2>KỸ NĂNG CHUYÊN MÔN</h2>
      <div class="skills-grid">
        <p><strong>Ngôn ngữ lập trình:</strong> {{skills.languages}}</p>
        <p><strong>Front-end:</strong> {{skills.frontend}}</p>
        <p><strong>Back-end:</strong> {{skills.backend}}</p>
        <p><strong>Cơ sở dữ liệu:</strong> {{skills.database}}</p>
        <p><strong>Công cụ/DevOps:</strong> {{skills.devops}}</p>
        <p><strong>Khác:</strong> {{skills.other}}</p>
      </div>
    </div>
    
    <div class="section">
      <h2>KINH NGHIỆM LÀM VIỆC</h2>
      <div class="experience-list">
        {{experience.items}}
      </div>
    </div>
    
    <div class="section">
      <h2>DỰ ÁN TIÊU BIỂU</h2>
      <div class="projects-list">
        {{projects.items}}
      </div>
    </div>
    
    <div class="section">
      <h2>HỌC VẤN</h2>
      <p><strong>{{education.school}}</strong></p>
      <p>{{education.degree}} ({{education.year}})</p>
    </div>
    
    <div class="section">
      <h2>CHỨNG CHỈ</h2>
      <ul class="simple-list">
        {{certificates.items}}
      </ul>
    </div>
    
    <div class="section">
      <h2>HOẠT ĐỘNG</h2>
      <ul class="simple-list">
        {{activities.items}}
      </ul>
    </div>
    
    <div class="section">
      <h2>SỞ THÍCH</h2>
      <ul class="simple-list">
        {{hobbies.items}}
      </ul>
    </div>
    
    <div class="section">
      <h2>NGƯỜI THAM CHIẾU</h2>
      <div class="references-list">
        {{references.items}}
      </div>
    </div>
  </div>
</body>
</html>
        `,
        css_styles: `
body {
  font-family: 'Arial', sans-serif;
  line-height: 1.6;
  color: #333;
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
  background: #f5f5f5;
}

.cv-container {
  background: white;
  padding: 40px;
  box-shadow: 0 0 20px rgba(0,0,0,0.1);
}

.header {
  text-align: center;
  border-bottom: 3px solid #2c3e50;
  padding-bottom: 20px;
  margin-bottom: 30px;
}

.header h1 {
  margin: 0 0 20px 0;
  font-size: 36px;
  color: #2c3e50;
  text-transform: uppercase;
  letter-spacing: 2px;
}

.contact-info {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 5px;
  text-align: left;
  max-width: 600px;
  margin: 0 auto;
}

.contact-info p {
  margin: 5px 0;
  font-size: 14px;
}

.section {
  margin-bottom: 25px;
  page-break-inside: avoid;
}

.section h2 {
  color: #2c3e50;
  border-bottom: 2px solid #3498db;
  padding-bottom: 8px;
  margin-bottom: 15px;
  font-size: 18px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.skills-grid p {
  margin: 8px 0;
  line-height: 1.8;
}

.experience-list, .projects-list, .references-list {
  margin-left: 0;
}

.experience-list > div, .projects-list > div, .references-list > div {
  margin-bottom: 20px;
  padding-left: 20px;
  border-left: 3px solid #3498db;
}

.simple-list {
  list-style: none;
  padding-left: 0;
}

.simple-list li {
  padding: 5px 0;
  padding-left: 20px;
  position: relative;
}

.simple-list li:before {
  content: "▸";
  position: absolute;
  left: 0;
  color: #3498db;
  font-weight: bold;
}

strong {
  color: #2c3e50;
}

@media print {
  body {
    background: white;
    padding: 0;
  }
  
  .cv-container {
    box-shadow: none;
    padding: 20px;
  }
}
        `,
        preview_image_url: '/uploads/previews/it_full.png',
        created_at: new Date(),
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('cv_templates', {
      id: '550e8400-e29b-41d4-a716-446655440002'
    }, {});
  }
};
