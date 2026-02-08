'use strict';

const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();
    const passwordHash = await bcrypt.hash('Admin123', 10);

    await queryInterface.bulkInsert('users', [
      // 1 Admin
      {
        id: uuidv4(),
        email: 'admin@jobly.vn',
        password_hash: passwordHash,
        name: 'Admin Jobly',
        role: 'admin',
        status: 'active',
        phone: '0901234567',
        created_at: now,
        updated_at: now
      },
      // 2 Candidate
      {
        id: uuidv4(),
        email: 'candidate1@test.com',
        password_hash: await bcrypt.hash('Test1234', 10),
        name: 'Nguyễn Văn A',
        role: 'candidate',
        status: 'active',
        phone: '0912345678',
        date_of_birth: new Date('1995-05-15'),
        address: 'Hà Nội',
        experience: '2 năm kinh nghiệm Frontend Developer',
        created_at: now,
        updated_at: now
      },
      {
        id: uuidv4(),
        email: 'candidate2@test.com',
        password_hash: await bcrypt.hash('Test1234', 10),
        name: 'Trần Thị B',
        role: 'candidate',
        status: 'active',
        phone: '0923456789',
        date_of_birth: new Date('1998-08-20'),
        address: 'TP.HCM',
        experience: '1 năm kinh nghiệm Backend Developer',
        created_at: now,
        updated_at: now
      },
      // 2 Employer (đã xác thực)
      {
        id: uuidv4(),
        email: 'employer1@company.com',
        password_hash: await bcrypt.hash('Test1234', 10),
        name: 'Công ty TNHH ABC',
        role: 'employer',
        status: 'active',
        phone: '0934567890',
        address: 'Hà Nội',
        created_at: now,
        updated_at: now
      },
      {
        id: uuidv4(),
        email: 'employer2@company.com',
        password_hash: await bcrypt.hash('Test1234', 10),
        name: 'Công ty Cổ phần XYZ',
        role: 'employer',
        status: 'pending',
        phone: '0945678901',
        address: 'TP.HCM',
        created_at: now,
        updated_at: now
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', {
      email: {
        [Sequelize.Op.in]: [
          'admin@jobly.vn',
          'candidate1@test.com',
          'candidate2@test.com',
          'employer1@company.com',
          'employer2@company.com'
        ]
      }
    }, {});
  }
};
