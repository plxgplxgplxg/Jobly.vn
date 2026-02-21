import Notification, { NotificationAttributes } from '../models/Notification';

class NotificationService {
    async create(data: any): Promise<Notification> {
        return await Notification.create(data);
    }

    async listByUser(userId: string, limit: number = 20, offset: number = 0): Promise<{ rows: Notification[]; count: number }> {
        return await Notification.findAndCountAll({
            where: { userId },
            order: [['createdAt', 'DESC']],
            limit,
            offset,
        });
    }

    async markAsRead(id: string, userId: string): Promise<void> {
        await Notification.update({ isRead: true }, { where: { id, userId } });
    }

    async markAllAsRead(userId: string): Promise<void> {
        await Notification.update({ isRead: true }, { where: { userId, isRead: false } });
    }
}

export default new NotificationService();
