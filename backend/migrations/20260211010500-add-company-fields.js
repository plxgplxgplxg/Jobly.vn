'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        const tableInfo = await queryInterface.describeTable('companies');

        if (!tableInfo.address) {
            await queryInterface.addColumn('companies', 'address', {
                type: Sequelize.TEXT,
                allowNull: true
            });
        }

        if (!tableInfo.size) {
            await queryInterface.addColumn('companies', 'size', {
                type: Sequelize.STRING(50),
                allowNull: true
            });
        }

        if (!tableInfo.website) {
            await queryInterface.addColumn('companies', 'website', {
                type: Sequelize.STRING(255),
                allowNull: true
            });
        }
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('companies', 'website');
        await queryInterface.removeColumn('companies', 'size');
        await queryInterface.removeColumn('companies', 'address');
    }
};
