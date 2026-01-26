const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: true,
        trim: true,
        lowercase: true,
        minlength: [3, 'Username must be at least 3 characters']
    },
    email: {
        type: String,
        sparse: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters']
    },
    role: {
        type: String,
        enum: ['owner', 'staff', 'kitchen', 'customer'],
        default: 'customer',
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { 
    timestamps: true 
});

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Index for performance
userSchema.index({ username: 1 });
userSchema.index({ role: 1 });

const User = mongoose.model('User', userSchema);

module.exports = User;