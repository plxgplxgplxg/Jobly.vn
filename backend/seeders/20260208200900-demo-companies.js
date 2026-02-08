'use strict';

const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const now = new Date();

        // Lay tat ca employers chua co company
        const employersWithoutCompany = await queryInterface.sequelize.query(
            `SELECT u.id, u.email, u.name 
       FROM users u 
       LEFT JOIN companies c ON u.id = c.user_id 
       WHERE u.role = 'employer' AND c.id IS NULL`,
            { type: Sequelize.QueryTypes.SELECT }
        );

        if (employersWithoutCompany.length === 0) {
            console.log('Tat ca employer da co company');
            return;
        }

        const companies = [];

        // Tax codes bat dau tu so cao de tranh trung
        let taxCodeCounter = 1000000000;

        for (const employer of employersWithoutCompany) {
            companies.push({
                id: uuidv4(),
                name: employer.name || `Công ty ${employer.email}`,
                tax_code: String(taxCodeCounter++),
                industry: 'Công nghệ thông tin',
                description: `Công ty ${employer.name || employer.email} - Chuyên cung cấp các giải pháp công nghệ và phần mềm chất lượng cao.`,
                user_id: employer.id,
                created_at: now,
                updated_at: now
            });
        }

        if (companies.length > 0) {
            await queryInterface.bulkInsert('companies', companies, {});
            console.log(`Da tao ${companies.length} company records cho employers: ${employersWithoutCompany.map(e => e.email).join(', ')}`);
        }
    },

    async down(queryInterface, Sequelize) {
        const employers = await queryInterface.sequelize.query(
            `SELECT id FROM users WHERE role = 'employer'`,
            { type: Sequelize.QueryTypes.SELECT }
        );

        if (employers.length > 0) {
            const employerIds = employers.map(e => e.id);
            await queryInterface.bulkDelete('companies', {
                user_id: {
                    [Sequelize.Op.in]: employerIds
                }
            }, {});
        }
    }
};
