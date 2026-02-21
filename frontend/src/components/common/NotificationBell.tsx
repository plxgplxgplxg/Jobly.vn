import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificationService, type Notification } from '../../services/api/notification.service';
import { useAuthStore } from '../../store/authStore';

export const NotificationBell = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const { isAuthenticated } = useAuthStore();
    const navigate = useNavigate();
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isAuthenticated) {
            fetchNotifications();
            const interval = setInterval(fetchNotifications, 15000); // Poll every 15s
            return () => clearInterval(interval);
        }
    }, [isAuthenticated]);

    useEffect(() => {
        // Close dropdown when clicking outside
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchNotifications = async () => {
        try {
            const { rows } = await notificationService.list({ limit: 10 });
            setNotifications(rows);
            setUnreadCount(rows.filter(n => !n.isRead).length);
        } catch (error) {
            console.error('Failed to fetch notifications', error);
        }
    };

    const handleNotificationClick = async (notification: Notification) => {
        try {
            if (!notification.isRead) {
                await notificationService.markAsRead(notification.id);
                // Optimistic update
                setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n));
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
            setIsOpen(false);

            if (notification.link) {
                navigate(notification.link);
            }
        } catch (error) {
            console.error('Failed to handle notification click', error);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await notificationService.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error(error);
        }
    }

    if (!isAuthenticated) return null;

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
                aria-label="Notifications"
            >
                <span className={`material-symbols-outlined text-xl ${isOpen ? 'text-primary' : 'text-slate-600 dark:text-slate-400'}`}>
                    notifications
                </span>
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse border border-white dark:border-slate-900"></span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 z-50 overflow-hidden animate-fadeIn">
                    <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                        <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">Thông báo</h3>
                        {unreadCount > 0 && (
                            <button onClick={handleMarkAllRead} className="text-xs text-primary hover:text-primary-dark font-medium">
                                Đánh dấu đã đọc
                            </button>
                        )}
                    </div>

                    <div className="max-h-[70vh] overflow-y-auto">
                        {notifications.length > 0 ? (
                            <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                                {notifications.map((notification) => (
                                    <li key={notification.id}>
                                        <button
                                            onClick={() => handleNotificationClick(notification)}
                                            className={`w-full text-left p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex gap-3 ${!notification.isRead ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                                                }`}
                                        >
                                            <div className={`mt-1 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${notification.type === 'success' ? 'bg-green-100 text-green-600' :
                                                notification.type === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                                                    notification.type === 'error' ? 'bg-red-100 text-red-600' :
                                                        notification.type === 'save' ? 'bg-pink-100 text-pink-600' :
                                                            'bg-blue-100 text-blue-600'
                                                }`}>
                                                <span className="material-symbols-outlined text-lg">
                                                    {notification.type === 'save' ? 'favorite' :
                                                        notification.type === 'application' ? 'assignment' :
                                                            notification.type === 'status_update' ? 'update' :
                                                                notification.type === 'interview' ? 'calendar_today' : 'notifications'}
                                                </span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-sm font-medium text-slate-900 dark:text-slate-100 mb-0.5 ${!notification.isRead ? 'font-bold' : ''}`}>
                                                    {notification.title}
                                                </p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                                                    {notification.message}
                                                </p>
                                                <p className="text-[10px] text-slate-400 mt-1">
                                                    {new Date(notification.createdAt).toLocaleString('vi-VN')}
                                                </p>
                                            </div>
                                            {!notification.isRead && (
                                                <div className="mt-2 w-2 h-2 rounded-full bg-primary flex-shrink-0"></div>
                                            )}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-sm">
                                <span className="material-symbols-outlined text-4xl mb-2 text-slate-300">notifications_off</span>
                                <p>Không có thông báo nào</p>
                            </div>
                        )}
                    </div>
                    <div className="p-2 border-t border-slate-200 dark:border-slate-800 text-center bg-slate-50 dark:bg-slate-800/50">
                        <button className="text-xs font-semibold text-primary hover:text-primary-dark">
                            Xem tất cả
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
