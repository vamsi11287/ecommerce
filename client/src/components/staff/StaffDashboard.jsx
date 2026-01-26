import React, { useState, useEffect } from 'react';
import Navbar from '../common/Navbar';
import OrderForm from './OrderForm';
import OrderList from './OrderList';
import OrderHistory from './OrderHistory';
import StaffManagement from './StaffManagement';
import MenuManagement from './MenuManagement';
import Notification from '../common/Notification';
import { useSocket } from '../../context/SocketContext';
import { orderAPI, menuAPI, settingsAPI } from '../../services/api';
import '../../styles/StaffDashboard.css';

const StaffDashboard = ({ user, onLogout }) => {
    const [orders, setOrders] = useState([]);
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState({ message: '', type: '' });
    const [customerOrderingEnabled, setCustomerOrderingEnabled] = useState(false);
    const [stats, setStats] = useState(null);
    const [activeTab, setActiveTab] = useState('create'); // create, orders, menu, settings
    const { socket } = useSocket();

    useEffect(() => {
        fetchInitialData();
        setupSocketListeners();

        return () => {
            cleanupSocketListeners();
        };
    }, []);

    const fetchInitialData = async () => {
        try {
            const [ordersRes, menuRes, settingsRes, statsRes] = await Promise.all([
                orderAPI.getAll(),
                menuAPI.getAll(),
                settingsAPI.isCustomerOrderingEnabled(),
                orderAPI.getStats()
            ]);

            setOrders(ordersRes.data.data || []);
            setMenuItems(menuRes.data.data || []);
            setCustomerOrderingEnabled(settingsRes.data.data?.enabled || false);
            setStats(statsRes.data.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching data:', error);
            showNotification('Error loading data', 'error');
            setLoading(false);
        }
    };

    const setupSocketListeners = () => {
        socket.onOrderCreated((newOrder) => {
            setOrders(prev => [newOrder, ...prev]);
            showNotification(`New order: ${newOrder.orderId}`, 'success');
            fetchStats();
        });

        socket.onOrderStatusUpdated((updatedOrder) => {
            setOrders(prev => prev.map(order => 
                order._id === updatedOrder._id ? updatedOrder : order
            ));
            fetchStats();
        });

        socket.onOrderDeleted(({ orderId }) => {
            setOrders(prev => prev.filter(order => order._id !== orderId));
            showNotification('Order deleted', 'info');
            fetchStats();
        });

        socket.onMenuItemCreated((newItem) => {
            setMenuItems(prev => [...prev, newItem]);
        });

        socket.onMenuItemUpdated((updatedItem) => {
            setMenuItems(prev => prev.map(item => 
                item._id === updatedItem._id ? updatedItem : item
            ));
        });

        socket.onMenuItemDeleted(({ itemId }) => {
            setMenuItems(prev => prev.filter(item => item._id !== itemId));
        });
    };

    const cleanupSocketListeners = () => {
        // Cleanup is handled in socket service
    };

    const fetchStats = async () => {
        try {
            const statsRes = await orderAPI.getStats();
            setStats(statsRes.data.data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const showNotification = (message, type) => {
        setNotification({ message, type });
    };

    const handleToggleCustomerOrdering = async () => {
        try {
            const newValue = !customerOrderingEnabled;
            await settingsAPI.toggleCustomerOrdering(newValue);
            setCustomerOrderingEnabled(newValue);
            showNotification(
                `Customer ordering ${newValue ? 'enabled' : 'disabled'}`,
                'success'
            );
        } catch (error) {
            showNotification('Error updating settings', 'error');
        }
    };

    const handleOrderCreated = (newOrder) => {
        // Order will be added via socket
        showNotification('Order created successfully', 'success');
        setActiveTab('orders');
    };

    if (loading) {
        return (
            <div className="loading-screen">
                <div className="spinner"></div>
                <p>Loading dashboard...</p>
            </div>
        );
    }

    return (
        <div className="staff-dashboard">
            <Navbar user={user} onLogout={onLogout} />
            
            <Notification 
                message={notification.message} 
                type={notification.type}
                onClose={() => setNotification({ message: '', type: '' })}
            />

            <div className="dashboard-container">
                <header className="dashboard-header">
                    <h1>📋 {user.role === 'owner' ? 'Owner' : 'Staff'} Dashboard</h1>
                </header>

                {/* Statistics */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <h3>Pending</h3>
                        <p className="stat-number">
                            {stats?.statusCount?.find(s => s._id === 'PENDING')?.count || 0}
                        </p>
                    </div>
                    <div className="stat-card">
                        <h3>In Progress</h3>
                        <p className="stat-number">
                            {(stats?.statusCount?.find(s => s._id === 'STARTED')?.count || 0) +
                             (stats?.statusCount?.find(s => s._id === 'COMPLETED')?.count || 0)}
                        </p>
                    </div>
                    <div className="stat-card">
                        <h3>Ready</h3>
                        <p className="stat-number">
                            {stats?.statusCount?.find(s => s._id === 'READY')?.count || 0}
                        </p>
                    </div>
                    {user.role === 'owner' && (
                        <div className="stat-card">
                            <h3>Today's Revenue</h3>
                            <p className="stat-number">
                                ${stats?.todayRevenue?.[0]?.total?.toFixed(2) || '0.00'}
                            </p>
                        </div>
                    )}
                </div>

                {/* Tabs */}
                <div className="tabs">
                    <button 
                        className={activeTab === 'create' ? 'active' : ''}
                        onClick={() => setActiveTab('create')}
                    >
                        ➕ Create Order
                    </button>
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
                    {user.role === 'owner' && (
                        <button 
                            className={activeTab === 'history' ? 'active' : ''}
                            onClick={() => setActiveTab('history')}
                        >
                            📅 History
                        </button>
                    )}
                    {user.role === 'owner' && (
                        <button 
                            className={activeTab === 'menu-owner' ? 'active' : ''}
                            onClick={() => setActiveTab('menu')}
                            style={{ display: 'none' }}
                        >
                            🍽️ Menu
                        </button>
                    )}
                    {user.role === 'owner' && (
                        <>
                            <button 
                                className={activeTab === 'staff' ? 'active' : ''}
                                onClick={() => setActiveTab('staff')}
                            >
                                👥 Staff
                            </button>
                            <button 
                                className={activeTab === 'settings' ? 'active' : ''}
                                onClick={() => setActiveTab('settings')}
                            >
                                ⚙️ Settings
                            </button>
                        </>
                    )}
                </div>

                {/* Tab Content */}
                    {activeTab === 'create' && (
                        <OrderForm 
                            menuItems={menuItems}
                            onOrderCreated={handleOrderCreated}
                            showNotification={showNotification}
                        />
                    )}

                    {activeTab === 'orders' && (
                        <OrderList 
                            orders={orders}
                            onRefresh={fetchInitialData}
                        />
                    )}

                    {activeTab === 'menu' && (
                        <MenuManagement showNotification={showNotification} />
                    )}

                    {activeTab === 'history' && user.role === 'owner' && (
                        <OrderHistory showNotification={showNotification} />
                    )}

                    {activeTab === 'staff' && user.role === 'owner' && (
                        <StaffManagement showNotification={showNotification} />
                    )}

                    {activeTab === 'settings' && user.role === 'owner' && (
                        <div className="settings-section">
                            <h2>⚙️ Settings</h2>
                            <div className="setting-item">
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={customerOrderingEnabled}
                                        onChange={handleToggleCustomerOrdering}
                                    />
                                    <span>Enable Customer Self-Ordering</span>
                                </label>
                                <p className="setting-description">
                                    When enabled, customers can place orders directly from their devices.
                                </p>
                            </div>

                            {customerOrderingEnabled && (
                                <div className="qr-section">
                                    <h3>Customer Portal Link</h3>
                                    <div className="link-box">
                                        <code>{window.location.origin}/customer</code>
                                        <button 
                                            onClick={() => {
                                                navigator.clipboard.writeText(`${window.location.origin}/customer`);
                                                showNotification('Link copied!', 'success');
                                            }}
                                        >
                                            📋 Copy
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        
    );
};

export default StaffDashboard;