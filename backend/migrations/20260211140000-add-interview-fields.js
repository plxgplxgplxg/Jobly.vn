'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        try {
            await queryInterface.addColumn('applications', 'interview_date', {
                type: Sequelize.DATEONLY,
                allowNull: true
            });
            await queryInterface.addColumn('applications', 'interview_time', {
                type: Sequelize.TIME,
                allowNull: true
            });
            await queryInterface.addColumn('applications', 'interview_location', {
                type: Sequelize.STRING,
                allowNull: true
            });
            await queryInterface.addColumn('applications', 'interview_note', {
                type: Sequelize.TEXT,
                allowNull: true
            });
        } catch (e) {
            if (e.message && e.message.includes('already exists')) {
                console.log('Columns already exist, skipping...');
            } else {
                throw e;
            }
        }
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('applications', 'interview_date');
        await queryInterface.removeColumn('applications', 'interview_time');
        await queryInterface.removeColumn('applications', 'interview_location');
        await queryInterface.removeColumn('applications', 'interview_note');
    }
};
