import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface MessageAttributes {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  isRead: boolean;
  sentAt?: Date;
}

interface MessageCreationAttributes extends Optional<MessageAttributes, 'id' | 'isRead' | 'sentAt'> {}

class Message extends Model<MessageAttributes, MessageCreationAttributes> implements MessageAttributes {
  public id!: string;
  public conversationId!: string;
  public senderId!: string;
  public receiverId!: string;
  public content!: string;
  public isRead!: boolean;
  public readonly sentAt!: Date;
}

Message.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    conversationId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'conversation_id',
    },
    senderId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'sender_id',
    },
    receiverId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'receiver_id',
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_read',
    },
    sentAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'sent_at',
    },
  },
  {
    sequelize,
    tableName: 'messages',
    timestamps: false,
  }
);

export default Message;
