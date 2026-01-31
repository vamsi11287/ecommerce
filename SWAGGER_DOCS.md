# Swagger API Documentation Integration

## ✅ Successfully Integrated

Swagger UI is now available at: **http://localhost:5000/api-docs**

## 📚 What's Available

### **Authentication APIs** (`/api/auth`)
- POST `/api/auth/register` - Register new user (owner/staff/kitchen)
- POST `/api/auth/login` - Login and get JWT token
- GET `/api/auth/profile` - Get current user profile
- GET `/api/auth/verify` - Verify JWT token
- GET `/api/auth/staff` - Get all staff members (owner only)
- PUT `/api/auth/staff/:id` - Update staff member (owner only)
- DELETE `/api/auth/staff/:id` - Delete staff member (owner only)

### **Orders APIs** (`/api/orders`)
- GET `/api/orders` - Get all orders (with filters)
- POST `/api/orders` - Create a new order
- GET `/api/orders/stats` - Get order statistics
- GET `/api/orders/history` - Get order history by date
- GET `/api/orders/ready` - Get ready orders (public)
- GET `/api/orders/:id` - Get specific order
- PATCH `/api/orders/:id/status` - Update order status
- DELETE `/api/orders/:id` - Delete order

### **Menu APIs** (`/api/menu`)
- GET `/api/menu` - Get all menu items (public)
- POST `/api/menu` - Create menu item
- GET `/api/menu/categories` - Get categories
- POST `/api/menu/upload-image` - Upload menu image
- GET `/api/menu/:id` - Get specific menu item
- PUT `/api/menu/:id` - Update menu item
- DELETE `/api/menu/:id` - Delete menu item

### **Settings APIs** (`/api/settings`)
- GET `/api/settings` - Get all settings (owner only)
- POST `/api/settings` - Update/create setting (owner only)
- GET `/api/settings/:key` - Get specific setting
- POST `/api/settings/customer-ordering/toggle` - Toggle customer ordering
- GET `/api/settings/customer-ordering/status` - Check if ordering enabled (public)

## 🔐 Authentication in Swagger

For protected routes that require authentication:

1. **Get JWT Token:**
   - Use the `/api/auth/login` endpoint
   - Enter credentials (e.g., username: `owner`, password: `owner123`)
   - Copy the `token` from the response

2. **Authorize in Swagger:**
   - Click the **"Authorize"** button (🔒 icon) at the top
   - Enter: `Bearer <your-token>`
   - Example: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - Click "Authorize"

3. **Make Authenticated Requests:**
   - All protected endpoints will now include your token automatically

## 🎯 Testing Flow

### Example 1: Complete Order Flow
```
1. POST /api/auth/login
   - Login as staff/owner
   - Get JWT token

2. Click "Authorize" and enter token

3. GET /api/menu
   - View available menu items

4. POST /api/orders
   - Create a new order with menu items
   
5. PATCH /api/orders/{id}/status
   - Update order status (PENDING → STARTED → COMPLETED → READY)

6. GET /api/orders/ready
   - View ready orders (public, no auth needed)
```

### Example 2: Menu Management
```
1. Login as owner/staff
2. Authorize in Swagger
3. POST /api/menu - Create new menu item
4. POST /api/menu/upload-image - Upload image (multipart/form-data)
5. GET /api/menu - View all items
6. PUT /api/menu/{id} - Update item
7. DELETE /api/menu/{id} - Delete item
```

## 📦 Installed Packages

```json
{
  "swagger-ui-express": "^5.0.0",
  "swagger-jsdoc": "^6.2.8"
}
```

## 📁 Files Modified/Created

1. **Created:**
   - `server/src/config/swagger.js` - Swagger configuration and schemas

2. **Modified:**
   - `server/src/server.js` - Added Swagger UI middleware
   - `server/src/routes/auth.js` - Added JSDoc comments for auth endpoints
   - `server/src/routes/orders.js` - Added JSDoc comments for order endpoints
   - `server/src/routes/menu.js` - Added JSDoc comments for menu endpoints
   - `server/src/routes/settings.js` - Added JSDoc comments for settings endpoints

## 🎨 Features

✅ **Interactive API Documentation** - Try out APIs directly from browser
✅ **JWT Authentication Support** - Easy token management with "Authorize" button
✅ **Request/Response Examples** - See sample data for each endpoint
✅ **Schema Definitions** - View data models (User, Order, MenuItem, Settings)
✅ **Role-Based Access** - Clear indication of which roles can access each endpoint
✅ **Public Endpoints** - Marked with no security required
✅ **Error Responses** - See possible error codes and messages
✅ **Query Parameters** - Filter options documented (e.g., status, category)

## 🌐 Access Points

- **Swagger UI**: http://localhost:5000/api-docs
- **API Base URL**: http://localhost:5000/api
- **Health Check**: http://localhost:5000/health

## 🔄 Socket.io Events (Not in Swagger)

Socket.io real-time events are not part of REST API and thus not shown in Swagger:
- `order:created`
- `order:status-updated`
- `order:ready`
- `order:deleted`
- `menu:item-added`
- `menu:item-updated`
- `menu:item-deleted`
- `settings:customer-ordering-toggled`

## 📝 Notes

- **Token Expiration**: Tokens expire after 24 hours
- **Public Endpoints**: `/api/menu/*`, `/api/orders/ready`, `/api/settings/customer-ordering/status` don't require authentication
- **Owner-Only**: Staff management and settings require owner role
- **File Uploads**: Use `multipart/form-data` for image uploads
- **Real-time Updates**: Changes trigger Socket.io events to all connected clients

---

## 🚀 Quick Start

1. Start server: `cd server && npm start`
2. Open browser: http://localhost:5000/api-docs
3. Login via `/api/auth/login` to get token
4. Click "Authorize" and enter token
5. Try any API endpoint!

**Enjoy your comprehensive API documentation! 📚✨**
