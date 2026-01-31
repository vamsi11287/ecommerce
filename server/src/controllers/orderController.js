const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const Settings = require('../models/Settings');
const Report = require('../models/Report');

// Create order (Staff or Customer)
exports.createOrder = async (req, res) => {
    try {
        const { customerName, items, notes, orderType } = req.body;

        // Validate input
        if (!customerName || !items || items.length === 0) {
            return res.status(400).json({ 
                success: false,
                message: 'Customer name and items are required' 
            });
        }

        // If customer order, check if customer ordering is enabled
        if (orderType === 'CUSTOMER') {
            const setting = await Settings.findOne({ key: 'customerOrderingEnabled' });
            if (!setting || !setting.value) {
                return res.status(403).json({ 
                    success: false,
                    message: 'Customer ordering is currently disabled' 
                });
            }
        }

        // Validate and enrich items with menu data
        const enrichedItems = [];
        for (const item of items) {
            const menuItem = await MenuItem.findById(item.menuItemId);
            if (!menuItem) {
                return res.status(404).json({ 
                    success: false,
                    message: `Menu item not found: ${item.menuItemId}` 
                });
            }
            if (!menuItem.isAvailable) {
                return res.status(400).json({ 
                    success: false,
                    message: `Menu item not available: ${menuItem.name}` 
                });
            }
            enrichedItems.push({
                menuItemId: menuItem._id,
                name: menuItem.name,
                quantity: item.quantity,
                price: menuItem.price
            });
        }

        // Create order
        const newOrder = new Order({
            customerName,
            items: enrichedItems,
            status: 'PENDING',
            orderType: orderType || 'STAFF',
            createdBy: req.user ? req.user._id : null,
            notes
        });

        // Calculate total
        newOrder.calculateTotal();
        
        await newOrder.save();

        // Populate menu item details
        await newOrder.populate('items.menuItemId');

        // Emit socket event
        if (req.app.get('io')) {
            req.app.get('io').emit('order:created', newOrder);
        }

        res.status(201).json({ 
            success: true,
            message: 'Order created successfully',
            data: newOrder
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Error creating order', 
            error: error.message 
        });
    }
};

// Get all orders with optional filtering
exports.getOrders = async (req, res) => {
    try {
        const { status, orderType, startDate, endDate, limit } = req.query;
        
        const query = {};
        
        if (status) {
            query.status = status;
        }
        
        if (orderType) {
            query.orderType = orderType;
        }

        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }

        const orders = await Order.find(query)
            .populate('items.menuItemId')
            .populate('createdBy', 'username role')
            .sort({ createdAt: -1 })
            .limit(limit ? parseInt(limit) : 100);

        res.status(200).json({ 
            success: true,
            count: orders.length,
            data: orders
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Error fetching orders', 
            error: error.message 
        });
    }
};

// Get single order by ID
exports.getOrderById = async (req, res) => {
    try {
        const { id } = req.params;

        const order = await Order.findById(id)
            .populate('items.menuItemId')
            .populate('createdBy', 'username role');

        if (!order) {
            return res.status(404).json({ 
                success: false,
                message: 'Order not found' 
            });
        }

        res.status(200).json({ 
            success: true,
            data: order
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Error fetching order', 
            error: error.message 
        });
    }
};

// Update order status (Kitchen)
exports.updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        // Validate status
        const validStatuses = ['PENDING', 'STARTED', 'COMPLETED', 'READY'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ 
                success: false,
                message: 'Invalid status. Valid statuses: ' + validStatuses.join(', ')
            });
        }

        const updatedOrder = await Order.findByIdAndUpdate(
            id, 
            { status }, 
            { new: true, runValidators: true }
        ).populate('items.menuItemId').populate('createdBy', 'username role');

        if (!updatedOrder) {
            return res.status(404).json({ 
                success: false,
                message: 'Order not found' 
            });
        }

        // Emit socket events based on status
        if (req.app.get('io')) {
            req.app.get('io').emit('order:status-updated', updatedOrder);
            
            if (status === 'READY') {
                req.app.get('io').emit('order:ready', updatedOrder);
            }
        }

        res.status(200).json({ 
            success: true,
            message: 'Order status updated successfully',
            data: updatedOrder
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Error updating order status', 
            error: error.message 
        });
    }
};

