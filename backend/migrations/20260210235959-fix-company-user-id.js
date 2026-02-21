
'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        // Check if the column exists first to avoid errors if run multiple times or in different states
        const tableInfo = await queryInterface.describeTable('companies');
        if (tableInfo.employer_id && !tableInfo.user_id) {
            await queryInterface.renameColumn('companies', 'employer_id', 'user_id');
        }
    },

    async down(queryInterface, Sequelize) {
        const tableInfo = await queryInterface.describeTable('companies');
        if (tableInfo.user_id && !tableInfo.employer_id) {
            await queryInterface.renameColumn('companies', 'user_id', 'employer_id');
        }
    }
};
