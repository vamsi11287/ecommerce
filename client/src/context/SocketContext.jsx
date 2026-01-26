import React, { createContext, useContext, useEffect, useState } from 'react';
import socketService from '../services/socket';

const SocketContext = createContext(null);

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error('useSocket must be used within SocketProvider');
    }
    return context;
};

export const SocketProvider = ({ children }) => {
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        // Connect socket
        socketService.connect();

        // Listen for connection events
        const handleConnect = () => {
            setIsConnected(true);
        };

        const handleDisconnect = () => {
            setIsConnected(false);
        };

        socketService.on('connect', handleConnect);
        socketService.on('disconnect', handleDisconnect);

        // Check initial connection state
        if (socketService.socket?.connected) {
            setIsConnected(true);
        }

        // Cleanup on unmount
        return () => {
            socketService.off('connect', handleConnect);
            socketService.off('disconnect', handleDisconnect);
            socketService.disconnect();
        };
    }, []);

    const value = {
        socket: socketService,
        isConnected
    };

    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    );
};

export default SocketContext;