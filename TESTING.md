# Testing Guide - Restaurant Order Management System

## 🧪 Complete Testing Workflow

### Prerequisites
✅ MongoDB running
✅ Backend server running (port 5000)
✅ Frontend dev server running (port 5173)

---

## 🌱 Step 1: Seed Database (Optional but Recommended)

This will create sample users and menu items for testing:

```powershell
cd "D:\Mern projects\sandeep_app2\restaurant-order-management\server"
node src/seed.js
```

**Created Accounts:**
- **Owner**: `admin` / `admin123`
- **Staff**: `staff1` / `staff123`
- **Kitchen**: `kitchen1` / `kitchen123`

**Created Menu Items:**
- 2 Pizzas (Margherita, Pepperoni)
- 2 Burgers (Chicken, Beef)
- 2 Salads (Caesar, Greek)
- 2 Beverages (Coca Cola, Orange Juice)
- 2 Desserts (Chocolate Cake, Cheesecake)
- 2 Pasta (Spaghetti Carbonara, Penne Arrabiata)

---

## 🔑 Step 2: Manual User Creation (If not using seed)

Create owner account via PowerShell:

```powershell
$body = @{
    username = "admin"
    password = "admin123"
    role = "owner"
} | ConvertTo-Json

Invoke-RestMethod -Method Post -Uri "http://localhost:5000/api/auth/register" -Body $body -ContentType "application/json"
```

---

## 📱 Step 3: Test Each Dashboard

### A. Login & Authentication
1. Open: http://localhost:5173/login
2. Login with: `admin` / `admin123`
3. Should redirect to dashboard

### B. Staff Dashboard Testing
**URL:** http://localhost:5173/dashboard

**Test Create Order Tab:**
1. Click on menu items to add to cart
2. Adjust quantities using +/- buttons
3. Enter customer name
4. Click "Create Order"
5. ✅ Check: Order appears in "View Orders" tab
6. ✅ Check: Kitchen display updates in real-time

**Test View Orders Tab:**
1. See all orders with status badges
2. Click delete button to remove order
3. ✅ Check: Order disappears from list
4. ✅ Check: Kitchen display updates

**Test Settings Tab:**
1. Toggle "Customer Ordering" switch
2. ✅ Check: Customer portal becomes accessible/disabled
3. Copy customer portal URL
4. Generate QR code (shows on screen)

### C. Kitchen Display Testing
**URL:** http://localhost:5173/kitchen

**Test Order Processing:**
1. Wait for orders to appear (or create one from staff dashboard)
2. Click "Start Cooking" on PENDING order
3. ✅ Check: Status changes to STARTED (blue)
4. Click "Mark Completed" 
5. ✅ Check: Status changes to COMPLETED (green)
6. Click "Mark Ready"
7. ✅ Check: Status changes to READY (light green)
8. ✅ Check: Order appears on Ready Orders Display

**Test Filters:**
1. Click "Active Orders" - shows only non-ready orders
2. Click "All Orders" - shows all orders

### D. Customer Portal Testing
**URL:** http://localhost:5173/customer

**Test Menu Browsing:**
1. Click category buttons (All, Pizza, Burgers, etc.)
2. ✅ Check: Menu filters correctly

**Test Cart Functionality:**
1. Click "Add to Cart" on multiple items
2. Click "View Cart" button
3. Adjust quantities with +/- buttons
4. Click 🗑️ to remove items
5. ✅ Check: Total price updates

**Test Order Placement:**
1. Enter your name in cart
2. Click "Place Order"
3. ✅ Check: Success notification appears
4. ✅ Check: Order appears in Kitchen Display
5. ✅ Check: Cart clears after order

**Test Ordering Disabled:**
1. Login as admin, go to settings, disable customer ordering
2. Refresh customer portal
3. ✅ Check: Shows "Ordering Currently Unavailable" message

### E. Ready Orders Display Testing
**URL:** http://localhost:5173/ready

**Test Display:**
1. Process an order to READY status in kitchen
2. ✅ Check: Order appears on display with animation
3. ✅ Check: Shows order number (e.g., ORD-00001)
4. ✅ Check: Shows customer name
5. Wait 10 seconds
6. ✅ Check: Display auto-refreshes

---

## 🔄 Real-Time Testing

Open multiple browser windows/tabs:

**Window 1:** Staff Dashboard (Create Order tab)
**Window 2:** Kitchen Display
**Window 3:** Ready Orders Display
**Window 4:** Customer Portal

