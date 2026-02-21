import { Model, DataTypes } from 'sequelize';
import DatabaseConfig from '../config/database';

const sequelize = DatabaseConfig.getInstance().getSequelize();

export type JobStatus = 'pending' | 'approved' | 'rejected' | 'expired' | 'deleted' | 'pending_vip_approval';

class Job extends Model {
  public id!: string;
  public title!: string;
  public description!: string;
  public requirements!: string;
  public salary!: string;
  public location!: string;
  public deadline!: Date;
  public status!: JobStatus;
  public vipFlag!: boolean;
  public vipExpiresAt?: Date;
  public companyId!: string;
  public company?: any; // Avoid circular dependency import for now
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Job.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    requirements: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    salary: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    location: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    deadline: {
      type: DataTypes.DATE,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected', 'expired', 'deleted', 'pending_vip_approval'),
      defaultValue: 'pending'
    },
    vipFlag: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'vip_flag'
    },
    vipExpiresAt: {
      type: DataTypes.DATE,
      field: 'vip_expires_at'
    },
    companyId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'company_id',
      references: {
        model: 'companies',
        key: 'id'
      }
    }
  },
  {
    sequelize,
    tableName: 'jobs',
    underscored: true,
    indexes: [
      { fields: ['status'] },
      { fields: ['company_id'] },
      { fields: ['vip_flag', 'created_at'] }
    ]
  }
);

export default Job;
