const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    orderId: {
        type: String,
        required: true
    },
    customerName: {
        type: String,
        required: true,
        trim: true
    },
    items: [{
        menuItemId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'MenuItem'
        },
        name: {
            type: String,
            required: true
        },
        quantity: {
            type: Number,
            required: true
        },
        price: {
            type: Number,
            required: true
        }
    }],
    totalAmount: {
        type: Number,
        required: true,
        min: 0
    },
    status: {
        type: String,
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
    takenBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    notes: {
        type: String,
        trim: true
    },
    originalCreatedAt: {
        type: Date,
        required: true
    },
    takenAt: {
        type: Date,
        default: Date.now
    }
}, { 
    timestamps: true 
});

// Index for efficient date-based queries
reportSchema.index({ takenAt: -1 });
reportSchema.index({ orderId: 1 });

module.exports = mongoose.model('Report', reportSchema);
