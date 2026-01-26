const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    orderId: {
        type: String,
        unique: true
    },
    customerName: {
        type: String,
        required: [true, 'Customer name is required'],
        trim: true
    },
    items: [{
        menuItemId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'MenuItem',
            required: true
        },
        name: {
            type: String,
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        price: {
            type: Number,
            required: true,
            min: 0
        }
    }],
    totalAmount: {
        type: Number,
        required: true,
        min: 0
    },
    status: {
        type: String,
        enum: ['PENDING', 'STARTED', 'COMPLETED', 'READY'],
        default: 'PENDING',
        required: true
    },
    orderType: {
        type: String,
        enum: ['STAFF', 'CUSTOMER'],
        required: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    notes: {
        type: String,
        trim: true
    }
}, { 
    timestamps: true 
});

// Auto-generate order ID before saving
orderSchema.pre('save', async function(next) {
    if (this.isNew && !this.orderId) {
        const count = await mongoose.model('Order').countDocuments();
        this.orderId = `ORD-${String(count + 1).padStart(5, '0')}`;
    }
    next();
});

// Calculate total amount
orderSchema.methods.calculateTotal = function() {
    this.totalAmount = this.items.reduce((total, item) => {
        return total + (item.price * item.quantity);
    }, 0);
    return this.totalAmount;
};

// Indexes for performance
orderSchema.index({ orderId: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ orderType: 1 });

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;