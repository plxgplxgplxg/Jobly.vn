import { apiClient } from './apiClient';

export interface Notification {
    id: string;
    userId: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error' | 'application' | 'interview' | 'status_update' | 'save' | 'message';
    link?: string;
    isRead: boolean;
    relatedId?: string;
    createdAt: string;
}

class NotificationService {
    async list(params?: { limit?: number; offset?: number }): Promise<{ rows: Notification[]; count: number }> {
        return await apiClient.get('/notifications', { params });
    }

    async markAsRead(id: string): Promise<void> {
        await apiClient.patch(`/notifications/${id}/read`);
    }

    async markAllAsRead(): Promise<void> {
        await apiClient.patch('/notifications/read-all');
    }
}

export const notificationService = new NotificationService();
