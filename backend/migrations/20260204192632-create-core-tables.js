'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true
      },
      phone: {
        type: Sequelize.STRING(20),
        unique: true
      },
      password_hash: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      role: {
        type: Sequelize.ENUM('candidate', 'employer', 'admin'),
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('pending', 'active', 'locked', 'deleted'),
        defaultValue: 'pending'
      },
      address: Sequelize.TEXT,
      date_of_birth: Sequelize.DATE,
      experience: Sequelize.TEXT,
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

    await queryInterface.createTable('otp_codes', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE'
      },
      code: {
        type: Sequelize.STRING(6),
        allowNull: false
      },
      purpose: {
        type: Sequelize.ENUM('registration', 'password_reset'),
        allowNull: false
      },
      expires_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      used: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    await queryInterface.createTable('companies', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE'
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      tax_code: {
        type: Sequelize.STRING(13),
        allowNull: false,
        unique: true
      },
      industry: Sequelize.STRING(255),
      address: Sequelize.TEXT,
      description: Sequelize.TEXT,
      logo_url: Sequelize.STRING(500),
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

    await queryInterface.addIndex('users', ['email']);
    await queryInterface.addIndex('users', ['phone']);
    await queryInterface.addIndex('users', ['role', 'status']);
    await queryInterface.addIndex('otp_codes', ['user_id', 'purpose']);
    await queryInterface.addIndex('companies', ['user_id']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('companies');
    await queryInterface.dropTable('otp_codes');
    await queryInterface.dropTable('users');
  }
};
