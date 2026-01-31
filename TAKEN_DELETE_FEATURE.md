# Order Taken/Delete Feature Documentation

## ✅ Feature Overview

This feature allows **Owner** and **Staff** to manage completed orders in two ways:
1. **✅ Taken** - Mark order as taken and move it to reports (day-wise tracking)
2. **🗑️ Delete** - Permanently delete order from database (no backup)

---

## 🎯 What's Implemented

### **Backend Components**

#### 1. **Report Model** (`server/src/models/Report.js`)
- Stores taken orders with complete order details
- Fields:
  - `orderId` - Original order ID (e.g., ORD-00001)
  - `customerName` - Customer name
  - `items` - Array of ordered items
  - `totalAmount` - Order total
  - `status` - Order status when taken
  - `orderType` - STAFF or CUSTOMER
  - `createdBy` - User who created order
  - `takenBy` - User who marked as taken (required)
  - `originalCreatedAt` - When order was created
  - `takenAt` - When order was marked as taken
- Indexed for efficient date-based queries

#### 2. **Report Routes** (`server/src/routes/reports.js`)
```javascript
GET  /api/reports              // Get all reports (with date filters)
GET  /api/reports/summary      // Get summary grouped by date
GET  /api/reports/date/:date   // Get reports for specific date
```

#### 3. **Report Controller** (`server/src/controllers/reportController.js`)
- `getAllReports()` - Fetch reports with date range filter
- `getReportsByDate()` - Fetch reports for specific date with statistics
- `getReportsSummary()` - Aggregate data by date (total orders, revenue, avg)

#### 4. **Order Endpoints Updated** (`server/src/routes/orders.js`)
```javascript
POST   /api/orders/:id/taken  // Mark order as taken (owner/staff only)
DELETE /api/orders/:id         // Delete order permanently (owner/staff only)
```

#### 5. **Order Controller** (`server/src/controllers/orderController.js`)
- `markOrderAsTaken()`:
  - Finds order
  - Creates report entry
  - Deletes order from orders collection
  - Emits socket event: `order:taken`
- `deleteOrder()`:
  - Permanently deletes order
  - No backup created
  - Emits socket event: `order:deleted`

---

### **Frontend Components**

#### 1. **Updated OrderList** (`client/src/components/staff/OrderList.jsx`)
- Added two action buttons for each order:
  - **✅ Taken** button (green)
    - Confirms with user: "Mark order as taken? It will be moved to reports."
    - Calls `orderAPI.markAsTaken(orderId)`
    - Refreshes order list on success
  - **🗑️ Delete** button (red)
    - Confirms with user: "Permanently delete this order? This cannot be undone."
    - Calls `orderAPI.delete(orderId)`
    - Refreshes order list on success

#### 2. **New ReportsTab** (`client/src/components/staff/ReportsTab.jsx`)
- Two view modes:
  - **📈 Summary View**:
    - Shows aggregated data by date
    - Displays: Total Orders, Total Revenue, Average Order Value
    - Click on any date to see detailed orders
  - **📋 Detailed View**:
    - Shows individual orders with full details
    - Includes: Order ID, Customer, Items, Total, Status, Times, Taken By
- Date range filters (default: last 30 days)
- Real-time search functionality

#### 3. **Updated API Service** (`client/src/services/api.js`)
```javascript
// New API methods
orderAPI.markAsTaken(id)       // POST /orders/:id/taken
reportAPI.getAll(params)        // GET /reports
reportAPI.getByDate(date)       // GET /reports/date/:date
reportAPI.getSummary(params)    // GET /reports/summary
```

#### 4. **Updated StaffDashboard** (`client/src/components/staff/StaffDashboard.jsx`)
- Added "📊 Reports" tab
- Socket listener for `order:taken` event
- Automatically removes taken orders from active list
- Shows notification when order is taken

---

## 🔄 Complete User Flow

### **Scenario 1: Mark Order as Taken**

```
1. Staff/Owner opens Dashboard → Orders tab
2. Sees list of active orders
3. Clicks "✅ Taken" button on completed order
4. Confirmation dialog: "Mark order ORD-00001 as taken?"
5. Clicks "OK"
   
Backend:
6. POST /api/orders/:id/taken
7. Creates Report entry with:
   - All order details
   - takenBy: current user ID
   - takenAt: current timestamp
8. Deletes order from Orders collection
9. Emits socket event: order:taken

Frontend:
10. Order disappears from active orders list
11. Notification: "Order ORD-00001 marked as taken"
12. Stats update (total orders count decreases)

View Report:
13. Navigate to Reports tab
14. See order in today's summary
15. Click on today's date
16. View detailed report with all order info
```

### **Scenario 2: Delete Order Permanently**

```
1. Staff/Owner sees unwanted/test order
2. Clicks "🗑️ Delete" button
3. Confirmation: "Permanently delete? Cannot be undone."
4. Clicks "OK"

Backend:
5. DELETE /api/orders/:id
6. Deletes order from database completely
7. No backup/report created
8. Emits socket event: order:deleted

Frontend:
9. Order disappears from list
10. Notification: "Order deleted successfully"
11. Cannot be recovered
```

---

## 📊 Reports Tab Features

### **Summary View** (Default)
- Card-based layout showing daily statistics
- Each card shows:
  - 📅 Date
  - Total Orders count
  - Total Revenue ($)
  - Average Order Value ($)
- Click any card to view detailed orders for that date
- Covers last 30 days by default

### **Detailed View**
- Table showing individual orders
- Columns:
  - Order ID
  - Customer Name
  - Items (with quantities)
  - Total Amount
  - Status (when taken)
  - Original Order Time
  - Taken Time
  - Taken By (username)
