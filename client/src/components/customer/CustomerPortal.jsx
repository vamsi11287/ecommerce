import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MenuList from './MenuList';
import Cart from './Cart';
import Notification from '../common/Notification';
import { menuAPI, orderAPI, settingsAPI } from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import '../../styles/CustomerPortal.css';

const CustomerPortal = () => {
    const navigate = useNavigate();
    const { socket } = useSocket();
    const [menuItems, setMenuItems] = useState([]);
    const [cart, setCart] = useState([]);
    const [customerName, setCustomerName] = useState('');
    const [loading, setLoading] = useState(true);
    const [orderingEnabled, setOrderingEnabled] = useState(false);
    const [notification, setNotification] = useState({ message: '', type: '' });
    const [showCart, setShowCart] = useState(false);
    const [currentOrder, setCurrentOrder] = useState(null);
    const [showOrderTracking, setShowOrderTracking] = useState(false);

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        if (socket && currentOrder) {
            const handleStatusUpdate = (updatedOrder) => {
                if (updatedOrder._id === currentOrder._id) {
                    setCurrentOrder(updatedOrder);
                    if (updatedOrder.status === 'READY') {
                        showNotification('🎉 Your order is ready for pickup!', 'success');
                    }
                }
            };

            socket.on('order:status-updated', handleStatusUpdate);

            return () => {
                socket.off('order:status-updated', handleStatusUpdate);
            };
        }
    }, [socket, currentOrder]);

    const fetchInitialData = async () => {
        try {
            const [menuRes, settingsRes] = await Promise.all([
                menuAPI.getAll({ isAvailable: true }),
                settingsAPI.isCustomerOrderingEnabled()
            ]);

            setMenuItems(menuRes.data.data || []);
            setOrderingEnabled(settingsRes.data.data?.enabled || false);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching data:', error);
            showNotification('Error loading menu', 'error');
            setLoading(false);
        }
    };

    const showNotification = (message, type) => {
        setNotification({ message, type });
    };

    const handleAddToCart = (menuItem) => {
        const existing = cart.find(item => item._id === menuItem._id);
        
        if (existing) {
            setCart(cart.map(item =>
                item._id === menuItem._id
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            ));
        } else {
            setCart([...cart, { ...menuItem, quantity: 1 }]);
        }
        showNotification(`${menuItem.name} added to cart`, 'success');
    };

    const handleRemoveFromCart = (menuItemId) => {
        setCart(cart.filter(item => item._id !== menuItemId));
    };

    const handleQuantityChange = (menuItemId, newQuantity) => {
        if (newQuantity < 1) {
            handleRemoveFromCart(menuItemId);
            return;
        }

        setCart(cart.map(item =>
            item._id === menuItemId
                ? { ...item, quantity: newQuantity }
                : item
        ));
    };

    const handlePlaceOrder = async () => {
        if (!customerName.trim()) {
            showNotification('Please enter your name', 'warning');
            return;
        }

        if (cart.length === 0) {
            showNotification('Your cart is empty', 'warning');
            return;
        }

        try {
            const orderData = {
                customerName: customerName.trim(),
                items: cart.map(item => ({
                    menuItemId: item._id,
                    quantity: item.quantity
                })),
                orderType: 'CUSTOMER'
            };

            const response = await orderAPI.create(orderData);
            console.log('Order response:', response.data);
            
            // Set current order for tracking
            if (response.data && response.data.data) {
                const placedOrder = response.data.data;
                
                // Save to localStorage
                localStorage.setItem('currentOrder', JSON.stringify(placedOrder));
                localStorage.setItem('lastOrderId', placedOrder.orderId);
                
                // Reset form
                setCart([]);
                setShowCart(false);
                setCustomerName('');
                
                showNotification('🎉 Order placed successfully!', 'success');
                
                // Redirect to tracking page
                setTimeout(() => {
                    navigate(`/customer/order/${placedOrder.orderId}`);
                }, 1000);
            } else {
                throw new Error('Invalid response format');
            }
        } catch (error) {
            console.error('Order placement error:', error);
            showNotification(
                error.response?.data?.message || 'Error placing order',
                'error'
            );
        }
    };

    if (loading) {
        return (
            <div className="loading-screen">
                <div className="spinner"></div>
                <p>Loading menu...</p>
            </div>
        );
    }

    if (!orderingEnabled) {
        return (
            <div className="customer-portal-disabled">
                <div className="message-box">
                    <h1>🍽️ Restaurant Order System</h1>
                    <p>🚫 Customer ordering is currently disabled</p>
                    <p>Please contact staff to place your order.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="customer-portal">
            <Notification 
                message={notification.message} 
                type={notification.type}
                onClose={() => setNotification({ message: '', type: '' })}
            />

            {showOrderTracking && currentOrder ? (
                // Order Tracking View
                <div className="order-tracking-container">
                    <div className="order-tracking-card">
                        <div className="order-tracking-header">
                            <h1>🎉 Order Placed Successfully!</h1>
                            <button 
                                className="btn-close-tracking"
                                onClick={() => {
                                    setShowOrderTracking(false);
                                    setCurrentOrder(null);
                                    setCustomerName('');
                                }}
                            >
                                ✕
                            </button>
                        </div>

                        <div className="order-details">
                            <div className="order-id-section">
                                <span className="label">Order ID</span>
                                <span className="order-id-badge">{currentOrder.orderId || 'Generating...'}</span>
                            </div>

                            <div className="customer-info">
                                <p><strong>Customer:</strong> {currentOrder.customerName}</p>
                            </div>

                            <div className="order-status-section">
                                <h3>Order Status</h3>
                                <div className={`status-badge status-${(currentOrder.status || 'pending').toLowerCase()}`}>
                                    {currentOrder.status === 'PENDING' && '⏳ Pending'}
                                    {currentOrder.status === 'STARTED' && '👨‍🍳 Cooking'}
                                    {currentOrder.status === 'COMPLETED' && '✅ Completed'}
                                    {currentOrder.status === 'READY' && '🎉 Ready for Pickup!'}
                                    {!currentOrder.status && '⏳ Pending'}
                                </div>

                                <div className="status-timeline">
                                    <div className={`timeline-step ${['PENDING', 'STARTED', 'COMPLETED', 'READY'].includes(currentOrder.status) ? 'active' : ''}`}>
                                        <div className="timeline-dot"></div>
                                        <span>Received</span>
                                    </div>
                                    <div className={`timeline-step ${['STARTED', 'COMPLETED', 'READY'].includes(currentOrder.status) ? 'active' : ''}`}>
                                        <div className="timeline-dot"></div>
                                        <span>Cooking</span>
                                    </div>
                                    <div className={`timeline-step ${['COMPLETED', 'READY'].includes(currentOrder.status) ? 'active' : ''}`}>
                                        <div className="timeline-dot"></div>
                                        <span>Completed</span>
                                    </div>
                                    <div className={`timeline-step ${currentOrder.status === 'READY' ? 'active' : ''}`}>
                                        <div className="timeline-dot"></div>
                                        <span>Ready!</span>
                                    </div>
                                </div>
                            </div>

                            <div className="order-items-section">
                                <h3>Your Items</h3>
                                <div className="order-items-list">
                                    {currentOrder.items && currentOrder.items.length > 0 ? (
                                        currentOrder.items.map((item, index) => (
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
                                    <strong className="total-amount">${(currentOrder.totalAmount || 0).toFixed(2)}</strong>
                                </div>
                            </div>

                            <div className="order-actions">
                                <button 
                                    className="btn-add-more"
                                    onClick={() => {
                                        setShowOrderTracking(false);
                                        // Keep currentOrder to continue tracking
                                    }}
                                >
                                    ➕ Add More Items
                                </button>
                                {currentOrder.status === 'READY' && (
                                    <button 
                                        className="btn-new-order"
                                        onClick={() => {
                                            setShowOrderTracking(false);
                                            setCurrentOrder(null);
                                            setCustomerName('');
                                        }}
                                    >
                                        🆕 New Order
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                // Menu and Cart View
                <>
                    <header className="customer-header">
                        <h1>🍽️ Order Menu</h1>
                        <div className="header-actions">
                            {localStorage.getItem('lastOrderId') && (
                                <button 
                                    className="btn-view-order"
                                    onClick={() => navigate(`/customer/order/${localStorage.getItem('lastOrderId')}`)}
                                >
                                    📋 Track Order
                                </button>
                            )}
                            <button 
                                className="cart-button"
                                onClick={() => setShowCart(!showCart)}
                            >
                                🛒 Cart ({cart.length})
                            </button>
                        </div>
                    </header>

                    <div className="portal-content">
                        <MenuList 
                            menuItems={menuItems}
                            onAddToCart={handleAddToCart}
                        />
                        
                        {(showCart || cart.length > 0) && (
                            <Cart 
                                cart={cart}
                                customerName={customerName}
                                onCustomerNameChange={setCustomerName}
                                onQuantityChange={handleQuantityChange}
                                onRemove={handleRemoveFromCart}
                                onPlaceOrder={handlePlaceOrder}
                                onClose={() => setShowCart(false)}
                            />
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default CustomerPortal;