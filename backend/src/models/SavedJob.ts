import { Model, DataTypes } from 'sequelize';
import DatabaseConfig from '../config/database';

const sequelize = DatabaseConfig.getInstance().getSequelize();

class SavedJob extends Model {
    public id!: string;
    public userId!: string; // Candidate ID
    public jobId!: string;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

SavedJob.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        userId: {
            type: DataTypes.UUID,
            allowNull: false,
            field: 'user_id',
        },
        jobId: {
            type: DataTypes.UUID,
            allowNull: false,
            field: 'job_id',
        },
    },
    {
        sequelize,
        tableName: 'saved_jobs',
        underscored: true,
    }
);

export default SavedJob;
