// Notification Manager
class NotificationManager {
    static notifications = [];
    static isInitialized = false;
    static container = null;

    static async init() {
        console.log('Initializing Notification Manager...');
        
        if (this.isInitialized) return true;
        
        // Create notification container if it doesn't exist
        this.createContainer();
        
        // Load saved notifications
        await this.loadNotifications();
        
        this.isInitialized = true;
        console.log('Notification Manager initialized');
        return true;
    }

    static createContainer() {
        let container = document.getElementById('notification-container');
        
        if (!container) {
            container = document.createElement('div');
            container.id = 'notification-container';
            container.className = 'notification-container';
            document.body.appendChild(container);
        }
        
        this.container = container;
    }

    static async loadNotifications() {
        try {
            const saved = localStorage.getItem('notifications');
            if (saved) {
                this.notifications = JSON.parse(saved);
            }
        } catch (error) {
            console.warn('Could not load notifications:', error);
        }
    }

    static async saveNotifications() {
        try {
            // Keep only last 100 notifications
            if (this.notifications.length > 100) {
                this.notifications = this.notifications.slice(-100);
            }
            
            localStorage.setItem('notifications', JSON.stringify(this.notifications));
        } catch (error) {
            console.error('Could not save notifications:', error);
        }
    }

    static show(options) {
        const notification = {
            id: 'notification-' + Date.now(),
            type: options.type || 'info',
            title: options.title || 'Notification',
            message: options.message || '',
            duration: options.duration || 5000,
            timestamp: new Date().toISOString(),
            read: false
        };

        // Add to array
        this.notifications.unshift(notification);
        
        // Save to storage
        this.saveNotifications();
        
        // Create and show notification element
        this.createNotificationElement(notification);
        
        // Dispatch event
        const event = new CustomEvent('notification-show', {
            detail: notification
        });
        document.dispatchEvent(event);
        
        return notification.id;
    }

    static createNotificationElement(notification) {
        if (!this.container) return;
        
        const notificationElement = document.createElement('div');
        notificationElement.className = `notification notification-${notification.type}`;
        notificationElement.id = notification.id;
        
        const typeIcons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        
        const icon = typeIcons[notification.type] || 'info-circle';
        
        notificationElement.innerHTML = `
            <div class="notification-header">
                <div class="notification-title">
                    <i class="fas fa-${icon}"></i>
                    <h4>${notification.title}</h4>
                </div>
                <button class="notification-close" onclick="NotificationManager.dismiss('${notification.id}')">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="notification-body">
                <p>${notification.message}</p>
            </div>
            <div class="notification-progress"></div>
        `;
        
        this.container.appendChild(notificationElement);
        
        // Add animation class
        setTimeout(() => {
            notificationElement.classList.add('show');
        }, 10);
        
        // Start progress bar
        this.startProgressBar(notificationElement, notification.duration);
        
        // Auto-dismiss
        if (notification.duration > 0) {
            setTimeout(() => {
                this.dismiss(notification.id);
            }, notification.duration);
        }
    }

    static startProgressBar(notificationElement, duration) {
        const progressBar = notificationElement.querySelector('.notification-progress');
        if (progressBar) {
            progressBar.style.transition = `width ${duration}ms linear`;
            setTimeout(() => {
                progressBar.style.width = '0%';
            }, 10);
        }
    }

    static dismiss(notificationId) {
        const notificationElement = document.getElementById(notificationId);
        if (notificationElement) {
            notificationElement.classList.remove('show');
            notificationElement.classList.add('hiding');
            
            setTimeout(() => {
                if (notificationElement.parentNode) {
                    notificationElement.parentNode.removeChild(notificationElement);
                }
            }, 300);
        }
        
        // Update notification status
        const notification = this.notifications.find(n => n.id === notificationId);
        if (notification) {
            notification.read = true;
            this.saveNotifications();
        }
    }

    static dismissAll() {
        const notifications = this.container.querySelectorAll('.notification');
        notifications.forEach(notification => {
            this.dismiss(notification.id);
        });
    }

    static showAlert(alert) {
        return this.show({
            type: 'warning',
            title: 'New Alert Detected',
            message: `${alert.type} at ${alert.location}`,
            duration: 7000
        });
    }

    static showSuccess(message, title = 'Success') {
        return this.show({
            type: 'success',
            title: title,
            message: message,
            duration: 4000
        });
    }

    static showError(message, title = 'Error') {
        return this.show({
            type: 'error',
            title: title,
            message: message,
            duration: 6000
        });
    }

    static showWarning(message, title = 'Warning') {
        return this.show({
            type: 'warning',
            title: title,
            message: message,
            duration: 5000
        });
    }

    static showInfo(message, title = 'Information') {
        return this.show({
            type: 'info',
            title: title,
            message: message,
            duration: 4000
        });
    }

    static getUnreadCount() {
        return this.notifications.filter(n => !n.read).length;
    }

    static markAllAsRead() {
        this.notifications.forEach(notification => {
            notification.read = true;
        });
        this.saveNotifications();
    }

    static clearAll() {
        this.notifications = [];
        this.saveNotifications();
        
        if (this.container) {
            this.container.innerHTML = '';
        }
    }
}

// Make available globally
if (typeof window !== 'undefined') {
    window.NotificationManager = NotificationManager;
}