- "Back to Summary" button

### **Date Filters**
- Start Date and End Date inputs
- 🔍 Search button to apply filters
- Works in both Summary and Detailed views

---

## 🔐 Access Control

### **Owner & Staff Only**
- ✅ Taken button (visible & functional)
- 🗑️ Delete button (visible & functional)
- 📊 Reports tab (accessible)

### **Kitchen Role**
- ❌ Cannot access Taken/Delete buttons
- ❌ Cannot access Reports tab
- ✅ Can only update order status

---

## 🎨 UI/UX Enhancements

### **Button Styling**
```css
✅ Taken Button:
- Gradient background (purple-blue)
- Hover effect (slight lift)
- Tooltip: "Mark as taken and move to reports"

🗑️ Delete Button:
- Red gradient background
- Warning hover effect
- Tooltip: "Permanently delete this order"
```

### **Order Actions Section**
- Two buttons side-by-side (desktop)
- Stacked buttons (mobile)
- Equal width for consistency
- 10px gap between buttons

### **Reports Tab**
- Toggle between Summary/Detailed views
- Date range picker with search button
- Clickable summary cards
- Responsive table with horizontal scroll
- Loading states
- Empty states with helpful messages

---

## 🔌 Socket.io Real-Time Updates

### **New Event: `order:taken`**
```javascript
// Backend emits:
io.emit('order:taken', { 
    orderId: order._id,
    reportId: report._id 
});

// Frontend listens:
socket.onOrderTaken((data) => {
    // Remove order from active list
    // Show notification
    // Update stats
});
```

### **Existing Event: `order:deleted`**
```javascript
io.emit('order:deleted', { orderId: id });
```

---

## 📱 API Endpoints Summary

### **Orders**
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/orders/:id/taken` | Owner/Staff | Mark as taken → move to reports |
| DELETE | `/api/orders/:id` | Owner/Staff | Delete permanently |

### **Reports**
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/reports` | Owner/Staff | Get all reports (with filters) |
| GET | `/api/reports/summary` | Owner/Staff | Get daily summary |
| GET | `/api/reports/date/:date` | Owner/Staff | Get reports for date |

---

## 🧪 Testing Checklist

- [x] Backend: Report model created
- [x] Backend: Report routes & controller implemented
- [x] Backend: Order taken endpoint working
- [x] Backend: Order delete endpoint working
- [x] Backend: Socket events emitting
- [x] Frontend: Taken button functional
- [x] Frontend: Delete button functional
- [x] Frontend: Reports tab displaying
- [x] Frontend: Summary view working
- [x] Frontend: Detailed view working
- [x] Frontend: Date filters working
- [x] Frontend: Socket listeners active
- [x] UI: Buttons styled correctly
- [x] UI: Responsive design
- [x] Swagger: API documentation updated
- [x] Access Control: Owner/Staff only

---

## 💾 Database Schema

### **Reports Collection**
```javascript
{
  _id: ObjectId,
  orderId: "ORD-00001",
  customerName: "John Doe",
  items: [
    {
      menuItemId: ObjectId,
      name: "Pizza",
      quantity: 2,
      price: 12.99
    }
  ],
  totalAmount: 25.98,
  status: "READY",
  orderType: "CUSTOMER",
  createdBy: ObjectId (User),
  takenBy: ObjectId (User) *required*,
  notes: "Extra cheese",
  originalCreatedAt: Date,
  takenAt: Date,
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

---

## 🚀 How to Use

### **For Staff/Owner:**

1. **Mark Order as Taken:**
   ```
   Dashboard → Orders Tab → Find completed order → Click "✅ Taken"
   ```

2. **View Taken Orders:**
   ```
   Dashboard → Reports Tab → See summary or detailed view
   ```

3. **Delete Order:**
   ```
   Dashboard → Orders Tab → Find order → Click "🗑️ Delete"
   ```

### **Report Analytics:**
```
Reports Tab → Summary View → Click date card → View detailed orders
```

---

## 🎯 Key Benefits

✅ **Day-wise tracking** of completed orders
✅ **Revenue analytics** by date
✅ **Staff accountability** (tracks who took each order)
✅ **Clean active orders list** (moved to reports)
✅ **Permanent delete option** (for test/error orders)
✅ **Real-time updates** across all connected clients
✅ **Responsive UI** for desktop & mobile
✅ **Owner/Staff only access** (secure)

---

## 📊 Reports API Examples

### Get Last 7 Days Summary:
```javascript
GET /api/reports/summary?startDate=2026-01-24&endDate=2026-01-31

Response:
{
  "success": true,
  "count": 7,
  "data": [
    {
      "date": "2026-01-31",
      "totalOrders": 15,
      "totalRevenue": 234.50,
      "averageOrderValue": 15.63
    },
    ...
  ]
}
```

### Get Orders for Specific Date:
```javascript
GET /api/reports/date/2026-01-31

Response:
{
  "success": true,
  "date": "2026-01-31",
  "statistics": {
    "totalOrders": 15,
    "totalAmount": 234.50,
    "averageOrderValue": "15.63"
  },
  "data": [ /* array of orders */ ]
}
```

---

## 🎉 Feature Complete!

The Taken/Delete feature is fully implemented with:
- ✅ Backend API (4 new endpoints)
- ✅ Frontend UI (2 buttons + Reports tab)
- ✅ Real-time updates (Socket.io)
- ✅ Day-wise reports & analytics
- ✅ Access control (Owner/Staff only)
- ✅ Swagger documentation
- ✅ Responsive design

**Ready for production use! 🚀**
