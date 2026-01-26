import React, { useState, useEffect } from 'react';
import '../../styles/OrderHistory.css';

const OrderHistory = ({ showNotification }) => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [dailyStats, setDailyStats] = useState(null);

    useEffect(() => {
        fetchOrdersByDate(selectedDate);
    }, [selectedDate]);

    const fetchOrdersByDate = async (date) => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/orders/history?date=${date}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            
            if (data.success) {
                setOrders(data.data.orders || []);
                setDailyStats(data.data.stats || null);
            } else {
                showNotification(data.message || 'Error loading history', 'error');
            }
            setLoading(false);
        } catch (error) {
            console.error('Error fetching order history:', error);
            showNotification('Error loading order history', 'error');
            setLoading(false);
        }
    };

    const getStatusBadgeClass = (status) => {
        const statusClasses = {
            'PENDING': 'status-pending',
            'STARTED': 'status-started',
            'COMPLETED': 'status-completed',
            'READY': 'status-ready',
            'DELIVERED': 'status-delivered'
        };
        return statusClasses[status] || 'status-pending';
    };

    const getStatusIcon = (status) => {
        const icons = {
            'PENDING': '🕐',
            'STARTED': '👨‍🍳',
            'COMPLETED': '✅',
            'READY': '🍽️',
            'DELIVERED': '🎉'
        };
        return icons[status] || '📋';
    };

    if (loading) {
        return <div className="loading">Loading history...</div>;
    }

    return (
        <div className="order-history">
            <div className="history-header">
                <h2>📅 Order History</h2>
                <div className="date-selector">
                    <label>Select Date:</label>
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        max={new Date().toISOString().split('T')[0]}
                    />
                </div>
            </div>

            {/* Daily Stats */}
            {dailyStats && (
                <div className="daily-stats">
                    <div className="stat-box">
                        <h3>Total Orders</h3>
                        <p className="stat-value">{dailyStats.totalOrders}</p>
                    </div>
                    <div className="stat-box">
                        <h3>Total Revenue</h3>
                        <p className="stat-value revenue">${dailyStats.totalRevenue?.toFixed(2) || '0.00'}</p>
                    </div>
                    <div className="stat-box">
                        <h3>Average Order</h3>
                        <p className="stat-value">${dailyStats.averageOrder?.toFixed(2) || '0.00'}</p>
                    </div>
                    <div className="stat-box">
                        <h3>Completed</h3>
                        <p className="stat-value">{dailyStats.completedOrders}</p>
                    </div>
                </div>
            )}

            {/* Orders List */}
            <div className="history-orders">
                {orders.length === 0 ? (
                    <div className="no-orders">
                        <p>📭 No orders found for {new Date(selectedDate).toLocaleDateString()}</p>
                    </div>
                ) : (
                    <div className="orders-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Order ID</th>
                                    <th>Time</th>
                                    <th>Customer</th>
                                    <th>Items</th>
                                    <th>Total</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map((order) => (
                                    <tr key={order._id}>
                                        <td className="order-id-cell">
                                            <strong>{order.orderId}</strong>
                                        </td>
                                        <td className="time-cell">
                                            {new Date(order.createdAt).toLocaleTimeString('en-US', {
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </td>
                                        <td className="customer-cell">
                                            {order.customerName || 'Walk-in'}
                                            {order.tableNumber && <span className="table-badge">Table {order.tableNumber}</span>}
                                        </td>
                                        <td className="items-cell">
                                            <div className="items-list">
                                                {order.items.slice(0, 2).map((item, idx) => (
                                                    <div key={idx} className="item-row">
                                                        <span>{item.name}</span>
                                                        <span className="item-qty">x{item.quantity}</span>
                                                    </div>
                                                ))}
                                                {order.items.length > 2 && (
                                                    <div className="more-items">
                                                        +{order.items.length - 2} more
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="total-cell">
                                            <strong>${order.totalAmount?.toFixed(2)}</strong>
                                        </td>
                                        <td className="status-cell">
                                            <span className={`status-badge ${getStatusBadgeClass(order.status)}`}>
                                                {getStatusIcon(order.status)} {order.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrderHistory;
