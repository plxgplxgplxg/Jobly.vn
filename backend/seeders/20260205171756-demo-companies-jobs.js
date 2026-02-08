'use strict';

const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();
    
    // Lấy employer IDs
    const employers = await queryInterface.sequelize.query(
      `SELECT id FROM users WHERE role = 'employer' ORDER BY created_at LIMIT 2`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (employers.length < 2) {
      console.log('Không đủ employers để tạo companies');
      return;
    }

    const employer1Id = employers[0].id;
    const employer2Id = employers[1].id;

    // Tạo companies
    const company1Id = uuidv4();
    const company2Id = uuidv4();

    await queryInterface.bulkInsert('companies', [
      {
        id: company1Id,
        user_id: employer1Id,
        name: 'Công ty TNHH Công nghệ ABC',
        tax_code: '0123456789',
        industry: 'Công nghệ thông tin',
        address: 'Tầng 5, Tòa nhà ABC, Hà Nội',
        description: 'Công ty chuyên về phát triển phần mềm và giải pháp công nghệ',
        created_at: now,
        updated_at: now
      },
      {
        id: company2Id,
        user_id: employer2Id,
        name: 'Công ty Cổ phần Giải pháp XYZ',
        tax_code: '9876543210',
        industry: 'Công nghệ thông tin',
        address: 'Tầng 10, Tòa nhà XYZ, TP.HCM',
        description: 'Công ty chuyên về tư vấn và triển khai hệ thống',
        created_at: now,
        updated_at: now
      }
    ], {});

    // Tạo jobs
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);

    await queryInterface.bulkInsert('jobs', [
      {
        id: uuidv4(),
        company_id: company1Id,
        title: 'Frontend Developer (ReactJS)',
        description: 'Chúng tôi đang tìm kiếm Frontend Developer có kinh nghiệm với ReactJS để tham gia dự án phát triển ứng dụng web.',
        requirements: '- 2+ năm kinh nghiệm ReactJS\n- Thành thạo HTML, CSS, JavaScript\n- Có kinh nghiệm với TypeScript là một lợi thế',
        salary: '15-25 triệu',
        location: 'Hà Nội',
        deadline: futureDate,
        status: 'approved',
        vip_flag: false,
        created_at: now,
        updated_at: now
      },
      {
        id: uuidv4(),
        company_id: company1Id,
        title: 'Backend Developer (Node.js)',
        description: 'Tìm kiếm Backend Developer có kinh nghiệm với Node.js để phát triển API và hệ thống backend.',
        requirements: '- 2+ năm kinh nghiệm Node.js\n- Thành thạo Express, PostgreSQL\n- Có kinh nghiệm với microservices là một lợi thế',
        salary: '18-30 triệu',
        location: 'Hà Nội',
        deadline: futureDate,
        status: 'approved',
        vip_flag: true,
        created_at: now,
        updated_at: now
      },
      {
        id: uuidv4(),
        company_id: company2Id,
        title: 'Full Stack Developer',
        description: 'Cần tuyển Full Stack Developer có khả năng làm việc với cả frontend và backend.',
        requirements: '- 3+ năm kinh nghiệm Full Stack\n- Thành thạo React, Node.js\n- Có kinh nghiệm làm việc với cloud (AWS/GCP)',
        salary: '20-35 triệu',
        location: 'TP.HCM',
        deadline: futureDate,
        status: 'approved',
        vip_flag: false,
        created_at: now,
        updated_at: now
      }
    ], {});

    console.log('Đã tạo demo companies và jobs');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('jobs', null, {});
    await queryInterface.bulkDelete('companies', null, {});
  }
};
