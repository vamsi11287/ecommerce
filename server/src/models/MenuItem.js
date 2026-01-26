const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Menu item name is required'],
        trim: true
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: [0, 'Price cannot be negative']
    },
    description: {
        type: String,
        trim: true,
        default: ''
    },
    category: {
        type: String,
        trim: true,
        default: 'General'
    },
    imageUrl: {
        type: String,
        trim: true
    },
    isAvailable: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Indexes for performance
menuItemSchema.index({ name: 1 });
menuItemSchema.index({ category: 1 });
menuItemSchema.index({ isAvailable: 1 });

const MenuItem = mongoose.model('MenuItem', menuItemSchema);

module.exports = MenuItem;