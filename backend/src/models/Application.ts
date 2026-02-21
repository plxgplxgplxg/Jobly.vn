import { Model, DataTypes } from 'sequelize';
import DatabaseConfig from '../config/database';

const sequelize = DatabaseConfig.getInstance().getSequelize();

export type ApplicationStatus = 'submitted' | 'reviewing' | 'interview' | 'accepted' | 'rejected' | 'withdrawn';
export type CVType = 'uploaded' | 'template';

class Application extends Model {
  public id!: string;
  public candidateId!: string;
  public jobId!: string;
  public cvId!: string;
  public cvType!: CVType;
  public coverLetter?: string;
  public interviewDate?: string;
  public interviewTime?: string;
  public interviewLocation?: string;
  public interviewNote?: string;
  public status!: ApplicationStatus;
  public appliedAt!: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Application.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    candidateId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'candidate_id',
      references: {
        model: 'users',
        key: 'id'
      }
    },
    jobId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'job_id',
      references: {
        model: 'jobs',
        key: 'id'
      }
    },
    cvId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'cv_id'
    },
    cvType: {
      type: DataTypes.ENUM('uploaded', 'template'),
      allowNull: false,
      field: 'cv_type'
    },
    coverLetter: {
      type: DataTypes.TEXT,
      field: 'cover_letter'
    },
    interviewDate: {
      type: DataTypes.DATEONLY,
      field: 'interview_date'
    },
    interviewTime: {
      type: DataTypes.TIME,
      field: 'interview_time'
    },
    interviewLocation: {
      type: DataTypes.STRING,
      field: 'interview_location'
    },
    interviewNote: {
      type: DataTypes.TEXT,
      field: 'interview_note'
    },
    status: {
      type: DataTypes.ENUM('submitted', 'reviewing', 'interview', 'accepted', 'rejected', 'withdrawn'),
      defaultValue: 'submitted'
    },
    appliedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'applied_at'
    }
  },
  {
    sequelize,
    tableName: 'applications',
    underscored: true,
    indexes: [
      { fields: ['candidate_id'] },
      { fields: ['job_id'] },
      { fields: ['status'] },
      {
        unique: true,
        fields: ['candidate_id', 'job_id', 'cv_id'],
        name: 'unique_application'
      }
    ]
  }
);

export default Application;
