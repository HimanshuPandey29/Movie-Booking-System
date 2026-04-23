// Notification App JavaScript
// Handles user notifications and alerts

class NotificationApp {
    constructor() {
        this.notifications = [];
        this.init();
    }

    init() {
        this.setupNotificationSystem();
        this.loadNotifications();
        this.setupNotificationUI();
    }

    setupNotificationSystem() {
        // Create notification container if it doesn't exist
        if (!document.getElementById('notification-container')) {
            const container = document.createElement('div');
            container.id = 'notification-container';
            container.className = 'notification-container';
            document.body.appendChild(container);
        }

        // Notification bell icon in navbar
        this.addNotificationBell();
    }

    addNotificationBell() {
        const navbar = document.querySelector('.navbar .container');
        if (!navbar) return;

        const bellIcon = document.createElement('div');
        bellIcon.className = 'notification-bell';
        bellIcon.innerHTML = '🔔 <span class="notification-count">0</span>';
        bellIcon.style.cursor = 'pointer';
        bellIcon.style.position = 'relative';
        bellIcon.style.marginLeft = '1rem';

        bellIcon.addEventListener('click', () => this.toggleNotificationPanel());

        navbar.appendChild(bellIcon);
        this.bellIcon = bellIcon;
    }

    toggleNotificationPanel() {
        let panel = document.getElementById('notification-panel');

        if (!panel) {
            panel = document.createElement('div');
            panel.id = 'notification-panel';
            panel.className = 'notification-panel';
            panel.innerHTML = `
                <div class="notification-header">
                    <h4>Notifications</h4>
                    <button class="btn-close">&times;</button>
                </div>
                <div class="notification-list">
                    <div class="notification-empty">No notifications</div>
                </div>
            `;

            document.body.appendChild(panel);

            // Close button
            panel.querySelector('.btn-close').addEventListener('click', () => {
                panel.style.display = 'none';
            });

            // Click outside to close
            document.addEventListener('click', (e) => {
                if (!panel.contains(e.target) && !this.bellIcon.contains(e.target)) {
                    panel.style.display = 'none';
                }
            });
        }

        panel.style.display = panel.style.display === 'block' ? 'none' : 'block';
        this.renderNotifications();
    }

    async loadNotifications() {
        try {
            const data = await window.movieBookingApp.ajax('/api/notifications/');
            this.notifications = data.notifications || [];
            this.updateNotificationCount();
        } catch (error) {
            console.warn('Failed to load notifications:', error);
        }
    }

    updateNotificationCount() {
        const count = this.notifications.filter(n => !n.read).length;
        const countElement = document.querySelector('.notification-count');

        if (countElement) {
            countElement.textContent = count;
            countElement.style.display = count > 0 ? 'inline' : 'none';
        }
    }

    renderNotifications() {
        const list = document.querySelector('.notification-list');
        if (!list) return;

        if (this.notifications.length === 0) {
            list.innerHTML = '<div class="notification-empty">No notifications</div>';
            return;
        }

        list.innerHTML = '';

        this.notifications.slice(0, 10).forEach(notification => {
            const item = document.createElement('div');
            item.className = `notification-item ${notification.read ? 'read' : 'unread'}`;
            item.dataset.id = notification.id;

            item.innerHTML = `
                <div class="notification-content">
                    <div class="notification-title">${notification.title}</div>
                    <div class="notification-message">${notification.message}</div>
                    <div class="notification-time">${this.formatTime(notification.created_at)}</div>
                </div>
                ${!notification.read ? '<div class="notification-unread-dot"></div>' : ''}
            `;

            item.addEventListener('click', () => this.markAsRead(notification.id));

            list.appendChild(item);
        });
    }

    markAsRead(notificationId) {
        const notification = this.notifications.find(n => n.id === notificationId);
        if (notification && !notification.read) {
            notification.read = true;
            this.updateNotificationCount();
            this.renderNotifications();

            // Send to server
            this.markNotificationRead(notificationId);
        }
    }

