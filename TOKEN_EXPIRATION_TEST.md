# JWT Token Expiration Testing Guide (5 Minutes)

## ✅ Changes Implemented

### 1. **Backend Changes**
- **File**: `server/src/controllers/authController.js`
- **Change**: JWT token expiration set to **5 minutes** (from 24 hours)
- **Code**: `{ expiresIn: '5m' }`

### 2. **Frontend Changes**
- **File**: `client/src/services/api.js`
- **Enhanced axios interceptor to:**
  - Detect 401 (Unauthorized) errors
  - Show user-friendly alert: "Your session has expired. Please login again."
  - Clear localStorage (token & user data)
  - Redirect to login page (if authenticated user)
  - Handle customer portal gracefully (no redirect on customer pages)

- **File**: `client/src/App.jsx`
- **Added token verification on app load:**
  - Calls `/api/auth/verify` on mount
  - If token expired → auto-logout and clear storage
  - Prevents users from using expired tokens

---

## 🧪 How to Test Token Expiration

### **Test Scenario 1: Staff/Kitchen User**
1. **Login** as a staff or kitchen user at `http://localhost:5173/login`
   - Username: `staff1` / Password: `staff123`

2. **Wait for 5 minutes** (token expires)

3. **Perform any action** that requires authentication:
   - Try to create an order
   - Try to update order status
   - Try to access settings

4. **Expected Result:**
   - ✅ Alert appears: "Your session has expired. Please login again."
   - ✅ Redirected to `/login` page
   - ✅ Token and user data cleared from localStorage

---

### **Test Scenario 2: Refresh Page After 5 Minutes**
1. **Login** as any user

2. **Leave the tab open for 5 minutes** (don't close browser)

3. **Refresh the page** (F5)

4. **Expected Result:**
   - ✅ App verifies token on mount
   - ✅ Detects token expired
   - ✅ Auto-logout happens
   - ✅ Redirected to `/login` page
   - ✅ No alert (silent logout)

---

### **Test Scenario 3: Customer Portal**
1. **Open customer portal** at `http://localhost:5173/customer`

2. **Try to place an order** (no login required)

3. **Token expiration does NOT affect customers** (they don't use tokens)

---

### **Test Scenario 4: Multiple Tabs**
1. **Login** in Tab 1

2. **Open Tab 2** with same user session

3. **Wait 5 minutes** in both tabs

4. **Perform action in Tab 1:**
   - ✅ Gets logged out with alert

5. **Switch to Tab 2 and perform action:**
   - ✅ Also gets logged out (token invalid)

---

## 🔍 What Happens Behind the Scenes

### **When Token Expires:**

```
┌─────────────────────────────────────────────────────┐
│  User performs action (e.g., create order)          │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│  Frontend: axios sends request with token           │
│  Header: Authorization: Bearer <expired-token>      │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│  Backend: auth.js middleware verifies token         │
│  jwt.verify() detects TokenExpiredError             │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│  Backend: Returns 401 Unauthorized                  │
│  { success: false, message: "Token expired." }     │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│  Frontend: axios interceptor catches 401            │
│  1. Shows alert to user                             │
│  2. Clears localStorage                             │
│  3. Redirects to /login                             │
└─────────────────────────────────────────────────────┘
```

---

## 🛠️ Technical Details

### **Backend Error Handling** (`server/src/middleware/auth.js`)
```javascript
if (error.name === 'TokenExpiredError') {
    return res.status(401).json({ 
        success: false,
        message: 'Token expired.' 
    });
}
```

### **Frontend Interceptor** (`client/src/services/api.js`)
```javascript
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Clear authentication
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            
            // Alert user
            alert('Your session has expired. Please login again.');
            
            // Redirect to login
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);
```

### **App Mount Verification** (`client/src/App.jsx`)
```javascript
useEffect(() => {
    const verifyUserToken = async () => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                await authAPI.verifyToken(); // Checks if valid
                setUser(JSON.parse(storedUser));
            } catch (error) {
                // Token expired - silent logout
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                setUser(null);
            }
        }
    };
    verifyUserToken();
}, []);
```

---

## 📊 Expected User Experience

| Action | With Valid Token | With Expired Token (5+ min) |
|--------|------------------|----------------------------|
| Create Order | ✅ Success | ❌ Alert → Redirect to Login |
| Update Status | ✅ Success | ❌ Alert → Redirect to Login |
| View Dashboard | ✅ Success | ❌ Alert → Redirect to Login |
| Refresh Page | ✅ Stays logged in | ❌ Auto-logout → Login |
| Customer Portal | ✅ Always works | ✅ Always works (no auth) |

---

## 🔄 To Change Token Expiration Back

**For Production (24 hours):**
```javascript
// In server/src/controllers/authController.js
{ expiresIn: '24h' }
```

**For Testing (5 minutes):**
```javascript
// In server/src/controllers/authController.js
{ expiresIn: '5m' }
```

**Other Options:**
- `30s` = 30 seconds
- `1m` = 1 minute
- `1h` = 1 hour
- `7d` = 7 days

---

## ✅ Testing Checklist

- [ ] Login as staff user
- [ ] Wait 5 minutes
- [ ] Try to create order → Should logout with alert
- [ ] Login again
- [ ] Wait 5 minutes
- [ ] Refresh page → Should auto-logout silently
- [ ] Login as kitchen user
- [ ] Wait 5 minutes
- [ ] Try to update order → Should logout with alert
- [ ] Customer portal should work normally (no auth required)

---

## 🎯 Summary

The application now has **automatic token expiration handling**:
1. ✅ Tokens expire after **5 minutes**
2. ✅ Users get **friendly alert** when token expires
3. ✅ Automatic **logout and redirect** to login
4. ✅ **Silent logout** on page refresh with expired token
5. ✅ **Customer portal unaffected** (no authentication)
6. ✅ **All API calls protected** with interceptor

This ensures security and provides a smooth user experience! 🚀
