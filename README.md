# Restaurant Order Management System

A complete real-time restaurant order management system built with the MERN stack (MongoDB, Express.js, React, Node.js) and Socket.io for live updates.

## Features

### 🎯 Core Features
- **Real-time Order Updates** - No page refresh needed, everything updates instantly via Socket.io
- **Staff Dashboard** - Create orders, view all orders, manage settings
- **Kitchen Display** - Real-time order processing with status management
- **Customer Self-Ordering** - Customers can browse menu and place orders themselves
- **Ready Orders Display** - TV-style display for ready orders
- **Role-Based Authentication** - Secure login for Owner, Staff, and Kitchen (customers don't need login)

### 🔐 User Roles
- **Owner** - Full access to all features + settings management
- **Staff** - Create orders, view orders
- **Kitchen** - View and process orders
- **Customer** - Browse menu and place orders (no login required)

### 📊 Order Flow
1. Order created (by Staff or Customer)
2. Kitchen receives order → Marks as STARTED
3. Kitchen marks as COMPLETED
4. Kitchen marks as READY
5. Order appears on Ready Orders Display

### ⚡ Real-time Events
- Order creation notifications
- Order status updates
- Menu item changes
- Settings updates

## Tech Stack

### Backend
- Node.js + Express.js
- MongoDB + Mongoose
- Socket.io (real-time communication)
- JWT (authentication)
- bcryptjs (password hashing)
- Express-validator (input validation)

### Frontend
- React 18
- Vite (build tool)
- React Router DOM (routing)
- Socket.io-client (real-time updates)
- Axios (API requests)

## Project Structure

```
restaurant-order-management
├── client
│   ├── public
│   │   └── index.html
│   ├── src
│   │   ├── App.jsx
│   │   ├── index.jsx
│   │   ├── components
│   │   │   ├── staff
│   │   │   │   ├── OrderForm.jsx
│   │   │   │   ├── OrderList.jsx
│   │   │   │   └── StaffDashboard.jsx
│   │   │   ├── kitchen
│   │   │   │   ├── KitchenDisplay.jsx
│   │   │   │   └── OrderCard.jsx
│   │   │   ├── display
│   │   │   │   └── ReadyOrdersDisplay.jsx
│   │   │   ├── customer
│   │   │   │   ├── MenuList.jsx
│   │   │   │   ├── Cart.jsx
│   │   │   │   └── CustomerPortal.jsx
│   │   │   └── common
│   │   │       ├── Navbar.jsx
│   │   │       └── Notification.jsx
│   │   ├── context
│   │   │   └── SocketContext.jsx
│   │   ├── services
│   │   │   ├── api.js
│   │   │   └── socket.js
│   │   └── styles
│   │       └── App.css
│   ├── package.json
│   └── vite.config.js
├── server
│   ├── src
│   │   ├── server.js
│   │   ├── config
│   │   │   ├── db.js
│   │   │   └── socket.js
│   │   ├── models
│   │   │   ├── Order.js
│   │   │   ├── MenuItem.js
│   │   │   └── User.js
│   │   ├── routes
│   │   │   ├── orders.js
│   │   │   ├── menu.js
│   │   │   └── auth.js
│   │   ├── controllers
│   │   │   ├── orderController.js
│   │   │   ├── menuController.js
│   │   │   └── authController.js
│   │   ├── middleware
│   │   │   ├── auth.js
│   │   │   └── errorHandler.js
│   │   └── utils
│   │       └── validators.js
│   ├── package.json
│   └── .env.example
├── package.json
└── README.md
```


## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### 1. Clone the Repository
```bash
git clone <repository-url>
cd restaurant-order-management
```

### 2. Backend Setup

```bash
# Navigate to server folder
cd server

# Install dependencies
npm install

# Create .env file from example
copy .env.example .env

# Edit .env and update:
# - MONGODB_URI (your MongoDB connection string)
# - JWT_SECRET (generate a strong secret key)
```

**server/.env Configuration:**
```env
MONGODB_URI=mongodb://localhost:27017/restaurant-order-management
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

### 3. Frontend Setup

```bash
# Navigate to client folder (from root)
cd client

# Install dependencies
npm install

# Create .env file from example
copy .env.example .env
```

**client/.env Configuration:**
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### 4. Database Setup

Start MongoDB:
```bash
# If using local MongoDB
mongod

# If using MongoDB Atlas, ensure MONGODB_URI in server/.env points to your cluster
```

### 5. Create Initial Admin User

After starting the server, use Postman or curl to create an admin user:

```bash
# POST http://localhost:5000/api/auth/register
# Body (JSON):
{
  "username": "admin",
  "password": "admin123",
  "role": "owner"
}
```

### 6. Add Sample Menu Items

Use the Staff Dashboard or API to add menu items:

```bash
# POST http://localhost:5000/api/menu
# Headers: Authorization: Bearer <your-jwt-token>
# Body (JSON):
{
  "name": "Margherita Pizza",
  "price": 12.99,
  "description": "Classic pizza with tomato sauce and mozzarella",
  "category": "Pizza",
  "imageUrl": "https://example.com/pizza.jpg",
  "isAvailable": true
}
```

## Running the Application

### Start Backend Server
```bash
cd server
npm start
# Server runs on http://localhost:5000
```

### Start Frontend Development Server
```bash
cd client
npm run dev
# Client runs on http://localhost:5173
```

## Accessing the Application

### Login Dashboard
**URL:** `http://localhost:5173/login`

**Default Credentials (after creating admin):**
- Username: `admin`
- Password: `admin123`

### Staff Dashboard
**URL:** `http://localhost:5173/dashboard`
- View orders, create orders, manage settings
- Toggle customer ordering on/off
- Generate QR code for customer portal

### Kitchen Display
**URL:** `http://localhost:5173/kitchen`
- Real-time order processing
- Update order status (PENDING → STARTED → COMPLETED → READY)

### Customer Portal
**URL:** `http://localhost:5173/customer`
- Browse menu items
- Add items to cart
- Place orders (no login required)

### Ready Orders Display
**URL:** `http://localhost:5173/ready`
- TV-style display for ready orders
- Auto-refreshes every 10 seconds
- Shows order number and customer name

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user (owner/staff/kitchen)
- `POST /api/auth/login` - Login
- `GET /api/auth/profile` - Get user profile
- `POST /api/auth/verify` - Verify JWT token

### Orders
- `GET /api/orders` - Get all orders (with filtering)
- `POST /api/orders` - Create new order
- `GET /api/orders/ready` - Get ready orders
- `GET /api/orders/stats` - Get order statistics
- `PATCH /api/orders/:id/status` - Update order status
- `DELETE /api/orders/:id` - Delete order

### Menu
- `GET /api/menu` - Get all menu items
- `POST /api/menu` - Create menu item
- `GET /api/menu/categories` - Get menu categories
- `GET /api/menu/:id` - Get menu item by ID
- `PUT /api/menu/:id` - Update menu item
- `DELETE /api/menu/:id` - Delete menu item

### Settings
- `GET /api/settings/customer-ordering` - Check if customer ordering is enabled (public)
- `POST /api/settings/toggle-customer-ordering` - Toggle customer ordering (owner only)

## Socket Events

### Client → Server
- `connection` - Client connects
- `disconnect` - Client disconnects

### Server → Client
- `order:created` - New order created
- `order:status-updated` - Order status changed
- `order:ready` - Order marked as ready
- `order:deleted` - Order deleted
- `menu:item-added` - New menu item added
- `menu:item-updated` - Menu item updated
- `menu:item-deleted` - Menu item deleted
- `settings:customer-ordering-toggled` - Customer ordering setting changed

## Troubleshooting

### CORS Issues
Ensure `CLIENT_URL` in server/.env matches your frontend URL.

### Socket Connection Failed
- Check if backend server is running
- Verify `VITE_SOCKET_URL` in client/.env
- Check browser console for errors

### MongoDB Connection Error
- Ensure MongoDB is running
- Verify `MONGODB_URI` in server/.env
- Check MongoDB logs

### JWT Token Issues
- Clear browser localStorage
- Re-login to get new token
- Verify `JWT_SECRET` is set in server/.env

## Future Enhancements
- Payment gateway integration
- Order history and analytics
- Print order receipts
- Multi-language support
- Push notifications
- Customer feedback system

## License
MIT
- `order:created` - New order created
- `order:status-updated` - Order status changed
- `order:ready` - Order marked as ready
- `order:deleted` - Order deleted
- `menu:item-added` - New menu item added
- `menu:item-updated` - Menu item updated
- `menu:item-deleted` - Menu item deleted
- `settings:customer-ordering-toggled` - Customer ordering setting changed
   cd server
   npm install
   ```

3. Install client dependencies:
   ```
   cd client
   npm install
   ```

4. Set up environment variables:
   - Copy `.env.example` to `.env` in the server directory and fill in the required values.

5. Start the server:
   ```
   cd server
   npm start
   ```

6. Start the client:
   ```
   cd client
   npm run dev
   ```

## Usage

- Access the application in your browser at `http://localhost:3000`.
- Staff can log in and manage orders through the Staff Dashboard.
- Kitchen staff can view and update order statuses in real-time.
- Customers can browse the menu and place orders through the Customer Portal.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License

This project is licensed under the MIT License.