import { Model, DataTypes } from 'sequelize';
import DatabaseConfig from '../config/database';

const sequelize = DatabaseConfig.getInstance().getSequelize();

class UploadedCV extends Model {
  public id!: string;
  public userId!: string;
  public fileName!: string;
  public fileUrl!: string;
  public fileSize!: number;
  public isDefault!: boolean;
  public readonly uploadedAt!: Date;
}

UploadedCV.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'user_id',
      references: {
        model: 'users',
        key: 'id'
      }
    },
    fileName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'file_name'
    },
    fileUrl: {
      type: DataTypes.STRING(500),
      allowNull: false,
      field: 'file_url'
    },
    fileSize: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'file_size'
    },
    isDefault: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_default'
    },
    uploadedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'uploaded_at'
    }
  },
  {
    sequelize,
    tableName: 'uploaded_cvs',
    underscored: true,
    timestamps: false
  }
);

export default UploadedCV;