// Delete order
exports.deleteOrder = async (req, res) => {
    try {
        const { id } = req.params;

        const order = await Order.findByIdAndDelete(id);

        if (!order) {
            return res.status(404).json({ 
                success: false,
                message: 'Order not found' 
            });
        }

        // Emit socket event
        if (req.app.get('io')) {
            req.app.get('io').emit('order:deleted', { orderId: id });
        }

        res.status(200).json({ 
            success: true,
            message: 'Order deleted successfully'
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Error deleting order', 
            error: error.message 
        });
    }
};

// Mark order as taken (move to reports)
exports.markOrderAsTaken = async (req, res) => {
    try {
        const { id } = req.params;

        // Find the order
        const order = await Order.findById(id);

        if (!order) {
            return res.status(404).json({ 
                success: false,
                message: 'Order not found' 
            });
        }

        // Create report entry from order
        const report = new Report({
            orderId: order.orderId,
            customerName: order.customerName,
            items: order.items,
            totalAmount: order.totalAmount,
            status: order.status,
            orderType: order.orderType,
            createdBy: order.createdBy,
            takenBy: req.user._id,
            notes: order.notes,
            originalCreatedAt: order.createdAt,
            takenAt: new Date()
        });

        // Save report and delete order in a single operation
        await report.save();
        await Order.findByIdAndDelete(id);

        // Emit socket event
        if (req.app.get('io')) {
            req.app.get('io').emit('order:taken', { 
                orderId: id,
                reportId: report._id 
            });
        }

        res.status(200).json({ 
            success: true,
            message: 'Order marked as taken and moved to reports',
            data: report
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Error marking order as taken', 
            error: error.message 
        });
    }
};

// Get orders for ready display (only READY status)
exports.getReadyOrders = async (req, res) => {
    try {
        // Return all active orders (not PICKED_UP or CANCELLED) for the public display board
        const orders = await Order.find({ 
            status: { $in: ['PENDING', 'STARTED', 'COMPLETED', 'READY'] } 
        })
            .select('orderId customerName status createdAt updatedAt')
            .sort({ createdAt: 1 });

        res.status(200).json({ 
            success: true,
            count: orders.length,
            data: orders
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Error fetching ready orders', 
            error: error.message 
        });
    }
};

// Get order statistics
exports.getOrderStats = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const stats = await Order.aggregate([
            {
                $facet: {
                    statusCount: [
                        { $group: { _id: '$status', count: { $sum: 1 } } }
                    ],
                    todayOrders: [
                        { $match: { createdAt: { $gte: today } } },
                        { $count: 'count' }
                    ],
                    todayRevenue: [
                        { $match: { createdAt: { $gte: today } } },
                        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
                    ],
                    totalRevenue: [
                        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
                    ]
                }
            }
        ]);

        res.status(200).json({ 
            success: true,
            data: stats[0]
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Error fetching order statistics', 
            error: error.message 
        });
    }
};

// Get order history by date (owner only)
exports.getOrderHistory = async (req, res) => {
    try {
        const { date } = req.query;
        
        if (!date) {
            return res.status(400).json({
                success: false,
                message: 'Date parameter is required'
            });
        }

        // Parse the date and set time range for the entire day
        const startDate = new Date(date);
        startDate.setHours(0, 0, 0, 0);
        
        const endDate = new Date(date);
        endDate.setHours(23, 59, 59, 999);

        // Get orders for the specified date
        const orders = await Order.find({
            createdAt: {
                $gte: startDate,
                $lte: endDate
            }
        }).sort({ createdAt: -1 });

        // Calculate daily statistics
        const stats = {
            totalOrders: orders.length,
            totalRevenue: orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0),
            averageOrder: orders.length > 0 
                ? orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0) / orders.length 
                : 0,
            completedOrders: orders.filter(order => 
                ['READY', 'DELIVERED', 'COMPLETED'].includes(order.status)
            ).length,
            statusBreakdown: orders.reduce((acc, order) => {
                acc[order.status] = (acc[order.status] || 0) + 1;
                return acc;
            }, {})
        };

        res.status(200).json({
            success: true,
            data: {
                orders,
                stats,
                date: date
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching order history',
            error: error.message
        });
    }
};

// Permanently delete order (no report saving)
exports.permanentDeleteOrder = async (req, res) => {
    try {
        const { id } = req.params;

        const order = await Order.findById(id);
        if (!order) {
            return res.status(404).json({ 
                success: false,
                message: 'Order not found' 
            });
        }

        await Order.findByIdAndDelete(id);

        // Emit socket event
        const io = req.app.get('io');
        if (io) {
            io.emit('order:deleted', { orderId: order.orderId });
        }

        res.status(200).json({
            success: true,
            message: 'Order permanently deleted'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting order',
            error: error.message
        });
    }
};