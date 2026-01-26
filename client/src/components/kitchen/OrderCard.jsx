import React, { useState } from 'react';
import { orderAPI } from '../../services/api';
import '../../styles/OrderCard.css';
import '../../styles/OrderModal.css';

const OrderCard = ({ order, onUpdate, showNotification }) => {
    const [updating, setUpdating] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [checkedItems, setCheckedItems] = useState({});
    const [selectedStatus, setSelectedStatus] = useState(order.status);

    const getNextStatus = (currentStatus) => {
        const statusFlow = {
            'PENDING': 'STARTED',
            'STARTED': 'COMPLETED',
            'COMPLETED': 'READY'
        };
        return statusFlow[currentStatus];
    };

    const getStatusLabel = (status) => {
        const labels = {
            'PENDING': { emoji: '⏳', text: 'Pending', color: '#ff9800' },
            'STARTED': { emoji: '👨‍🍳', text: 'In Progress', color: '#2196f3' },
            'COMPLETED': { emoji: '✅', text: 'Completed', color: '#4caf50' },
            'READY': { emoji: '🔔', text: 'Ready', color: '#8bc34a' }
        };
        return labels[status] || labels['PENDING'];
    };

    const handleStatusUpdate = async () => {
        const nextStatus = getNextStatus(order.status);
        if (!nextStatus) return;

        setUpdating(true);
        try {
            await orderAPI.updateStatus(order._id, nextStatus);
            if (onUpdate) onUpdate();
            if (showNotification) {
                showNotification(`Order ${order.orderId} marked as ${nextStatus}`, 'success');
            }
        } catch (error) {
            if (showNotification) {
                showNotification('Error updating order status', 'error');
            }
        } finally {
            setUpdating(false);
        }
    };

    const handleRevertToActive = async () => {
        setUpdating(true);
        try {
            await orderAPI.updateStatus(order._id, 'PENDING');
            if (onUpdate) onUpdate();
            if (showNotification) {
                showNotification(`Order ${order.orderId} reverted to active`, 'success');
            }
            setShowModal(false);
        } catch (error) {
            if (showNotification) {
                showNotification('Error reverting order', 'error');
            }
        } finally {
            setUpdating(false);
        }
    };

    const handleModalStatusChange = async () => {
        if (selectedStatus === order.status) return;
        
        setUpdating(true);
        try {
            await orderAPI.updateStatus(order._id, selectedStatus);
            if (onUpdate) onUpdate();
            if (showNotification) {
                showNotification(`Order ${order.orderId} status updated to ${selectedStatus}`, 'success');
            }
        } catch (error) {
            if (showNotification) {
                showNotification('Error updating order status', 'error');
            }
        } finally {
            setUpdating(false);
        }
    };

    const toggleItemCheck = (index) => {
        setCheckedItems(prev => ({
            ...prev,
            [index]: !prev[index]
        }));
    };

    const statusLabel = getStatusLabel(order.status);
    const nextStatus = getNextStatus(order.status);
    const nextStatusLabel = getStatusLabel(nextStatus);

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    };

    const getTimeElapsed = () => {
        const seconds = Math.floor((new Date() - new Date(order.createdAt)) / 1000);
        if (seconds < 60) return `${seconds}s`;
        const minutes = Math.floor(seconds / 60);
        return `${minutes}m`;
    };

    return (
        <>
            <div className={`order-card status-${order.status.toLowerCase()}`}>
                <div className="order-card-header">
                    <div className="header-left">
                        <h3   onClick={() => setShowModal(true)} style={{cursor:"pointer"}}>🎫 {order.orderId}</h3>
                        {/* <button 
                            className="btn-view-details"
                            onClick={() => setShowModal(true)}
                            title="View full order details"
                        >
                            ℹ️
                        </button> */}
                    </div>
                    <span 
                        className="status-badge"
                        style={{ backgroundColor: statusLabel.color }}
                    >
                        {statusLabel.emoji} {statusLabel.text}
                    </span>
                </div>

            <div className="order-card-body">
                <div className="order-info">
                    <p><strong>👤 Customer:</strong> {order.customerName}</p>
                    <p><strong>⏰ Time:</strong> {formatTime(order.createdAt)} ({getTimeElapsed()} ago)</p>
                    <p><strong>💰 Total:</strong> ${order.totalAmount.toFixed(2)}</p>
                </div>

                <div className="order-items">
                    <strong>🍽️ Items:</strong>
                    <ul>
                        {order.items.map((item, idx) => (
                            <li key={idx}>
                                <span className="item-name">{item.name}</span>
                                <span className="item-quantity">x{item.quantity}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {order.notes && (
                    <div className="order-notes">
                        <strong>📝 Notes:</strong>
                        <p>{order.notes}</p>
                    </div>
                )}
            </div>

            {nextStatus && (
                <div className="order-card-footer">
                    <button 
                        onClick={handleStatusUpdate}
                        disabled={updating}
                        className="btn-update-status"
                        style={{ backgroundColor: nextStatusLabel.color }}
                    >
                        {updating ? 'Updating...' : `${nextStatusLabel.emoji} Mark as ${nextStatusLabel.text}`}
                    </button>
                </div>
            )}
        </div>

        {showModal && (
            <div className="order-modal-overlay" onClick={() => setShowModal(false)}>
                <div className="order-modal-content" onClick={(e) => e.stopPropagation()}>
                    <div className="modal-header">
                        <h2>📋 Order Details</h2>
                        <button className="btn-close-modal" onClick={() => setShowModal(false)}>✕</button>
                    </div>
                    
                    <div className="modal-body">
                        <div className="modal-section">
                            <h3>🎫 Order ID</h3>
                            <p className="order-id-large">{order.orderId}</p>
                        </div>

                        <div className="modal-section">
                            <h3>📊 Status</h3>
                            <div className="status-selector">
                                <select 
                                    value={selectedStatus} 
                                    onChange={(e) => setSelectedStatus(e.target.value)}
                                    className="status-dropdown"
                                >
                                    <option value="PENDING">⏳ Pending</option>
                                    <option value="STARTED">👨‍🍳 Preparing</option>
                                    <option value="COMPLETED">✅ Completed</option>
                                    <option value="READY">🔔 Ready</option>
                                </select>
                                {selectedStatus !== order.status && (
                                    <button 
                                        className="btn-apply-status"
                                        onClick={handleModalStatusChange}
                                        disabled={updating}
                                    >
                                        {updating ? 'Updating...' : 'Apply'}
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="modal-section">
                            <h3>👤 Customer Information</h3>
                            <p><strong>Name:</strong> {order.customerName}</p>
                            <p><strong>Phone:</strong> {order.customerPhone || 'N/A'}</p>
                        </div>

                        <div className="modal-section">
                            <h3>⏰ Time Information</h3>
                            <p><strong>Order Placed:</strong> {new Date(order.createdAt).toLocaleString()}</p>
                            <p><strong>Time Elapsed:</strong> {getTimeElapsed()}</p>
                        </div>

                        <div className="modal-section">
                            <h3>🍽️ Order Items</h3>
                            <table className="items-table">
                                <thead>
                                    <tr>
                                        <th style={{width: '40px'}}>✓</th>
                                        <th>Item</th>
                                        <th>Quantity</th>
                                        <th>Price</th>
                                        <th>Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {order.items.map((item, idx) => (
                                        <tr key={idx} className={checkedItems[idx] ? 'item-checked' : ''}>
                                            <td>
                                                <input 
                                                    type="checkbox" 
                                                    checked={checkedItems[idx] || false}
                                                    onChange={() => toggleItemCheck(idx)}
                                                    className="item-checkbox"
                                                />
                                            </td>
                                            <td style={{textDecoration: checkedItems[idx] ? 'line-through' : 'none'}}>
                                                {item.name}
                                            </td>
                                            <td className="text-center">×{item.quantity}</td>
                                            <td className="text-right">${item.price.toFixed(2)}</td>
                                            <td className="text-right">${(item.price * item.quantity).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <td colSpan="4" className="text-right"><strong>Total Amount:</strong></td>
                                        <td className="text-right"><strong>${order.totalAmount.toFixed(2)}</strong></td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>

                        {order.notes && (
                            <div className="modal-section">
                                <h3>📝 Special Notes</h3>
                                <p className="notes-content">{order.notes}</p>
                            </div>
                        )}

                        <div className="modal-section">
                            <h3>🔖 Order Type</h3>
                            <p>{order.orderType || 'Dine-in'}</p>
                        </div>
                    </div>

                    <div className="modal-footer">
                        {order.status === 'READY' && (
                            <button 
                                onClick={handleRevertToActive}
                                disabled={updating}
                                className="btn-revert-order"
                            >
                                {updating ? 'Reverting...' : '↩️ Revert to Active'}
                            </button>
                        )}
                        {nextStatus && (
                            <button 
                                onClick={handleStatusUpdate}
                                disabled={updating}
                                className="btn-update-status-modal"
                                style={{ backgroundColor: nextStatusLabel.color }}
                            >
                                {updating ? 'Updating...' : `${nextStatusLabel.emoji} Mark as ${nextStatusLabel.text}`}
                            </button>
                        )}
                        <button className="btn-close" onClick={() => setShowModal(false)}>Close</button>
                    </div>
                </div>
            </div>
        )}
    </>
    );
};

export default OrderCard;