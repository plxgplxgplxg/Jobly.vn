import { Model, DataTypes } from 'sequelize';
import DatabaseConfig from '../config/database';

const sequelize = DatabaseConfig.getInstance().getSequelize();

export interface NotificationAttributes {
    id: string;
    userId: string; // The user who receives the notification
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error' | 'application' | 'interview' | 'status_update' | 'save' | 'message';
    link?: string; // Where to redirect (e.g., /applications/123)
    isRead: boolean;
    relatedId?: string; // ID of the related entity (e.g., Application ID, Job ID)
    createdAt?: Date;
    updatedAt?: Date;
}

class Notification extends Model<NotificationAttributes> implements NotificationAttributes {
    public id!: string;
    public userId!: string;
    public title!: string;
    public message!: string;
    public type!: 'info' | 'success' | 'warning' | 'error' | 'application' | 'interview' | 'status_update' | 'save' | 'message';
    public link?: string;
    public isRead!: boolean;
    public relatedId?: string;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Notification.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        userId: {
            type: DataTypes.UUID, // Assuming UUID, will confirm later
            allowNull: false,
            field: 'user_id',
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        message: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        type: {
            type: DataTypes.STRING,
            defaultValue: 'info',
        },
        link: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        isRead: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            field: 'is_read',
        },
        relatedId: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'related_id',
        },
    },
    {
        sequelize,
        tableName: 'notifications',
        underscored: true,
    }
);

export default Notification;