### Test Flow:
1. **Window 4 (Customer)**: Place an order
2. **Window 2 (Kitchen)**: ✅ Order appears instantly
3. **Window 1 (Staff)**: ✅ Order appears in View Orders tab
4. **Window 2 (Kitchen)**: Start Cooking → Complete → Mark Ready
5. **Window 3 (Display)**: ✅ Order appears with animation
6. **Window 1 (Staff)**: ✅ Order status updates in real-time

---

## 🧪 API Testing with PowerShell

### Test Login
```powershell
$body = @{
    username = "admin"
    password = "admin123"
} | ConvertTo-Json

$response = Invoke-RestMethod -Method Post -Uri "http://localhost:5000/api/auth/login" -Body $body -ContentType "application/json"
$token = $response.token
Write-Host "Token: $token"
```

### Test Get Orders (Authenticated)
```powershell
$headers = @{
    Authorization = "Bearer $token"
}

Invoke-RestMethod -Method Get -Uri "http://localhost:5000/api/auth/profile" -Headers $headers
```

### Test Create Menu Item
```powershell
$headers = @{
    Authorization = "Bearer $token"
}

$body = @{
    name = "Test Pizza"
    price = 15.99
    description = "Test description"
    category = "Pizza"
    isAvailable = $true
} | ConvertTo-Json

Invoke-RestMethod -Method Post -Uri "http://localhost:5000/api/menu" -Headers $headers -Body $body -ContentType "application/json"
```

### Test Create Order
```powershell
$headers = @{
    Authorization = "Bearer $token"
}

$body = @{
    customerName = "Test Customer"
    items = @(
        @{
            menuItem = "<menu-item-id>"
            quantity = 2
        }
    )
} | ConvertTo-Json -Depth 10

Invoke-RestMethod -Method Post -Uri "http://localhost:5000/api/orders" -Headers $headers -Body $body -ContentType "application/json"
```

---

## ✅ Checklist: All Features Working

### Authentication & Authorization
- [ ] Owner can login
- [ ] Staff can login
- [ ] Kitchen can login
- [ ] Invalid credentials rejected
- [ ] JWT token stored in localStorage
- [ ] Protected routes redirect to login
- [ ] Role-based access enforced

### Staff Dashboard
- [ ] Can view all orders
- [ ] Can create new orders
- [ ] Can delete orders
- [ ] Order stats display correctly
- [ ] Can toggle customer ordering
- [ ] Settings persist across page refresh

### Kitchen Display
- [ ] Orders appear in real-time
- [ ] Can update order status
- [ ] Status progression works (PENDING → STARTED → COMPLETED → READY)
- [ ] Filters work (Active/All orders)
- [ ] Time display shows correct elapsed time

### Customer Portal
- [ ] Menu items display correctly
- [ ] Category filtering works
- [ ] Add to cart functionality
- [ ] Cart quantity controls work
- [ ] Order placement succeeds
- [ ] Respects customer ordering setting
- [ ] No authentication required

### Ready Orders Display
- [ ] Shows READY orders only
- [ ] Auto-refreshes every 10 seconds
- [ ] New orders animate in
- [ ] Shows order ID and customer name
- [ ] Clock displays current time

### Real-Time Updates
- [ ] New orders appear instantly in Kitchen
- [ ] Status updates reflect everywhere
- [ ] Menu changes propagate
- [ ] Settings changes propagate
- [ ] Multiple clients stay synchronized

---

## 🐛 Common Issues & Solutions

### Orders not appearing in Kitchen
- Check Socket.io connection in browser console
- Verify backend Socket.io is running
- Check CORS settings in server/.env

### Real-time updates not working
- Ensure Socket.io client connects on page load
- Check browser console for connection errors
- Verify VITE_SOCKET_URL in client/.env

### Cannot create orders
- Check if menu items exist
- Verify JWT token is valid
- Check browser console for errors

### Customer portal always shows disabled
- Check Settings collection in MongoDB
- Verify customerOrderingEnabled is true
- Toggle setting in Staff Dashboard

---

## 📊 Performance Testing

### Load Testing Orders
Create multiple orders quickly to test:
- Real-time synchronization
- Kitchen display performance
- Database indexing

### Socket.io Stress Test
Open 10+ tabs with Kitchen Display to test:
- Connection handling
- Event broadcasting
- Memory usage

---

## 🎯 Success Criteria

✅ All user roles can login and access appropriate dashboards
✅ Orders created by staff appear in kitchen instantly
✅ Orders created by customers appear in kitchen instantly
✅ Kitchen can process orders through all status stages
✅ Ready orders appear on display automatically
✅ All real-time updates work without page refresh
✅ Customer ordering can be toggled on/off
✅ No errors in browser console or server logs
✅ Application is responsive on mobile devices

---

**Happy Testing! 🚀**
