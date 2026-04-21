/**
 * Notification System Component
 * In-app notifications with real-time updates
 */

import { useState, useEffect, useCallback } from 'react';
import { Bell, Check, X, Info, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatRelativeTime } from '../../utils';
import { websocketService } from '../../lib/websocket';
import type { Notification as NotificationType } from '../../types';

// Mock notifications data
const mockNotifications: NotificationType[] = [
  {
    id: '1',
    userId: 'u1',
    type: 'order',
    title: 'Đơn hàng đã được xác nhận',
    message: 'Đơn hàng #ORD-2024-001 của bạn đã được xác nhận và đang được xử lý.',
    icon: 'shopping-cart',
    read: false,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: '2',
    userId: 'u1',
    type: 'course',
    title: 'Khóa học mới phù hợp với bạn',
    message: 'Chúng tôi có khóa học "Advanced UX Design" mà bạn có thể quan tâm.',
    icon: 'book',
    link: '/course/advanced-ux',
    read: false,
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: '3',
    userId: 'u1',
    type: 'achievement',
    title: 'Chúc mừng! Bạn đạt level mới',
    message: 'Bạn vừa thăng hạng lên Silver. Nhận 500 điểm thưởng!',
    icon: 'trophy',
    read: true,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

export default function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationType[]>(mockNotifications);
  const [unreadCount, setUnreadCount] = useState(
    mockNotifications.filter(n => !n.read).length
  );

  // WebSocket subscription for real-time notifications
  useEffect(() => {
    const unsubscribe = websocketService.on('notification', (data) => {
      const notification = data as NotificationType;
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);

      // Show browser notification if permission granted
      if (Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/logo-192.png',
        });
      }
    });

    return () => unsubscribe();
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  }, []);

  const deleteNotification = useCallback((id: string) => {
    setNotifications(prev => {
      const notification = prev.find(n => n.id === id);
      if (notification && !notification.read) {
        setUnreadCount(count => Math.max(0, count - 1));
      }
      return prev.filter(n => n.id !== id);
    });
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  const getNotificationIcon = (type: NotificationType['type']) => {
    const iconMap = {
      order: <CheckCircle className="size-5 text-green-600" />,
      course: <Info className="size-5 text-blue-600" />,
      review: <Info className="size-5 text-purple-600" />,
      comment: <Info className="size-5 text-indigo-600" />,
      system: <AlertTriangle className="size-5 text-orange-600" />,
      promotion: <Info className="size-5 text-pink-600" />,
      achievement: <CheckCircle className="size-5 text-yellow-600" />,
    };
    return iconMap[type] || <Info className="size-5 text-gray-600" />;
  };

  return (
    <div className="relative">
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="size-6 text-gray-700" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 size-5 bg-red-600 text-white text-xs font-bold rounded-full flex items-center justify-center"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </button>

      {/* Notification Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden"
            >
              {/* Header */}
              <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold text-gray-900">Thông báo</h3>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 rounded-lg hover:bg-white/50 transition-colors"
                  >
                    <X className="size-5 text-gray-600" />
                  </button>
                </div>
                {unreadCount > 0 && (
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                      {unreadCount} thông báo chưa đọc
                    </p>
                    <button
                      onClick={markAllAsRead}
                      className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                    >
                      Đánh dấu tất cả đã đọc
                    </button>
                  </div>
                )}
              </div>

              {/* Notification List */}
              <div className="max-h-[28rem] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center">
                    <Bell className="size-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">Không có thông báo mới</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {notifications.map(notification => (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer group relative ${
                          !notification.read ? 'bg-indigo-50/50' : ''
                        }`}
                        onClick={() => {
                          markAsRead(notification.id);
                          if (notification.link) {
                            window.location.href = notification.link;
                          }
                        }}
                      >
                        <div className="flex gap-3">
                          {/* Icon */}
                          <div className="flex-shrink-0 mt-1">
                            {getNotificationIcon(notification.type)}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="text-sm font-semibold text-gray-900 leading-tight">
                                {notification.title}
                              </h4>
                              {!notification.read && (
                                <div className="size-2 bg-indigo-600 rounded-full flex-shrink-0 mt-1" />
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-500 mt-2">
                              {formatRelativeTime(notification.createdAt)}
                            </p>
                          </div>

                          {/* Actions */}
                          <div className="flex-shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {!notification.read && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markAsRead(notification.id);
                                }}
                                className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors"
                                title="Đánh dấu đã đọc"
                              >
                                <Check className="size-4 text-gray-600" />
                              </button>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(notification.id);
                              }}
                              className="p-1.5 rounded-lg hover:bg-red-100 transition-colors"
                              title="Xóa"
                            >
                              <XCircle className="size-4 text-red-600" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              {notifications.length > 0 && (
                <div className="p-3 border-t border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between gap-4">
                    <button
                      onClick={clearAll}
                      className="text-sm text-red-600 hover:text-red-700 font-medium"
                    >
                      Xóa tất cả
                    </button>
                    <button
                      onClick={() => setIsOpen(false)}
                      className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                    >
                      Xem tất cả thông báo →
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Toast Notification Component (lightweight alternative)
 */
export function showToastNotification(
  title: string,
  message: string,
  type: 'success' | 'error' | 'info' | 'warning' = 'info'
) {
  // Using sonner toast (already integrated in the app)
  const { toast } = await import('sonner');
  
  const toastFn = {
    success: toast.success,
    error: toast.error,
    info: toast.info,
    warning: toast.warning,
  }[type];

  toastFn(title, {
    description: message,
  });
}
