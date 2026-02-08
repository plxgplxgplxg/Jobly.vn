'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('uploaded_cvs', {
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
      file_name: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      file_url: {
        type: Sequelize.STRING(500),
        allowNull: false
      },
      file_size: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      uploaded_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    await queryInterface.createTable('cv_templates', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      category: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      structure_json: {
        type: Sequelize.JSONB,
        allowNull: false
      },
      html_template: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      css_styles: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      preview_image_url: {
        type: Sequelize.STRING(500)
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    await queryInterface.createTable('user_cvs', {
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
      template_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'cv_templates', key: 'id' }
      },
      content_json: {
        type: Sequelize.JSONB,
        allowNull: false
      },
      pdf_url: {
        type: Sequelize.STRING(500)
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

    await queryInterface.addIndex('uploaded_cvs', ['user_id']);
    await queryInterface.addIndex('cv_templates', ['category']);
    await queryInterface.addIndex('user_cvs', ['user_id']);
    await queryInterface.addIndex('user_cvs', ['template_id']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('user_cvs');
    await queryInterface.dropTable('cv_templates');
    await queryInterface.dropTable('uploaded_cvs');
  }
};
