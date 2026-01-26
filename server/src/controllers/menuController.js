const MenuItem = require('../models/MenuItem');

// Get all menu items (public - no auth required)
exports.getMenuItems = async (req, res) => {
    try {
        const { category, isAvailable } = req.query;
        
        const query = {};
        if (category) query.category = category;
        if (isAvailable !== undefined) query.isAvailable = isAvailable === 'true';

        const menuItems = await MenuItem.find(query).sort({ category: 1, name: 1 });
        
        res.status(200).json({ 
            success: true,
            count: menuItems.length,
            data: menuItems
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Error fetching menu items', 
            error: error.message 
        });
    }
};

// Get single menu item
exports.getMenuItemById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const menuItem = await MenuItem.findById(id);
        
        if (!menuItem) {
            return res.status(404).json({ 
                success: false,
                message: 'Menu item not found' 
            });
        }

        res.status(200).json({ 
            success: true,
            data: menuItem
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Error fetching menu item', 
            error: error.message 
        });
    }
};

// Create a new menu item (owner/staff only)
exports.createMenuItem = async (req, res) => {
    try {
        const { name, price, description, category, imageUrl, isAvailable } = req.body;

        // Validate input
        if (!name || price === undefined) {
            return res.status(400).json({ 
                success: false,
                message: 'Name and price are required' 
            });
        }

        const newMenuItem = new MenuItem({ 
            name, 
            price, 
            description,
            category,
            imageUrl,
            isAvailable: isAvailable !== undefined ? isAvailable : true
        });

        const savedMenuItem = await newMenuItem.save();

        // Emit socket event
        if (req.app.get('io')) {
            req.app.get('io').emit('menu:item-created', savedMenuItem);
        }

        res.status(201).json({ 
            success: true,
            message: 'Menu item created successfully',
            data: savedMenuItem
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Error creating menu item', 
            error: error.message 
        });
    }
};

// Update a menu item (owner/staff only)
exports.updateMenuItem = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, price, description, category, imageUrl, isAvailable } = req.body;

        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (price !== undefined) updateData.price = price;
        if (description !== undefined) updateData.description = description;
        if (category !== undefined) updateData.category = category;
        if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
        if (isAvailable !== undefined) updateData.isAvailable = isAvailable;

        const updatedMenuItem = await MenuItem.findByIdAndUpdate(
            id, 
            updateData, 
            { new: true, runValidators: true }
        );

        if (!updatedMenuItem) {
            return res.status(404).json({ 
                success: false,
                message: 'Menu item not found' 
            });
        }

        // Emit socket event
        if (req.app.get('io')) {
            req.app.get('io').emit('menu:item-updated', updatedMenuItem);
        }

        res.status(200).json({ 
            success: true,
            message: 'Menu item updated successfully',
            data: updatedMenuItem
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Error updating menu item', 
            error: error.message 
        });
    }
};

// Delete a menu item (owner/staff only)
exports.deleteMenuItem = async (req, res) => {
    try {
        const { id } = req.params;

        const menuItem = await MenuItem.findByIdAndDelete(id);

        if (!menuItem) {
            return res.status(404).json({ 
                success: false,
                message: 'Menu item not found' 
            });
        }

        // Emit socket event
        if (req.app.get('io')) {
            req.app.get('io').emit('menu:item-deleted', { itemId: id });
        }

        res.status(200).json({ 
            success: true,
            message: 'Menu item deleted successfully'
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Error deleting menu item', 
            error: error.message 
        });
    }
};

// Get menu categories
exports.getCategories = async (req, res) => {
    try {
        const categories = await MenuItem.distinct('category');
        
        res.status(200).json({ 
            success: true,
            count: categories.length,
            data: categories
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Error fetching categories', 
            error: error.message 
        });
    }
};

// Upload menu item image
exports.uploadImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No image file provided'
            });
        }

        // Construct the image URL
        const imageUrl = `/uploads/menu-images/${req.file.filename}`;

        res.status(200).json({
            success: true,
            message: 'Image uploaded successfully',
            data: {
                imageUrl: imageUrl,
                filename: req.file.filename
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error uploading image',
            error: error.message
        });
    }
};