'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('jobs', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      requirements: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      salary: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      location: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      deadline: {
        type: Sequelize.DATE,
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('pending', 'approved', 'rejected', 'expired', 'deleted', 'pending_vip_approval'),
        defaultValue: 'pending'
      },
      vip_flag: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      vip_expires_at: Sequelize.DATE,
      company_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'companies', key: 'id' },
        onDelete: 'CASCADE'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // Tạo indexes
    await queryInterface.addIndex('jobs', ['status']);
    await queryInterface.addIndex('jobs', ['company_id']);
    await queryInterface.addIndex('jobs', ['vip_flag', 'created_at']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('jobs');
  }
};
