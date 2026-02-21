import { Model, DataTypes } from 'sequelize';
import DatabaseConfig from '../config/database';

const sequelize = DatabaseConfig.getInstance().getSequelize();

class SavedCandidate extends Model {
    public id!: string;
    public employerId!: string; // The Employer who saved the profile
    public candidateId!: string; // The Candidate whose profile was saved

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

SavedCandidate.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        employerId: {
            type: DataTypes.UUID,
            allowNull: false,
            field: 'employer_id',
        },
        candidateId: {
            type: DataTypes.UUID,
            allowNull: false,
            field: 'candidate_id',
        },
    },
    {
        sequelize,
        tableName: 'saved_candidates',
        underscored: true,
    }
);

export default SavedCandidate;
