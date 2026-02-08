'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const templateId = '550e8400-e29b-41d4-a716-446655440001';

    await queryInterface.bulkInsert('cv_templates', [
      {
        id: templateId,
        name: 'CV Chuyên nghiệp',
        description: 'Mẫu CV với phong cách tối giản, tập trung vào kinh nghiệm làm việc và kỹ năng cốt lõi. Phù hợp cho đa dạng ngành nghề.',
        category: 'Professional',
        structure_json: JSON.stringify({
          sections: [
            {
              id: 'personal',
              type: 'personal',
              label: 'Thông tin cá nhân',
              required: true,
              fields: [
                { name: 'fullName', type: 'text', label: 'Họ và tên', required: true },
                { name: 'email', type: 'text', label: 'Email', required: true },
                { name: 'phone', type: 'text', label: 'Số điện thoại', required: true },
                { name: 'address', type: 'text', label: 'Địa chỉ', required: false }
              ]
            },
            {
              id: 'experience',
              type: 'experience',
              label: 'Kinh nghiệm làm việc',
              required: false,
              fields: [
                { name: 'company', type: 'text', label: 'Công ty', required: true },
                { name: 'position', type: 'text', label: 'Vị trí', required: true },
                { name: 'duration', type: 'text', label: 'Thời gian', required: true },
                { name: 'description', type: 'textarea', label: 'Mô tả công việc', required: false }
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
                { name: 'year', type: 'text', label: 'Năm tốt nghiệp', required: true }
              ]
            },
            {
              id: 'skills',
              type: 'skills',
              label: 'Kỹ năng',
              required: false,
              fields: [
                { name: 'skillList', type: 'list', label: 'Danh sách kỹ năng', required: false }
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
      <p>{{personal.email}} | {{personal.phone}}</p>
      <p>{{personal.address}}</p>
    </div>
    
    <div class="section">
      <h2>Kinh nghiệm làm việc</h2>
      <div class="experience-item">
        <h3>{{experience.position}} - {{experience.company}}</h3>
        <p class="duration">{{experience.duration}}</p>
        <p>{{experience.description}}</p>
      </div>
    </div>
    
    <div class="section">
      <h2>Học vấn</h2>
      <div class="education-item">
        <h3>{{education.degree}} - {{education.school}}</h3>
        <p>{{education.year}}</p>
      </div>
    </div>
    
    <div class="section">
      <h2>Kỹ năng</h2>
      <ul class="skills-list">
        {{skills.skillList}}
      </ul>
    </div>
  </div>
</body>
</html>
        `,
        css_styles: `
body {
  font-family: Arial, sans-serif;
  line-height: 1.6;
  color: #333;
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.cv-container {
  background: white;
}

.header {
  text-align: center;
  border-bottom: 2px solid #333;
  padding-bottom: 20px;
  margin-bottom: 30px;
}

.header h1 {
  margin: 0;
  font-size: 32px;
  color: #2c3e50;
}

.header p {
  margin: 5px 0;
  color: #7f8c8d;
}

.section {
  margin-bottom: 30px;
}

.section h2 {
  color: #2c3e50;
  border-bottom: 1px solid #bdc3c7;
  padding-bottom: 5px;
  margin-bottom: 15px;
}

.experience-item, .education-item {
  margin-bottom: 20px;
}

.experience-item h3, .education-item h3 {
  margin: 0 0 5px 0;
  color: #34495e;
}

.duration {
  color: #7f8c8d;
  font-style: italic;
  margin: 0 0 10px 0;
}

.skills-list {
  list-style: none;
  padding: 0;
}

.skills-list li {
  display: inline-block;
  background: #ecf0f1;
  padding: 5px 15px;
  margin: 5px;
  border-radius: 3px;
}
        `,
        preview_image_url: '/uploads/previews/professional.png',
        created_at: new Date(),
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('cv_templates', null, {});
  }
};
