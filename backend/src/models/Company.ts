import { Model, DataTypes } from 'sequelize';
import DatabaseConfig from '../config/database';

const sequelize = DatabaseConfig.getInstance().getSequelize();

class Company extends Model {
  public id!: string;
  public name!: string;
  public taxCode!: string;
  public industry!: string;
  public logoUrl?: string;
  public description?: string;
  public userId!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Company.init(
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
    taxCode: {
      type: DataTypes.STRING(13),
      allowNull: false,
      unique: true,
      field: 'tax_code',
      validate: {
        is: /^[0-9]{10}$|^[0-9]{13}$/
      }
    },
    industry: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    logoUrl: {
      type: DataTypes.STRING(500),
      field: 'logo_url'
    },
    description: DataTypes.TEXT,
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'user_id',
      references: {
        model: 'users',
        key: 'id'
      }
    }
  },
  {
    sequelize,
    tableName: 'companies',
    underscored: true
  }
);

export default Company;