    async markNotificationRead(notificationId) {
        try {
            await window.movieBookingApp.ajax(`/api/notifications/${notificationId}/read/`, {
                method: 'POST'
            });
        } catch (error) {
            console.warn('Failed to mark notification as read:', error);
        }
    }

    // Add new notification
    addNotification(notification) {
        this.notifications.unshift({
            id: Date.now(),
            title: notification.title,
            message: notification.message,
            read: false,
            created_at: new Date().toISOString()
        });

        this.updateNotificationCount();

        // Show toast notification
        this.showToast(notification.title, notification.message, notification.type || 'info');
    }

    // Toast notification system
    showToast(title, message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <div class="toast-title">${title}</div>
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close">&times;</button>
        `;

        const container = document.getElementById('notification-container');
        container.appendChild(toast);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            this.removeToast(toast);
        }, 5000);

        // Close button
        toast.querySelector('.toast-close').addEventListener('click', () => {
            this.removeToast(toast);
        });
    }

    removeToast(toast) {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }

    // Setup notification UI
    setupNotificationUI() {
        // Add CSS for notifications
        const style = document.createElement('style');
        style.textContent = `
            .notification-container {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 1000;
                max-width: 400px;
            }

            .toast {
                background: white;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                margin-bottom: 10px;
                padding: 16px;
                display: flex;
                align-items: flex-start;
                animation: slideIn 0.3s ease;
                border-left: 4px solid #ff4d4d;
            }

            .toast-info { border-left-color: #17a2b8; }
            .toast-success { border-left-color: #28a745; }
            .toast-warning { border-left-color: #ffc107; }
            .toast-error { border-left-color: #dc3545; }

            .toast-content {
                flex: 1;
            }

            .toast-title {
                font-weight: bold;
                margin-bottom: 4px;
            }

            .toast-close {
                background: none;
                border: none;
                font-size: 20px;
                cursor: pointer;
                margin-left: 10px;
            }

            .notification-bell {
                position: relative;
            }

            .notification-count {
                position: absolute;
                top: -8px;
                right: -8px;
                background: #ff4d4d;
                color: white;
                border-radius: 50%;
                padding: 2px 6px;
                font-size: 12px;
                min-width: 18px;
                text-align: center;
            }

            .notification-panel {
                position: absolute;
                top: 50px;
                right: 0;
                width: 350px;
                background: white;
                border-radius: 8px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.15);
                display: none;
                max-height: 400px;
                overflow: hidden;
            }

            .notification-header {
                padding: 16px;
                border-bottom: 1px solid #eee;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .notification-list {
                max-height: 350px;
                overflow-y: auto;
            }

            .notification-item {
                padding: 12px 16px;
                border-bottom: 1px solid #f5f5f5;
                cursor: pointer;
                transition: background-color 0.2s;
            }

            .notification-item:hover {
                background-color: #f8f9fa;
            }

            .notification-item.unread {
                background-color: #fff3cd;
            }

            .notification-title {
                font-weight: 500;
                margin-bottom: 4px;
            }

            .notification-message {
                color: #666;
                font-size: 14px;
                margin-bottom: 4px;
            }

            .notification-time {
                color: #999;
                font-size: 12px;
            }

            .notification-unread-dot {
                width: 8px;
                height: 8px;
                background: #ff4d4d;
                border-radius: 50%;
                position: absolute;
                right: 16px;
                top: 16px;
            }

            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }

            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }

    // Utility functions
    formatTime(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;

        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;

        return date.toLocaleDateString();
    }

    // Real-time notifications (WebSocket simulation)
    setupRealTimeNotifications() {
        // In a real app, this would connect to WebSocket
        // For now, simulate with polling
        setInterval(() => {
            this.loadNotifications();
        }, 30000); // Check every 30 seconds
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.notificationApp = new NotificationApp();
});