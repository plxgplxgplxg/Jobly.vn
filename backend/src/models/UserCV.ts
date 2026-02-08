import { Model, DataTypes } from 'sequelize';
import DatabaseConfig from '../config/database';

const sequelize = DatabaseConfig.getInstance().getSequelize();

class UserCV extends Model {
  public id!: string;
  public userId!: string;
  public templateId!: string;
  public contentJSON!: object;
  public pdfUrl?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

UserCV.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'user_id'
    },
    templateId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'template_id'
    },
    contentJSON: {
      type: DataTypes.JSONB,
      allowNull: false,
      field: 'content_json'
    },
    pdfUrl: {
      type: DataTypes.STRING(500),
      field: 'pdf_url'
    }
  },
  {
    sequelize,
    tableName: 'user_cvs',
    underscored: true
  }
);

export default UserCV;
