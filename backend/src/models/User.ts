import { Model, DataTypes } from 'sequelize';
import DatabaseConfig from '../config/database';

const sequelize = DatabaseConfig.getInstance().getSequelize();

class User extends Model {
  public id!: string;
  public email!: string;
  public phone?: string;
  public passwordHash!: string;
  public name!: string;
  public role!: 'candidate' | 'employer' | 'admin';
  public status!: 'pending' | 'active' | 'locked' | 'deleted';
  public address?: string;
  public dateOfBirth?: Date;
  public experience?: string;
  public avatarUrl?: string;

  public desiredPosition?: string;
  public experienceLevel?: string;
  public jobLevel?: string;
  public workType?: string;
  public gender?: string;
  public expectedSalary?: string;
  public industry?: string;
  public province?: string;
  public district?: string;
  public ward?: string;
  public willingToRelocate?: boolean;
  public profileCompleted?: boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: { isEmail: true }
    },
    phone: {
      type: DataTypes.STRING(20),
      unique: true
    },
    passwordHash: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'password_hash'
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    role: {
      type: DataTypes.ENUM('candidate', 'employer', 'admin'),
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('pending', 'active', 'locked', 'deleted'),
      defaultValue: 'pending'
    },
    address: DataTypes.TEXT,
    dateOfBirth: {
      type: DataTypes.DATE,
      field: 'date_of_birth'
    },
    experience: DataTypes.TEXT,
    avatarUrl: {
      type: DataTypes.STRING(500),
      field: 'avatar_url'
    },
    desiredPosition: {
      type: DataTypes.STRING(255),
      field: 'desired_position'
    },
    experienceLevel: {
      type: DataTypes.ENUM('no_experience', 'under_1_year', '1_2_years', '3_5_years', '5_10_years', 'over_10_years'),
      field: 'experience_level'
    },
    jobLevel: {
      type: DataTypes.ENUM('intern', 'fresher', 'junior', 'middle', 'senior', 'leader', 'manager', 'director'),
      field: 'job_level'
    },
    workType: {
      type: DataTypes.ENUM('full_time', 'part_time', 'freelance', 'internship', 'contract'),
      field: 'work_type'
    },
    gender: {
      type: DataTypes.ENUM('male', 'female', 'other')
    },
    expectedSalary: {
      type: DataTypes.STRING(100),
      field: 'expected_salary'
    },
    industry: DataTypes.STRING(255),
    province: DataTypes.STRING(100),
    district: DataTypes.STRING(100),
    ward: DataTypes.STRING(100),
    willingToRelocate: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'willing_to_relocate'
    },
    profileCompleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'profile_completed'
    }
  },
  {
    sequelize,
    tableName: 'users',
    underscored: true
  }
);

export default User;
