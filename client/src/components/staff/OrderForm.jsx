import React, { useState } from 'react';
import { orderAPI } from '../../services/api';
import '../../styles/OrderForm.css';

const OrderForm = ({ menuItems, onOrderCreated }) => {
    const [customerName, setCustomerName] = useState('');
    const [selectedItems, setSelectedItems] = useState([]);
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleAddItem = (menuItem) => {
        const existing = selectedItems.find(item => item.menuItemId === menuItem._id);
        
        if (existing) {
            setSelectedItems(selectedItems.map(item =>
                item.menuItemId === menuItem._id
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            ));
        } else {
            setSelectedItems([...selectedItems, {
                menuItemId: menuItem._id,
                name: menuItem.name,
                price: menuItem.price,
                quantity: 1
            }]);
        }
    };

    const handleRemoveItem = (menuItemId) => {
        setSelectedItems(selectedItems.filter(item => item.menuItemId !== menuItemId));
    };

    const handleQuantityChange = (menuItemId, newQuantity) => {
        if (newQuantity < 1) {
            handleRemoveItem(menuItemId);
            return;
        }

        setSelectedItems(selectedItems.map(item =>
            item.menuItemId === menuItemId
                ? { ...item, quantity: newQuantity }
                : item
        ));
    };

    const calculateTotal = () => {
        return selectedItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!customerName.trim()) {
            setError('Customer name is required');
            return;
        }

        if (selectedItems.length === 0) {
            setError('Please add at least one item');
            return;
        }

        setLoading(true);

        try {
            const orderData = {
                customerName: customerName.trim(),
                items: selectedItems.map(item => ({
                    menuItemId: item.menuItemId,
                    quantity: item.quantity
                })),
                orderType: 'STAFF',
                notes: notes.trim()
            };

            await orderAPI.create(orderData);

            // Reset form
            setCustomerName('');
            setSelectedItems([]);
            setNotes('');
            
            if (onOrderCreated) {
                onOrderCreated();
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Error creating order');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="order-form-container">
            <form onSubmit={handleSubmit} className="order-form">
                <h2>Create New Order</h2>

                {error && <div className="error-message">{error}</div>}

                <div className="form-group">
                    <label htmlFor="customerName">Customer Name *</label>
                    <input
                        type="text"
                        id="customerName"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Enter customer name"
                        disabled={loading}
                        required
                    />
                </div>

                <div className="menu-section">
                    <h3>Select Items</h3>
                    <div className="menu-grid">
                        {menuItems.filter(item => item.isAvailable).map((menuItem) => (
                            <div 
                                key={menuItem._id} 
                                className="menu-item-card"
                                onClick={() => handleAddItem(menuItem)}
                            >
                                <h4>{menuItem.name}</h4>
                                <p className="price">${menuItem.price.toFixed(2)}</p>
                                {menuItem.description && (
                                    <p className="description">{menuItem.description}</p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {selectedItems.length > 0 && (
                    <div className="selected-items">
                        <h3>Order Items</h3>
                        <table>
                            <thead>
                                <tr>
                                    <th>Item</th>
                                    <th>Price</th>
                                    <th>Quantity</th>
                                    <th>Subtotal</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedItems.map((item) => (
                                    <tr key={item.menuItemId}>
                                        <td>{item.name}</td>
                                        <td>${item.price.toFixed(2)}</td>
                                        <td>
                                            <input
                                                type="number"
                                                min="1"
                                                value={item.quantity}
                                                onChange={(e) => handleQuantityChange(
                                                    item.menuItemId,
                                                    parseInt(e.target.value)
                                                )}
                                                className="quantity-input"
                                            />
                                        </td>
                                        <td>${(item.price * item.quantity).toFixed(2)}</td>
                                        <td>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveItem(item.menuItemId)}
                                                className="btn-remove"
                                            >
                                                ✕
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colSpan="3"><strong>Total</strong></td>
                                    <td colSpan="2"><strong>${calculateTotal().toFixed(2)}</strong></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                )}

                <div className="form-group">
                    <label htmlFor="notes">Notes (Optional)</label>
                    <textarea
                        id="notes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Special instructions..."
                        rows="3"
                        disabled={loading}
                    />
                </div>

                <button 
                    type="submit" 
                    className="btn-primary btn-large"
                    disabled={loading || selectedItems.length === 0}
                >
                    {loading ? 'Creating Order...' : `Create Order - $${calculateTotal().toFixed(2)}`}
                </button>
            </form>
        </div>
    );
};

export default OrderForm;