# Quick Start Guide - Restaurant Order Management System

## ✅ Installation Complete!

All dependencies have been installed successfully.

## 🚀 Next Steps

### 1. Start MongoDB
Make sure MongoDB is running on your system:
```powershell
# If you have MongoDB installed locally
mongod

# Or if using MongoDB Atlas, update server/.env with your connection string
```

### 2. Start Backend Server
```powershell
cd "D:\Mern projects\sandeep_app2\restaurant-order-management\server"
npm start
```
✅ Server will run on: http://localhost:5000

### 3. Start Frontend (in a new terminal)
```powershell
cd "D:\Mern projects\sandeep_app2\restaurant-order-management\client"
npm run dev
```
✅ Client will run on: http://localhost:5173

## 🔑 Create First Admin User

After backend is running, use one of these methods:

### Method 1: Using Postman/Thunder Client
```
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123",
  "role": "owner"
}
```

### Method 2: Using PowerShell
```powershell
$body = @{
    username = "admin"
    password = "admin123"
    role = "owner"
} | ConvertTo-Json

Invoke-RestMethod -Method Post -Uri "http://localhost:5000/api/auth/register" -Body $body -ContentType "application/json"
```

## 📱 Access the Application

1. **Login**: http://localhost:5173/login
   - Username: `admin`
   - Password: `admin123`

2. **Staff Dashboard**: http://localhost:5173/dashboard
   - Create orders
   - View all orders
   - Manage settings
   - Toggle customer ordering

3. **Kitchen Display**: http://localhost:5173/kitchen
   - View incoming orders
   - Update order status
   - Real-time updates

4. **Customer Portal**: http://localhost:5173/customer
   - Browse menu
   - Add items to cart
   - Place orders (no login required)

5. **Ready Orders Display**: http://localhost:5173/ready
   - TV display for ready orders
   - Auto-refreshes

## 📋 Add Menu Items

### Via API (After Login):
```
POST http://localhost:5000/api/menu
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "name": "Margherita Pizza",
  "price": 12.99,
  "description": "Classic pizza with tomato sauce and mozzarella",
  "category": "Pizza",
  "imageUrl": "https://example.com/pizza.jpg",
  "isAvailable": true
}
```

### Via Staff Dashboard:
Currently, you need to use the API to add menu items. A menu management UI can be added as an enhancement.

## 🎯 Testing the Complete Flow

1. **Login** as admin (owner role)
2. **Add menu items** via API
3. **Toggle customer ordering ON** in Settings tab
4. **Open Customer Portal** in new browser tab/window
5. **Place an order** as customer
6. **Open Kitchen Display** in another tab
7. **Process the order**: PENDING → STARTED → COMPLETED → READY
8. **Open Ready Orders Display** to see completed orders

## 🔧 Troubleshooting

### Backend won't start:
- Check if MongoDB is running
- Verify `.env` file exists in server folder
- Check if port 5000 is available

### Frontend won't start:
- Verify `.env` file exists in client folder
- Check if port 5173 is available

### Socket connection issues:
- Ensure backend is running first
- Check browser console for errors
- Verify CORS settings in server/.env

### Can't login:
- Ensure admin user was created successfully
- Check MongoDB connection
- Clear browser localStorage and try again

## 📦 Project Structure Overview

```
restaurant-order-management/
├── server/               # Backend
│   ├── src/
│   │   ├── config/      # DB & Socket config
│   │   ├── controllers/ # Business logic
│   │   ├── models/      # MongoDB schemas
│   │   ├── routes/      # API endpoints
│   │   ├── middleware/  # Auth & error handling
│   │   └── server.js    # Entry point
│   ├── .env             # Environment variables
│   └── package.json
│
└── client/              # Frontend
    ├── src/
    │   ├── components/  # React components
    │   ├── services/    # API & Socket
    │   ├── context/     # React context
    │   ├── styles/      # CSS files
    │   └── App.jsx      # Main app
    ├── .env             # Environment variables
    └── package.json
```

## 🎨 Features Implemented

✅ Real-time order updates (Socket.io)
✅ Staff dashboard with order management
✅ Kitchen display for order processing
✅ Customer self-ordering portal
✅ Ready orders TV display
✅ Role-based authentication (owner/staff/kitchen)
✅ Order status workflow
✅ Settings management
✅ Responsive design
✅ Professional UI/UX

## 🔮 Future Enhancements

- Payment gateway integration
- Menu management UI in staff dashboard
- Order history and analytics
- Print receipts
- Push notifications
- Multi-language support
- Customer feedback system

## 📞 Need Help?

Check the main README.md for detailed documentation including:
- Complete API reference
- Socket event documentation
- Development tips
- Architecture details

---

**Enjoy your Restaurant Order Management System! 🎉**
