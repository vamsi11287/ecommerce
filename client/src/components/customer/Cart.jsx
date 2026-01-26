import React from 'react';
import '../../styles/Cart.css';

const Cart = ({ 
    cart, 
    customerName, 
    onCustomerNameChange, 
    onQuantityChange, 
    onRemove, 
    onPlaceOrder,
    onClose 
}) => {
    const calculateTotal = () => {
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    return (
        <div className="cart-container">
            <div className="cart-header">
                <h2>🛒 Your Cart</h2>
                {onClose && (
                    <button className="btn-close" onClick={onClose}>×</button>
                )}
            </div>

            {cart.length === 0 ? (
                <div className="cart-empty">
                    <p>🛈 Your cart is empty</p>
                    <p className="subtitle">Add items from the menu</p>
                </div>
            ) : (
                <>
                    <div className="cart-items">
                        {cart.map(item => (
                            <div key={item._id} className="cart-item">
                                <div className="item-info">
                                    <h4>{item.name}</h4>
                                    <p className="item-price">${item.price.toFixed(2)}</p>
                                </div>
                                <div className="item-controls">
                                    <div className="quantity-controls">
                                        <button 
                                            onClick={() => onQuantityChange(item._id, item.quantity - 1)}
                                            className="btn-qty"
                                        >
                                            -
                                        </button>
                                        <span className="quantity">{item.quantity}</span>
                                        <button 
                                            onClick={() => onQuantityChange(item._id, item.quantity + 1)}
                                            className="btn-qty"
                                        >
                                            +
                                        </button>
                                    </div>
                                    <button 
                                        onClick={() => onRemove(item._id)}
                                        className="btn-remove"
                                        title="Remove item"
                                    >
                                        🗑️
                                    </button>
                                </div>
                                <div className="item-subtotal">
                                    ${(item.price * item.quantity).toFixed(2)}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="cart-total">
                        <span>Total:</span>
                        <span className="total-amount">${calculateTotal().toFixed(2)}</span>
                    </div>

                    <div className="cart-checkout">
                        <div className="form-group">
                            <label htmlFor="customer-name">Your Name *</label>
                            <input
                                type="text"
                                id="customer-name"
                                value={customerName}
                                onChange={(e) => onCustomerNameChange(e.target.value)}
                                placeholder="Enter your name"
                                required
                            />
                        </div>

                        <button 
                            onClick={onPlaceOrder}
                            className="btn-place-order"
                            disabled={!customerName.trim()}
                        >
                            📦 Place Order - ${calculateTotal().toFixed(2)}
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default Cart;