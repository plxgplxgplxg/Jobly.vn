import { Model, DataTypes } from 'sequelize';
import DatabaseConfig from '../config/database';
import { ApplicationStatus } from './Application';

const sequelize = DatabaseConfig.getInstance().getSequelize();

class ApplicationStatusHistory extends Model {
  public id!: string;
  public applicationId!: string;
  public status!: ApplicationStatus;
  public changedBy?: string;
  public changedAt!: Date;
}

ApplicationStatusHistory.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    applicationId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'application_id',
      references: {
        model: 'applications',
        key: 'id'
      }
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    changedBy: {
      type: DataTypes.UUID,
      field: 'changed_by',
      references: {
        model: 'users',
        key: 'id'
      }
    },
    changedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'changed_at'
    }
  },
  {
    sequelize,
    tableName: 'application_status_history',
    underscored: true,
    timestamps: false
  }
);

export default ApplicationStatusHistory;
