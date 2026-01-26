const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
    key: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    value: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    description: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

// Index for performance
settingsSchema.index({ key: 1 });

const Settings = mongoose.model('Settings', settingsSchema);

module.exports = Settings;
