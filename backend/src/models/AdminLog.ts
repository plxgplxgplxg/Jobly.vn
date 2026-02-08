import { Model, DataTypes } from 'sequelize';
import DatabaseConfig from '../config/database';

const sequelize = DatabaseConfig.getInstance().getSequelize();

class AdminLog extends Model {
  public id!: string;
  public adminId!: string;
  public action!: string;
  public targetType?: string;
  public targetId?: string;
  public details?: object;
  public readonly createdAt!: Date;
}

AdminLog.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    adminId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'admin_id',
      references: {
        model: 'users',
        key: 'id'
      }
    },
    action: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    targetType: {
      type: DataTypes.STRING(50),
      field: 'target_type'
    },
    targetId: {
      type: DataTypes.UUID,
      field: 'target_id'
    },
    details: {
      type: DataTypes.JSONB
    }
  },
  {
    sequelize,
    tableName: 'admin_logs',
    underscored: true,
    updatedAt: false
  }
);

export default AdminLog;
