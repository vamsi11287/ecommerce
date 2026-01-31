import React from 'react';
import { orderAPI } from '../../services/api';
import '../../styles/OrderList.css';

const OrderList = ({ orders, onRefresh }) => {
    const getStatusBadge = (status) => {
        const badges = {
            'PENDING': { emoji: '⏳', class: 'pending', text: 'Pending' },
            'STARTED': { emoji: '👨‍🍳', class: 'started', text: 'Started' },
            'COMPLETED': { emoji: '✅', class: 'completed', text: 'Completed' },
            'READY': { emoji: '🔔', class: 'ready', text: 'Ready' }
        };
        const badge = badges[status] || badges['PENDING'];
        return <span className={`status-badge ${badge.class}`}>{badge.emoji} {badge.text}</span>;
    };

    const handleDelete = async (orderId) => {
        if (window.confirm('Are you sure you want to permanently delete this order? This cannot be undone.')) {
            try {
                const response = await orderAPI.delete(orderId);
                console.log('Delete response:', response);
                if (onRefresh) onRefresh();
                alert('Order deleted successfully');
            } catch (error) {
                console.error('Delete error:', error);
                const errorMsg = error.response?.data?.message || error.message || 'Error deleting order';
                alert('Error deleting order: ' + errorMsg);
            }
        }
    };

    const handleTaken = async (orderId, orderNumber) => {
        if (window.confirm(`Mark order ${orderNumber} as taken? It will be moved to reports.`)) {
            try {
                const response = await orderAPI.markAsTaken(orderId);
                console.log('Taken response:', response);
                if (onRefresh) onRefresh();
                alert('Order marked as taken and moved to reports');
            } catch (error) {
                console.error('Taken error:', error);
                const errorMsg = error.response?.data?.message || error.message || 'Error marking order as taken';
                alert('Error: ' + errorMsg);
            }
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString();
    };

    if (!orders || orders.length === 0) {
        return (
            <div className="order-list-empty">
                <p>📋 No orders yet</p>
            </div>
        );
    }

    return (
        <div className="order-list">
            <h2>📋 All Orders ({orders.length})</h2>
            <div className="orders-grid">
                {orders.map((order) => (
                    <div key={order._id} className="order-card">
                        <div className="order-header">
                            <h3>🎫 {order.orderId}</h3>
                            {getStatusBadge(order.status)}
                        </div>
                        <div className="order-body">
                            <p><strong>Customer:</strong> {order.customerName}</p>
                            <p><strong>Type:</strong> {order.orderType}</p>
                            <p><strong>Time:</strong> {formatDate(order.createdAt)}</p>
                            
                            <div className="order-items">
                                <strong>Items:</strong>
                                <ul>
                                    {order.items.map((item, idx) => (
                                        <li key={idx}>
                                            {item.name} × {item.quantity} - ${(item.price * item.quantity).toFixed(2)}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {order.notes && (
                                <p className="order-notes"><strong>Notes:</strong> {order.notes}</p>
                            )}

                            <p className="order-total"><strong>Total:</strong> ${order.totalAmount.toFixed(2)}</p>
                        </div>
                        <div className="order-actions">
                            <button 
                                onClick={() => handleTaken(order._id, order.orderId)}
                                className="btn-success btn-small"
                                title="Mark as taken and move to reports"
                            >
                                ✅ Taken
                            </button>
                            <button 
                                onClick={() => handleDelete(order._id)}
                                className="btn-danger btn-small"
                                title="Permanently delete this order"
                            >
                                🗑️ Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default OrderList;