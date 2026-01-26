const Settings = require('../models/Settings');

// Get all settings
exports.getAllSettings = async (req, res) => {
    try {
        const settings = await Settings.find();
        
        // Convert to key-value object
        const settingsObj = {};
        settings.forEach(setting => {
            settingsObj[setting.key] = setting.value;
        });

        res.status(200).json({ 
            success: true,
            data: settingsObj
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Error fetching settings', 
            error: error.message 
        });
    }
};

// Get a single setting by key
exports.getSetting = async (req, res) => {
    try {
        const { key } = req.params;
        
        const setting = await Settings.findOne({ key });
        
        if (!setting) {
            return res.status(404).json({ 
                success: false,
                message: 'Setting not found' 
            });
        }

        res.status(200).json({ 
            success: true,
            data: setting
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Error fetching setting', 
            error: error.message 
        });
    }
};

// Update or create a setting
exports.updateSetting = async (req, res) => {
    try {
        const { key, value, description } = req.body;

        if (!key || value === undefined) {
            return res.status(400).json({ 
                success: false,
                message: 'Key and value are required' 
            });
        }

        const setting = await Settings.findOneAndUpdate(
            { key },
            { value, description },
            { new: true, upsert: true, runValidators: true }
        );

        // Emit socket event for settings change
        if (req.app.get('io')) {
            req.app.get('io').emit('settings:updated', { key, value });
        }

        res.status(200).json({ 
            success: true,
            message: 'Setting updated successfully',
            data: setting
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Error updating setting', 
            error: error.message 
        });
    }
};

// Toggle customer ordering
exports.toggleCustomerOrdering = async (req, res) => {
    try {
        const { enabled } = req.body;

        const setting = await Settings.findOneAndUpdate(
            { key: 'customerOrderingEnabled' },
            { 
                value: enabled,
                description: 'Enable or disable customer self-ordering'
            },
            { new: true, upsert: true }
        );

        // Emit socket event
        if (req.app.get('io')) {
            req.app.get('io').emit('settings:customer-ordering', { enabled });
        }

        res.status(200).json({ 
            success: true,
            message: `Customer ordering ${enabled ? 'enabled' : 'disabled'}`,
            data: setting
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Error toggling customer ordering', 
            error: error.message 
        });
    }
};

// Check if customer ordering is enabled (public)
exports.isCustomerOrderingEnabled = async (req, res) => {
    try {
        const setting = await Settings.findOne({ key: 'customerOrderingEnabled' });
        const enabled = setting ? setting.value : false;

        res.status(200).json({ 
            success: true,
            data: { enabled }
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Error checking customer ordering status', 
            error: error.message 
        });
    }
};
