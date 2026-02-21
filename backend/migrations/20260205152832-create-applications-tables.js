
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      // Tạo bảng APPLICATIONS
      await queryInterface.createTable('applications', {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true
        },
        candidate_id: {
          type: Sequelize.UUID,
          allowNull: false,
          references: { model: 'users', key: 'id' },
          onDelete: 'CASCADE'
        },
        job_id: {
          type: Sequelize.UUID,
          allowNull: false,
          references: { model: 'jobs', key: 'id' },
          onDelete: 'CASCADE'
        },
        cv_id: {
          type: Sequelize.UUID,
          allowNull: false
        },
        cv_type: {
          type: Sequelize.ENUM('uploaded', 'template'),
          allowNull: false
        },
        cover_letter: Sequelize.TEXT,
        status: {
          type: Sequelize.ENUM('submitted', 'reviewing', 'interview', 'accepted', 'rejected', 'withdrawn'),
          defaultValue: 'submitted'
        },
        applied_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW
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

      // Tạo bảng APPLICATION_STATUS_HISTORY
      await queryInterface.createTable('application_status_history', {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true
        },
        application_id: {
          type: Sequelize.UUID,
          allowNull: false,
          references: { model: 'applications', key: 'id' },
          onDelete: 'CASCADE'
        },
        status: {
          type: Sequelize.STRING(20),
          allowNull: false
        },
        changed_by: {
          type: Sequelize.UUID,
          references: { model: 'users', key: 'id' }
        },
        changed_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW
        }
      });

      // Tạo indexes
      await queryInterface.addIndex('applications', ['candidate_id']);
      await queryInterface.addIndex('applications', ['job_id']);
      await queryInterface.addIndex('applications', ['status']);
      await queryInterface.addIndex('applications', ['candidate_id', 'job_id', 'cv_id'], {
        unique: true,
        name: 'unique_application'
      });
      await queryInterface.addIndex('application_status_history', ['application_id']);
    } catch (e) {
      if (e.message.includes('already exists')) {
        console.log('Tables applications or related types already exists, skipping...');
      } else {
        throw e;
      }
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('application_status_history');
    await queryInterface.dropTable('applications');
  }
};
