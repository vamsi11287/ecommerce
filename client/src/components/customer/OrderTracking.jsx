import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSocket } from '../../context/SocketContext';
import { orderAPI } from '../../services/api';
import '../../styles/CustomerPortal.css';

const OrderTracking = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const { socket } = useSocket();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchOrder();
    }, [orderId]);

    useEffect(() => {
        if (socket && order) {
            const handleStatusUpdate = (updatedOrder) => {
                if (updatedOrder._id === order._id) {
                    setOrder(updatedOrder);
                }
            };

            socket.on('order:status-updated', handleStatusUpdate);

            return () => {
                socket.off('order:status-updated', handleStatusUpdate);
            };
        }
    }, [socket, order]);

    const fetchOrder = async () => {
        try {
            const response = await orderAPI.getAll();
            const orders = response.data.data || [];
            const foundOrder = orders.find(o => o.orderId === orderId);
            
            if (foundOrder) {
                setOrder(foundOrder);
                // Save to localStorage
                localStorage.setItem('currentOrder', JSON.stringify(foundOrder));
            } else {
                setError('Order not found');
            }
            setLoading(false);
        } catch (err) {
            console.error('Error fetching order:', err);
            setError('Error loading order');
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="loading-screen">
                <div className="spinner"></div>
                <p>Loading order...</p>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="customer-portal-disabled">
                <div className="message-box">
                    <h1>⚠️ Order Not Found</h1>
                    <p>{error || 'We couldn\'t find this order'}</p>
                    <button 
                        className="btn-add-more"
                        onClick={() => navigate('/customer')}
                        style={{ marginTop: '20px' }}
                    >
                        ← Back to Menu
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="customer-portal">
            <div className="order-tracking-container">
                <div className="order-tracking-card">
                    <div className="order-tracking-header">
                        <h1>📦 Track Your Order</h1>
                        <button 
                            className="btn-close-tracking"
                            onClick={() => navigate('/customer')}
                        >
                            ✕
                        </button>
                    </div>

                    <div className="order-details">
                        <div className="order-id-section">
                            <span className="label">Order ID</span>
                            <span className="order-id-badge">{order.orderId}</span>
                        </div>

                        <div className="customer-info">
                            <p><strong>Customer:</strong> {order.customerName}</p>
                            <p><strong>Order Type:</strong> {order.orderType}</p>
                        </div>

                        <div className="order-status-section">
                            <h3>Order Status</h3>
                            <div className={`status-badge status-${(order.status || 'pending').toLowerCase()}`}>
                                {order.status === 'PENDING' && '⏳ Pending - Kitchen will start soon'}
                                {order.status === 'STARTED' && '👨‍🍳 Cooking - Your order is being prepared'}
                                {order.status === 'COMPLETED' && '✅ Completed - Almost ready!'}
                                {order.status === 'READY' && '🎉 Ready for Pickup!'}
                            </div>

                            <div className="status-timeline">
                                <div className={`timeline-step ${['PENDING', 'STARTED', 'COMPLETED', 'READY'].includes(order.status) ? 'active' : ''}`}>
                                    <div className="timeline-dot"></div>
                                    <span>Received</span>
                                </div>
                                <div className={`timeline-step ${['STARTED', 'COMPLETED', 'READY'].includes(order.status) ? 'active' : ''}`}>
                                    <div className="timeline-dot"></div>
                                    <span>Cooking</span>
                                </div>
                                <div className={`timeline-step ${['COMPLETED', 'READY'].includes(order.status) ? 'active' : ''}`}>
                                    <div className="timeline-dot"></div>
                                    <span>Completed</span>
                                </div>
                                <div className={`timeline-step ${order.status === 'READY' ? 'active' : ''}`}>
                                    <div className="timeline-dot"></div>
                                    <span>Ready!</span>
                                </div>
                            </div>

                            {order.status === 'READY' && (
                                <div className="ready-message">
                                    <h2>🎉 Your order is ready!</h2>
                                    <p>Please collect it from the counter</p>
                                </div>
                            )}
                        </div>

                        <div className="order-items-section">
                            <h3>Your Items</h3>
                            <div className="order-items-list">
                                {order.items && order.items.length > 0 ? (
                                    order.items.map((item, index) => (
                                        <div key={index} className="order-item-row">
                                            <span className="item-name">{item.name}</span>
                                            <span className="item-qty">x{item.quantity}</span>
                                            <span className="item-price">${(item.price * item.quantity).toFixed(2)}</span>
                                        </div>
                                    ))
                                ) : (
                                    <p>Loading items...</p>
                                )}
                            </div>
                            <div className="order-total">
                                <strong>Total:</strong>
                                <strong className="total-amount">${(order.totalAmount || 0).toFixed(2)}</strong>
                            </div>
                        </div>

                        <div className="order-actions">
                            <button 
                                className="btn-add-more"
                                onClick={() => navigate('/customer')}
                            >
                                ➕ Order More Items
                            </button>
                            <button 
                                className="btn-refresh"
                                onClick={fetchOrder}
                            >
                                🔄 Refresh Status
                            </button>
                        </div>

                        <div className="share-section">
                            <p className="share-label">Share this tracking link:</p>
                            <div className="share-link">
                                <input 
                                    type="text" 
                                    value={window.location.href} 
                                    readOnly 
                                    onClick={(e) => e.target.select()}
                                />
                                <button 
                                    onClick={() => {
                                        navigator.clipboard.writeText(window.location.href);
                                        alert('Link copied!');
                                    }}
                                >
                                    📋 Copy
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderTracking;
