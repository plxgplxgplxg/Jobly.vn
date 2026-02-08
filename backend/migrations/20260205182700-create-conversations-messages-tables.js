'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Tạo bảng CONVERSATIONS
    await queryInterface.createTable('conversations', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      user1_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      user2_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });

    // Tạo unique constraint cho user1_id và user2_id
    await queryInterface.addConstraint('conversations', {
      fields: ['user1_id', 'user2_id'],
      type: 'unique',
      name: 'unique_conversation_users',
    });

    // Tạo bảng MESSAGES
    await queryInterface.createTable('messages', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      conversation_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'conversations',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      sender_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      receiver_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      is_read: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      sent_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });

    // Tạo indexes
    await queryInterface.addIndex('messages', ['conversation_id', 'sent_at'], {
      name: 'idx_messages_conversation',
    });

    await queryInterface.addIndex('messages', ['receiver_id', 'is_read'], {
      name: 'idx_messages_receiver',
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('messages');
    await queryInterface.dropTable('conversations');
  }
};
