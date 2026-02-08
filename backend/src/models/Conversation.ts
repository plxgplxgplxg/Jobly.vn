import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface ConversationAttributes {
  id: string;
  user1Id: string;
  user2Id: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ConversationCreationAttributes extends Optional<ConversationAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class Conversation extends Model<ConversationAttributes, ConversationCreationAttributes> implements ConversationAttributes {
  public id!: string;
  public user1Id!: string;
  public user2Id!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Conversation.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user1Id: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'user1_id',
    },
    user2Id: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'user2_id',
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'created_at',
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'updated_at',
    },
  },
  {
    sequelize,
    tableName: 'conversations',
    timestamps: true,
    underscored: true,
  }
);

export default Conversation;
