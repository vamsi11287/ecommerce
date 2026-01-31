import React, { useState, useEffect } from 'react';
import { reportAPI } from '../../services/api';
import '../../styles/OrderHistory.css';

const ReportsTab = () => {
    const [reports, setReports] = useState([]);
    const [summary, setSummary] = useState([]);
    const [loading, setLoading] = useState(false);
    const [viewMode, setViewMode] = useState('summary'); // 'summary' or 'detailed'
    const [selectedDate, setSelectedDate] = useState('');
    const [dateRange, setDateRange] = useState({
        startDate: '',
        endDate: ''
    });

    useEffect(() => {
        // Load last 30 days summary by default
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);
        
        setDateRange({
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0]
        });

        fetchSummary();
    }, []);

    const fetchSummary = async () => {
        setLoading(true);
        try {
            const response = await reportAPI.getSummary({
                startDate: dateRange.startDate,
                endDate: dateRange.endDate
            });
            setSummary(response.data.data || []);
        } catch (error) {
            console.error('Error fetching summary:', error);
            alert('Error loading reports summary');
        } finally {
            setLoading(false);
        }
    };

    const fetchDetailedReports = async () => {
        setLoading(true);
        try {
            const response = await reportAPI.getAll({
                startDate: dateRange.startDate,
                endDate: dateRange.endDate,
                limit: 100
            });
            setReports(response.data.data || []);
        } catch (error) {
            console.error('Error fetching reports:', error);
            alert('Error loading detailed reports');
        } finally {
            setLoading(false);
        }
    };

    const fetchReportsByDate = async (date) => {
        setLoading(true);
        setSelectedDate(date);
        try {
            const response = await reportAPI.getByDate(date);
            setReports(response.data.data || []);
            setViewMode('detailed');
        } catch (error) {
            console.error('Error fetching reports by date:', error);
            alert('Error loading reports for selected date');
        } finally {
            setLoading(false);
        }
    };

    const handleDateRangeChange = (field, value) => {
        setDateRange(prev => ({ ...prev, [field]: value }));
    };

    const handleSearch = () => {
        if (viewMode === 'summary') {
            fetchSummary();
        } else {
            fetchDetailedReports();
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatDateTime = (dateString) => {
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading && reports.length === 0 && summary.length === 0) {
        return (
            <div className="order-history">
                <h2>📊 Reports - Taken Orders</h2>
                <div className="loading-message">Loading reports...</div>
            </div>
        );
    }

    return (
        <div className="order-history">
            <h2>📊 Reports - Taken Orders</h2>

            {/* Filters */}
            <div className="history-filters">
                <div className="view-mode-toggle">
                    <button
                        className={viewMode === 'summary' ? 'active' : ''}
                        onClick={() => setViewMode('summary')}
                    >
                        📈 Summary
                    </button>
                    <button
                        className={viewMode === 'detailed' ? 'active' : ''}
                        onClick={() => setViewMode('detailed')}
                    >
                        📋 Detailed
                    </button>
                </div>

                <div className="date-filters">
                    <input
                        type="date"
                        value={dateRange.startDate}
                        onChange={(e) => handleDateRangeChange('startDate', e.target.value)}
                    />
                    <span>to</span>
                    <input
                        type="date"
                        value={dateRange.endDate}
                        onChange={(e) => handleDateRangeChange('endDate', e.target.value)}
                    />
                    <button onClick={handleSearch} className="btn-primary">
                        🔍 Search
                    </button>
                </div>
            </div>

            {/* Summary View */}
            {viewMode === 'summary' && (
                <div className="summary-view">
                    {summary.length === 0 ? (
                        <p className="no-data">No reports found for this date range</p>
                    ) : (
                        <div className="summary-cards">
                            {summary.map((item, index) => (
                                <div 
                                    key={index} 
                                    className="summary-card"
                                    onClick={() => fetchReportsByDate(item.date)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <div className="summary-date">
                                        📅 {formatDate(item.date)}
                                    </div>
                                    <div className="summary-stats">
                                        <div className="stat">
                                            <span className="stat-label">Orders:</span>
                                            <span className="stat-value">{item.totalOrders}</span>
                                        </div>
                                        <div className="stat">
                                            <span className="stat-label">Revenue:</span>
                                            <span className="stat-value">${item.totalRevenue}</span>
                                        </div>
                                        <div className="stat">
                                            <span className="stat-label">Avg Order:</span>
                                            <span className="stat-value">${item.averageOrderValue}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Detailed View */}
            {viewMode === 'detailed' && (
                <div className="detailed-view">
                    {selectedDate && (
                        <div className="selected-date-header">
                            <button onClick={() => { setSelectedDate(''); setViewMode('summary'); }}>
                                ← Back to Summary
                            </button>
                            <h3>Orders for {formatDate(selectedDate)}</h3>
                        </div>
                    )}

                    {reports.length === 0 ? (
                        <p className="no-data">No orders found</p>
                    ) : (
                        <div className="history-table-container">
                            <table className="history-table">
                                <thead>
                                    <tr>
                                        <th>Order ID</th>
                                        <th>Customer</th>
                                        <th>Items</th>
                                        <th>Total</th>
                                        <th>Status</th>
                                        <th>Order Time</th>
                                        <th>Taken Time</th>
                                        <th>Taken By</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reports.map((report) => (
                                        <tr key={report._id}>
                                            <td className="order-id-cell">{report.orderId}</td>
                                            <td>{report.customerName}</td>
                                            <td>
                                                <div className="items-cell">
                                                    {report.items.map((item, idx) => (
                                                        <div key={idx}>
                                                            {item.name} × {item.quantity}
                                                        </div>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="amount-cell">${report.totalAmount.toFixed(2)}</td>
                                            <td>
                                                <span className={`status-badge ${report.status.toLowerCase()}`}>
                                                    {report.status}
                                                </span>
                                            </td>
                                            <td>{formatDateTime(report.originalCreatedAt)}</td>
                                            <td>{formatDateTime(report.takenAt)}</td>
                                            <td>{report.takenBy?.username || 'N/A'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ReportsTab;
