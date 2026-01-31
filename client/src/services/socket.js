import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

class SocketService {
    constructor() {
        this.socket = null;
        this.listeners = new Map();
    }

    connect() {
        if (this.socket?.connected) {
            console.log('Socket already connected');
            return this.socket;
        }

        this.socket = io(SOCKET_URL, {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000
        });

        this.socket.on('connect', () => {
            console.log('✅ Socket connected:', this.socket.id);
        });

        this.socket.on('disconnect', (reason) => {
            console.log('❌ Socket disconnected:', reason);
        });

        this.socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
        });

        this.socket.on('reconnect', (attemptNumber) => {
            console.log('🔄 Socket reconnected after', attemptNumber, 'attempts');
        });

        return this.socket;
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.listeners.clear();
            console.log('Socket disconnected manually');
        }
    }

    on(event, callback) {
        if (!this.socket) {
            console.warn('Socket not connected. Call connect() first.');
            return;
        }

        this.socket.on(event, callback);
        
        // Store listener for cleanup
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }

    off(event, callback) {
        if (!this.socket) return;

        this.socket.off(event, callback);

        // Remove from listeners map
        if (this.listeners.has(event)) {
            const callbacks = this.listeners.get(event);
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }

    emit(event, data) {
        if (!this.socket?.connected) {
            console.warn('Socket not connected. Cannot emit event:', event);
            return;
        }

        this.socket.emit(event, data);
    }

    joinRoom(room) {
        this.emit('join:room', room);
    }

    leaveRoom(room) {
        this.emit('leave:room', room);
    }

    // Order event helpers
    onOrderCreated(callback) {
        this.on('order:created', callback);
    }

    onOrderStatusUpdated(callback) {
        this.on('order:status-updated', callback);
    }

    onOrderReady(callback) {
        this.on('order:ready', callback);
    }

    onOrderDeleted(callback) {
        this.on('order:deleted', callback);
    }

    onOrderTaken(callback) {
        this.on('order:taken', callback);
    }

    // Menu event helpers
    onMenuItemCreated(callback) {
        this.on('menu:item-created', callback);
    }

    onMenuItemUpdated(callback) {
        this.on('menu:item-updated', callback);
    }

    onMenuItemDeleted(callback) {
        this.on('menu:item-deleted', callback);
    }

    // Settings event helpers
    onSettingsUpdated(callback) {
        this.on('settings:updated', callback);
    }

    onCustomerOrderingToggled(callback) {
        this.on('settings:customer-ordering', callback);
    }
}

// Export singleton instance
const socketService = new SocketService();
export default socketService;