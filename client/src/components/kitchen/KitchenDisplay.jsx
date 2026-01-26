import React, { useEffect, useState } from 'react';
import Navbar from '../common/Navbar';
import OrderCard from './OrderCard';
import MenuManagement from '../staff/MenuManagement';
import Notification from '../common/Notification';
import { useSocket } from '../../context/SocketContext';
import { orderAPI } from '../../services/api';
import '../../styles/KitchenDisplay.css';

const KitchenDisplay = ({ user, onLogout }) => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState({ message: '', type: '' });
    const [filter, setFilter] = useState('current'); // current, completed
    const [activeTab, setActiveTab] = useState('orders'); // orders, menu
    const socketService = useSocket();
    const socket = socketService?.socket?.socket;

    // Fetch orders once on mount
    useEffect(() => {
        fetchOrders();
    }, []);

    // Setup Socket.io listeners for real-time updates
    useEffect(() => {
        if (!socket) return;

        console.log('🔌 Setting up socket listeners for Kitchen Display');

        const handleOrderCreated = (newOrder) => {
            console.log('🍳 New order in kitchen:', newOrder.orderId);
            setOrders(prev => {
                if (prev.find(o => o._id === newOrder._id)) {
                    return prev;
                }
                playNotificationSound();
                showNotification(`New order: ${newOrder.orderId}`, 'success');
                return [newOrder, ...prev];
            });
        };

        const handleOrderUpdated = (updatedOrder) => {
            console.log('🔄 Order updated in kitchen:', updatedOrder.orderId, updatedOrder.status);
            setOrders(prev => {
                const exists = prev.find(o => o._id === updatedOrder._id);
                if (exists) {
                    return prev.map(order => 
                        order._id === updatedOrder._id ? updatedOrder : order
                    );
                } else {
                    // Add if not exists
                    return [updatedOrder, ...prev];
                }
            });
        };

        const handleOrderDeleted = (data) => {
            const orderId = data.orderId || data._id;
            console.log('🗑️ Order deleted from kitchen:', orderId);
            setOrders(prev => prev.filter(order => order._id !== orderId));
        };

        socket.on('order:created', handleOrderCreated);
        socket.on('order:status-updated', handleOrderUpdated);
        socket.on('order:ready', handleOrderUpdated);
        socket.on('order:deleted', handleOrderDeleted);

        return () => {
            console.log('🔌 Cleaning up kitchen socket listeners');
            socket.off('order:created', handleOrderCreated);
            socket.off('order:status-updated', handleOrderUpdated);
            socket.off('order:ready', handleOrderUpdated);
            socket.off('order:deleted', handleOrderDeleted);
        };
    }, [socket]);

    const fetchOrders = async () => {
        try {
            const response = await orderAPI.getAll();
            setOrders(response.data.data || []);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching orders:', error);
            showNotification('Error loading orders', 'error');
            setLoading(false);
        }
    };

    const playNotificationSound = () => {
        // Optional: Add sound notification
        try {
            const audio = new Audio('/notification.mp3');
            audio.play().catch(() => {});
        } catch (error) {
            // Ignore audio errors
        }
    };

    const showNotification = (message, type) => {
        setNotification({ message, type });
    };

    const getFilteredOrders = () => {
        // Kitchen display: current = PENDING/STARTED/COMPLETED, completed = READY
        if (filter === 'current') {
            return orders.filter(order => ['PENDING', 'STARTED', 'COMPLETED'].includes(order.status));
        } else if (filter === 'completed') {
            return orders.filter(order => order.status === 'READY');
        }
        return orders;
    };

    const filteredOrders = getFilteredOrders();

    if (loading) {
        return (
            <div className="loading-screen">
                <div className="spinner"></div>
                <p>Loading kitchen display...</p>
            </div>
        );
    }

    return (
        <div className="kitchen-display">
            <Navbar user={user} onLogout={onLogout} />
            
            <Notification 
                message={notification.message} 
                type={notification.type}
                onClose={() => setNotification({ message: '', type: '' })}
            />

            <div className="kitchen-container">
                <header className="kitchen-header">
                    <h1>👨‍🍳 Kitchen Display</h1>
                    <div className="tab-buttons">
                        <button 
                            className={activeTab === 'orders' ? 'active' : ''}
                            onClick={() => setActiveTab('orders')}
                        >
                            📋 Orders
                        </button>
                        <button 
                            className={activeTab === 'menu' ? 'active' : ''}
                            onClick={() => setActiveTab('menu')}
                        >
                            🍽️ Menu
                        </button>
                    </div>
                </header>

                {activeTab === 'orders' && (
                    <div className="filter-section">
                        <div className="filter-buttons">
                            <button 
                                className={filter === 'current' ? 'active' : ''}
                                onClick={() => setFilter('current')}
                            >
                                Current Orders
                            </button>
                            <button 
                                className={filter === 'completed' ? 'active' : ''}
                                onClick={() => setFilter('completed')}
                            >
                                Completed Orders
                            </button>
                            <button onClick={fetchOrders} className="btn-refresh">
                                🔄 Refresh
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === 'orders' && (
                    filteredOrders.length === 0 ? (
                        <div className="no-orders">
                            <p>🍴 No {filter} orders</p>
                        </div>
                    ) : (
                        <div className="orders-grid">
                            {filteredOrders.map((order) => (
                                <OrderCard 
                                    key={order._id} 
                                    order={order}
                                    onUpdate={fetchOrders}
                                    showNotification={showNotification}
                                />
                            ))}
                        </div>
                    )
                )}

                {activeTab === 'menu' && (
                    <MenuManagement showNotification={showNotification} />
                )}
            </div>
        </div>
    );
};

export default KitchenDisplay;