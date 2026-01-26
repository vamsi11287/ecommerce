import React, { useEffect, useState } from 'react';
import { useSocket } from '../../context/SocketContext';
import { orderAPI } from '../../services/api';
import '../../styles/PublicStatusBoard.css';

const PublicStatusBoard = () => {
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
        if (!socket) return;

        console.log('🔌 Setting up socket listeners for Status Board');

        const handleOrderCreated = (newOrder) => {
            console.log('📱 New order received:', newOrder.orderId);
            setOrders(prev => {
                if (!prev.find(o => o._id === newOrder._id)) {
                    return [newOrder, ...prev];
                }
                return prev;
            });
        };

        const handleOrderUpdated = (updatedOrder) => {
            console.log('🔄 Order updated:', updatedOrder.orderId, updatedOrder.status);
            setOrders(prev => {
                const exists = prev.find(o => o._id === updatedOrder._id);
                if (exists) {
                    return prev.map(order => 
                        order._id === updatedOrder._id ? updatedOrder : order
                    );
                } else if (['PENDING', 'STARTED', 'COMPLETED', 'READY'].includes(updatedOrder.status)) {
                    return [updatedOrder, ...prev];
                }
                return prev;
            });
        };

        const handleOrderDeleted = (data) => {
            const orderId = data.orderId || data._id;
            console.log('🗑️ Order deleted:', orderId);
            setOrders(prev => prev.filter(order => order._id !== orderId));
        };

        socket.on('order:created', handleOrderCreated);
        socket.on('order:status-updated', handleOrderUpdated);
        socket.on('order:ready', handleOrderUpdated);
        socket.on('order:deleted', handleOrderDeleted);

        return () => {
            console.log('🔌 Cleaning up socket listeners');
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
            // Fetch orders without authentication for public display
            const response = await fetch('http://localhost:5000/api/orders/ready');
            const data = await response.json();
            const allOrders = data.data || [];
            
            // If no ready orders, try fetching all orders (for authenticated contexts)
            if (allOrders.length === 0) {
                try {
                    const token = localStorage.getItem('token');
                    if (token) {
                        const authResponse = await fetch('http://localhost:5000/api/orders', {
                            headers: {
                                'Authorization': `Bearer ${token}`
                            }
                        });
                        const authData = await authResponse.json();
                        const activeOrders = (authData.data || []).filter(order => 
                            ['PENDING', 'STARTED', 'COMPLETED', 'READY'].includes(order.status)
                        );
                        setOrders(activeOrders);
                        return;
                    }
                } catch (err) {
                    console.log('No auth available, showing ready orders only');
                }
            }
            
            setOrders(allOrders);
        } catch (error) {
            console.error('Error fetching orders:', error);
        }
    };

    const formatTime = (date) => {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    const getOrdersByStatus = (status) => {
        return orders.filter(order => order.status === status);
    };

    const pendingOrders = getOrdersByStatus('PENDING');
    const preparingOrders = [...getOrdersByStatus('STARTED'), ...getOrdersByStatus('COMPLETED')];
    const readyOrders = getOrdersByStatus('READY');

    return (
        <div className="public-status-board">
            <header className="board-header">
                <div className="header-content">
                    <h1>🍽️ Order Status Board</h1>
                    <div className="header-clock">{formatTime(currentTime)}</div>
                </div>
            </header>

            <div className="board-container">
                {/* Pending Orders */}
                <div className="status-column pending-column">
                    <div className="column-header">
                        <h2>⏳ Pending</h2>
                        <span className="count-badge">{pendingOrders.length}</span>
                    </div>
                    <div className="orders-list">
                        {pendingOrders.length === 0 ? (
                            <div className="empty-state">
                                <p>No pending orders</p>
                            </div>
                        ) : (
                            pendingOrders.map(order => (
                                <div key={order._id} className="order-item pending-item">
                                    <div className="order-id">{order.orderId}</div>
                                    <div className="customer-name">{order.customerName}</div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Preparing Orders */}
                <div className="status-column preparing-column">
                    <div className="column-header">
                        <h2>👨‍🍳 Preparing</h2>
                        <span className="count-badge">{preparingOrders.length}</span>
                    </div>
                    <div className="orders-list">
                        {preparingOrders.length === 0 ? (
                            <div className="empty-state">
                                <p>No orders in preparation</p>
                            </div>
                        ) : (
                            preparingOrders.map(order => (
                                <div key={order._id} className="order-item preparing-item">
                                    <div className="order-id">{order.orderId}</div>
                                    <div className="customer-name">{order.customerName}</div>
                                    <div className="order-status-badge">
                                        {order.status === 'STARTED' ? '🔥 Cooking' : '✅ Almost Done'}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Ready Orders */}
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
                            readyOrders.map(order => (
                                <div key={order._id} className="order-item ready-item">
                                    <div className="order-id-large">{order.orderId}</div>
                                    <div className="customer-name-large">{order.customerName}</div>
                                    <div className="ready-badge">READY!</div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            <footer className="board-footer">
                <p>✨ Orders are updated in real-time ✨</p>
            </footer>
        </div>
    );
};

export default PublicStatusBoard;
