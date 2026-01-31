const Report = require('../models/Report');

// Get all reports (owner/staff only)
exports.getAllReports = async (req, res) => {
    try {
        const { startDate, endDate, limit = 100 } = req.query;
        
        const query = {};
        
        // Date range filter
        if (startDate || endDate) {
            query.takenAt = {};
            if (startDate) {
                query.takenAt.$gte = new Date(startDate);
            }
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                query.takenAt.$lte = end;
            }
        }
        
        const reports = await Report.find(query)
            .populate('createdBy', 'username role')
            .populate('takenBy', 'username role')
            .sort({ takenAt: -1 })
            .limit(parseInt(limit));
        
        res.status(200).json({ 
            success: true,
            count: reports.length,
            data: reports
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Error fetching reports', 
            error: error.message 
        });
    }
};

// Get reports by specific date (owner/staff only)
exports.getReportsByDate = async (req, res) => {
    try {
        const { date } = req.params;
        
        if (!date) {
            return res.status(400).json({ 
                success: false,
                message: 'Date parameter is required' 
            });
        }
        
        const startDate = new Date(date);
        startDate.setHours(0, 0, 0, 0);
        
        const endDate = new Date(date);
        endDate.setHours(23, 59, 59, 999);
        
        const reports = await Report.find({
            takenAt: {
                $gte: startDate,
                $lte: endDate
            }
        })
        .populate('createdBy', 'username role')
        .populate('takenBy', 'username role')
        .sort({ takenAt: -1 });
        
        // Calculate statistics for the day
        const totalAmount = reports.reduce((sum, report) => sum + report.totalAmount, 0);
        const totalOrders = reports.length;
        
        res.status(200).json({ 
            success: true,
            date: date,
            statistics: {
                totalOrders,
                totalAmount,
                averageOrderValue: totalOrders > 0 ? (totalAmount / totalOrders).toFixed(2) : 0
            },
            data: reports
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Error fetching reports by date', 
            error: error.message 
        });
    }
};

// Get reports summary (grouped by date)
exports.getReportsSummary = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        
        const matchStage = {};
        
        if (startDate || endDate) {
            matchStage.takenAt = {};
            if (startDate) {
                matchStage.takenAt.$gte = new Date(startDate);
            }
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                matchStage.takenAt.$lte = end;
            }
        }
        
        const summary = await Report.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: {
                        year: { $year: '$takenAt' },
                        month: { $month: '$takenAt' },
                        day: { $dayOfMonth: '$takenAt' }
                    },
                    totalOrders: { $sum: 1 },
                    totalRevenue: { $sum: '$totalAmount' },
                    date: { $first: '$takenAt' }
                }
            },
            {
                $project: {
                    _id: 0,
                    date: {
                        $dateToString: {
                            format: '%Y-%m-%d',
                            date: '$date'
                        }
                    },
                    totalOrders: 1,
                    totalRevenue: { $round: ['$totalRevenue', 2] },
                    averageOrderValue: { 
                        $round: [{ $divide: ['$totalRevenue', '$totalOrders'] }, 2] 
                    }
                }
            },
            { $sort: { date: -1 } }
        ]);
        
        res.status(200).json({ 
            success: true,
            count: summary.length,
            data: summary
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Error fetching reports summary', 
            error: error.message 
        });
    }
};

module.exports = exports;
