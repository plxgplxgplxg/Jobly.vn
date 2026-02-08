'use strict';

const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();
    
    // Lấy candidate IDs
    const candidates = await queryInterface.sequelize.query(
      `SELECT id FROM users WHERE role = 'candidate' ORDER BY created_at LIMIT 2`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (candidates.length < 2) {
      console.log('Không đủ candidates để tạo CVs');
      return;
    }

    const candidate1Id = candidates[0].id;
    const candidate2Id = candidates[1].id;

    // Tạo uploaded CVs
    await queryInterface.bulkInsert('uploaded_cvs', [
      {
        id: uuidv4(),
        user_id: candidate1Id,
        file_name: 'CV_NguyenVanA.pdf',
        file_url: '/uploads/cvs/cv_nguyen_van_a.pdf',
        file_size: 524288,
        uploaded_at: now
      },
      {
        id: uuidv4(),
        user_id: candidate2Id,
        file_name: 'CV_TranThiB.pdf',
        file_url: '/uploads/cvs/cv_tran_thi_b.pdf',
        file_size: 612352,
        uploaded_at: now
      }
    ], {});

    console.log('Đã tạo demo uploaded CVs');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('uploaded_cvs', null, {});
  }
};
