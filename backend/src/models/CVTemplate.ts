import { Model, DataTypes } from 'sequelize';
import DatabaseConfig from '../config/database';

const sequelize = DatabaseConfig.getInstance().getSequelize();

class CVTemplate extends Model {
  public id!: string;
  public name!: string;
  public description?: string;
  public category!: string;
  public structureJSON!: object;
  public htmlTemplate!: string;
  public cssStyles!: string;
  public previewImageUrl?: string;
  public readonly createdAt!: Date;
}

CVTemplate.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    category: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    structureJSON: {
      type: DataTypes.JSONB,
      allowNull: false,
      field: 'structure_json'
    },
    htmlTemplate: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'html_template'
    },
    cssStyles: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'css_styles'
    },
    previewImageUrl: {
      type: DataTypes.STRING(500),
      field: 'preview_image_url'
    }
  },
  {
    sequelize,
    tableName: 'cv_templates',
    underscored: true,
    updatedAt: false
  }
);

export default CVTemplate;
