# Debug: Staff Delete Order Issue

## Issue
Staff users getting "Access forbidden. Insufficient permissions" when trying to delete orders.

## Code Verification ✅

### 1. Routes Configuration (orders.js) - CORRECT
```javascript
router.delete('/:id', authMiddleware(['owner', 'staff']), orderController.deleteOrder);
```
- Staff is explicitly allowed in the route

### 2. Auth Middleware (auth.js) - CORRECT
```javascript
if (roles.length && !roles.includes(user.role)) {
    return res.status(403).json({ 
        success: false,
        message: 'Access forbidden. Insufficient permissions.' 
    });
}
```
- Added debug logging to track authorization

### 3. Login JWT Token (authController.js) - CORRECT
```javascript
const token = jwt.sign(
    { 
        id: user._id, 
        role: user.role,
        username: user.username 
    }, 
    process.env.JWT_SECRET || 'your-secret-key', 
    { expiresIn: '24h' }
);
```
- Role is included in JWT token

### 4. Delete Controller (orderController.js) - CORRECT
```javascript
exports.deleteOrder = async (req, res) => {
    // ... deletes order and emits socket event
    req.app.get('io').emit('order:deleted', { orderId: id });
}
```
- Properly emits socket event for all connected clients

## Testing Steps

1. **Start Server with Debug Logs**
   ```bash
   cd server
   npm start
   ```

2. **Login as Staff**
   - Username: staff1
   - Password: staff123
   - Check console for: "✅ Authorization success"

3. **Try to Delete Order**
   - Watch server logs for:
     - Authorization check
     - User role
     - Required roles

4. **Expected Output**
   ```
   ✅ Authorization success:
      User: staff1
      Role: staff
      Required roles: ['owner', 'staff']
   ```

## Possible Causes if Still Failing

1. **Token Not Sent**: Check browser dev tools → Network → Delete request → Headers
   - Should have: `Authorization: Bearer <token>`

2. **Expired Token**: Token expires after 24h
   - Solution: Re-login to get fresh token

3. **Wrong User Role in DB**: Staff user might have wrong role
   - Check MongoDB: `db.users.findOne({username: 'staff1'})`
   - Role should be: `'staff'` (not 'Staff' or other variation)

4. **Token Mismatch**: Old token in localStorage
   - Solution: Logout and login again

## Quick Fix Commands

```javascript
// In MongoDB shell or Compass
db.users.updateOne(
  { username: 'staff1' },
  { $set: { role: 'staff' } }
)
```

## Client-Side Verification

Check localStorage token:
```javascript
// In browser console
const token = localStorage.getItem('token');
const decoded = JSON.parse(atob(token.split('.')[1]));
console.log('Token role:', decoded.role);
```

## Resolution

Once server starts, the debug logs will show exactly which role the user has and which roles are required. This will pinpoint the exact issue.
