import React, { useEffect } from 'react';
import '../../styles/Notification.css';

const Notification = ({ message, type = 'info', duration = 3000, onClose }) => {
    useEffect(() => {
        if (message && duration && onClose) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [message, duration, onClose]);

    if (!message) return null;

    const getIcon = () => {
        switch (type) {
            case 'success':
                return '✅';
            case 'error':
                return '❌';
            case 'warning':
                return '⚠️';
            default:
                return 'ℹ️';
        }
    };

    return (
        <div className={`notification notification-${type}`}>
            <span className="notification-icon">{getIcon()}</span>
            <span className="notification-message">{message}</span>
            {onClose && (
                <button className="notification-close" onClick={onClose}>
                    ×
                </button>
            )}
        </div>
    );
};

export default Notification;