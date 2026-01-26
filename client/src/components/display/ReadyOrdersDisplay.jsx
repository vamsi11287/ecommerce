import React, { useEffect, useState } from 'react';
import { useSocket } from '../../context/SocketContext';
import { orderAPI } from '../../services/api';
import '../../styles/ReadyOrdersDisplay.css';

const ReadyOrdersDisplay = () => {
    const [orders, setOrders] = useState([]);
    const [currentTime, setCurrentTime] = useState(new Date());
    const socketService = useSocket();
    const socket = socketService?.socket?.socket;

    // Fetch orders once on mount
    useEffect(() => {
        fetchOrders();
    }, []);

    // Setup Socket.io listeners for real-time updates
    useEffect(() => {
        if (!socket) {
            console.log('⚠️ Socket not available yet in Ready Board');
            return;
        }

        console.log('🔌 Setting up socket listeners for Ready Board');

        const handleOrderCreated = (newOrder) => {
            console.log('📱 New order received in Ready Board:', newOrder.orderId, newOrder);
            setOrders(prev => {
                if (!prev.find(o => o._id === newOrder._id)) {
                    playNotificationSound();
                    return [newOrder, ...prev];
                }
                return prev;
            });
        };

        const handleOrderUpdated = (updatedOrder) => {
            console.log('🔄 Order updated in Ready Board:', updatedOrder.orderId, updatedOrder.status, updatedOrder);
            setOrders(prev => {
                const exists = prev.find(o => o._id === updatedOrder._id);
                if (exists) {
                    return prev.map(order => 
                        order._id === updatedOrder._id ? updatedOrder : order
                    );
                } else if (['PENDING', 'STARTED', 'COMPLETED', 'READY'].includes(updatedOrder.status)) {
                    // Add if it's an active order status
                    console.log('➕ Adding new order to Ready Board:', updatedOrder.orderId);
                    return [updatedOrder, ...prev];
                }
                return prev;
            });
        };

        const handleOrderDeleted = (data) => {
            const orderId = data.orderId || data._id;
            console.log('🗑️ Order deleted from Ready Board:', orderId, data);
            setOrders(prev => prev.filter(order => order._id !== orderId));
        };

        console.log('📡 Registering socket events for Ready Board');
        socket.on('order:created', handleOrderCreated);
        socket.on('order:status-updated', handleOrderUpdated);
        socket.on('order:ready', handleOrderUpdated); // Also listen to ready event
        socket.on('order:deleted', handleOrderDeleted);

        return () => {
            console.log('🔌 Cleaning up socket listeners for Ready Board');
            socket.off('order:created', handleOrderCreated);
            socket.off('order:status-updated', handleOrderUpdated);
            socket.off('order:ready', handleOrderUpdated);
            socket.off('order:deleted', handleOrderDeleted);
        };
    }, [socket]);

    // Update clock every second
    useEffect(() => {
        const clockInterval = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(clockInterval);
    }, []);

    const fetchOrders = async () => {
        try {
            // Use the public ready orders endpoint
            const response = await fetch('http://localhost:5000/api/orders/ready');
            const data = await response.json();
            const allOrders = data.data || [];
            setOrders(allOrders);
        } catch (error) {
            console.error('Error fetching orders:', error);
        }
    };

    const playNotificationSound = () => {
        try {
            const audio = new Audio('/notification.mp3');
            audio.play().catch(() => {});
        } catch (error) {
            // Ignore audio errors
        }
    };

    const formatTime = (date) => {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    const getTimeAgo = (dateString) => {
        const seconds = Math.floor((new Date() - new Date(dateString)) / 1000);
        if (seconds < 60) return `${seconds}s ago`;
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        return `${hours}h ago`;
    };

    const getOrdersByStatus = (status) => {
        return orders.filter(order => order.status === status);
    };

    const pendingOrders = getOrdersByStatus('PENDING');
    const preparingOrders = [...getOrdersByStatus('STARTED'), ...getOrdersByStatus('COMPLETED')];
    const readyOrders = getOrdersByStatus('READY');

    return (
        <div className="ready-orders-display">
            <header className="display-header">
                <h1>🍽️ Order Status Board</h1>
                <div className="display-clock">{formatTime(currentTime)}</div>
            </header>

            <div className="board-container" style={{overflow:"auto",}}>
                {/* Orders in Queue */}
                <div className="status-column pending-column" >
                    <div className="column-header">
                        <h2>⏳ Orders in Queue</h2>
                        <span className="count-badge">{pendingOrders.length}</span>
                    </div>
                    <div className="orders-list">
                        {pendingOrders.length === 0 ? (
                            <div className="empty-state">
                                <p>No orders in queue</p>
                            </div>
                        ) : (
                            pendingOrders.map((order) => (
                                <div key={order._id} className="order-card pending-card" style={{height:"120px"}}>
                                    <div className="order-id">{order.orderId}</div>
                                    <div className="customer-name">{order.customerName}</div>
                                    <div className="order-time">{getTimeAgo(order.createdAt)}</div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Preparing */}
                <div className="status-column preparing-column" >
                    <div className="column-header">
                        <h2>👨‍🍳 Preparing</h2>
                        <span className="count-badge">{preparingOrders.length}</span>
                    </div>
                    <div className="orders-list">
                        {preparingOrders.length === 0 ? (
                            <div className="empty-state">
                                <p>No orders being prepared</p>
                            </div>
                        ) : (
                            preparingOrders.map((order) => (
                                <div key={order._id} className="order-card preparing-card" style={{height:"150px"}}>
                                    <div className="order-id">{order.orderId}</div>
                                    <div className="customer-name">{order.customerName}</div>
                                    <div className="order-status">
                                        {order.status === 'STARTED' ? '🔥 Cooking' : '✅ Almost Done'}
                                    </div>
                                    <div className="order-time">{getTimeAgo(order.createdAt)}</div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Ready for Pickup */}
                <div className="status-column ready-column">
                    <div className="column-header">
                        <h2>🎉 Ready for Pickup</h2>
                        <span className="count-badge">{readyOrders.length}</span>
                    </div>
                    <div className="orders-list">
                        {readyOrders.length === 0 ? (
                            <div className="empty-state">
                                <p>No orders ready</p>
                            </div>
                        ) : (
                            readyOrders.map((order) => (
                                <div key={order._id} className="order-card ready-card animate-in" style={{height:"150px"}}>
                                    <div className="order-id-large">{order.orderId}</div>
                                    <div className="customer-name-large">{order.customerName}</div>
                                    {/* <div className="ready-badge">READY!</div> */}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            <footer className="display-footer">
                <p>✨ Orders are updated in real-time • Please collect at the counter ✨</p>
            </footer>
        </div>
    );
};

export default ReadyOrdersDisplay;