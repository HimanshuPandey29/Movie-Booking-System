class NotificationApp {
    constructor() {
        this.panel = document.getElementById('notification-panel');
        this.bell = document.getElementById('notification-bell');
        this.closeButton = document.getElementById('notification-panel-close');
        this.list = document.getElementById('notification-list');
        this.emptyState = document.getElementById('notification-empty');
        this.count = document.getElementById('notification-count');
        this.toastContainer = document.getElementById('notification-container');
        this.pageItems = Array.from(document.querySelectorAll('[data-notification-id]'));
        this.notifications = this.pageItems.map((item) => this.parseNotification(item));
    }

    init() {
        if (!this.panel || !this.bell || !this.list) {
            return;
        }

        this.bindEvents();
        this.renderNotifications();
        this.updateNotificationCount();
    }

    bindEvents() {
        this.bell.addEventListener('click', (event) => {
            event.stopPropagation();
            this.toggleNotificationPanel();
        });

        if (this.closeButton) {
            this.closeButton.addEventListener('click', () => this.closePanel());
        }

        document.addEventListener('click', (event) => {
            if (!this.panel.contains(event.target) && !this.bell.contains(event.target)) {
                this.closePanel();
            }
        });
    }

    parseNotification(item) {
        return {
            id: Number(item.dataset.notificationId),
            title: 'Notification',
            message: item.dataset.notificationMessage || '',
            createdAt: item.dataset.notificationCreated || '',
            read: item.dataset.notificationRead === 'true',
            markReadUrl: item.dataset.notificationMarkReadUrl || '#',
        };
    }

    toggleNotificationPanel() {
        const isOpen = this.panel.classList.toggle('is-open');
        this.panel.setAttribute('aria-hidden', String(!isOpen));
        this.bell.setAttribute('aria-expanded', String(isOpen));
    }

    closePanel() {
        this.panel.classList.remove('is-open');
        this.panel.setAttribute('aria-hidden', 'true');
        this.bell.setAttribute('aria-expanded', 'false');
    }

    updateNotificationCount() {
        if (!this.count) {
            return;
        }

        const unreadCount = this.notifications.filter((notification) => !notification.read).length;
        this.count.textContent = String(unreadCount);
        this.count.classList.toggle('is-hidden', unreadCount === 0);
    }

    renderNotifications() {
        this.list.innerHTML = '';

        if (this.notifications.length === 0) {
            this.emptyState?.classList.remove('is-hidden');
            this.list.appendChild(this.emptyState);
            return;
        }

        this.emptyState?.classList.add('is-hidden');

        this.notifications.forEach((notification) => {
            this.list.appendChild(this.createNotificationItem(notification));
        });
    }

    createNotificationItem(notification) {
        const item = document.createElement('div');
        item.className = `notification-item ${notification.read ? 'read' : 'unread'}`;
        item.dataset.id = String(notification.id);

        const content = document.createElement('div');
        content.className = 'notification-content';

        const title = document.createElement('div');
        title.className = 'notification-title';
        title.textContent = notification.title;

        const message = document.createElement('div');
        message.className = 'notification-message';
        message.textContent = notification.message;

        const time = document.createElement('div');
        time.className = 'notification-time';
        time.textContent = this.formatTime(notification.createdAt);

        content.appendChild(title);
        content.appendChild(message);
        content.appendChild(time);
        item.appendChild(content);

        if (!notification.read) {
            const dot = document.createElement('div');
            dot.className = 'notification-unread-dot';
            item.appendChild(dot);
        }

        item.addEventListener('click', () => {
            this.showToast('Notification', notification.message, notification.read ? 'info' : 'success');
            if (!notification.read && notification.markReadUrl && notification.markReadUrl !== '#') {
                window.location.href = notification.markReadUrl;
            }
        });

        return item;
    }

    showToast(title, message, type = 'info') {
        if (!this.toastContainer) {
            return;
        }

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;

        const content = document.createElement('div');
        content.className = 'toast-content';

        const toastTitle = document.createElement('div');
        toastTitle.className = 'toast-title';
        toastTitle.textContent = title;

        const toastMessage = document.createElement('div');
        toastMessage.className = 'toast-message';
        toastMessage.textContent = message;

        const closeButton = document.createElement('button');
        closeButton.type = 'button';
        closeButton.className = 'btn-close';
        closeButton.setAttribute('aria-label', 'Close notification');
        closeButton.innerHTML = '&times;';

        content.appendChild(toastTitle);
        content.appendChild(toastMessage);
        toast.appendChild(content);
        toast.appendChild(closeButton);
        this.toastContainer.appendChild(toast);

        const removeToast = () => {
            toast.classList.add('is-closing');
            window.setTimeout(() => toast.remove(), 300);
        };

        closeButton.addEventListener('click', removeToast);
        window.setTimeout(removeToast, 5000);
    }

    formatTime(dateString) {
        if (!dateString) {
            return '';
        }

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
}

document.addEventListener('DOMContentLoaded', () => {
    const app = new NotificationApp();
    app.init();
    window.notificationApp = app;
});
