# Load Testing & Mobile Responsiveness Guide

## 🚀 Load Testing with Multiple Simultaneous Orders

### Quick Load Test Script

Create a test file to simulate multiple simultaneous orders:

**File: `server/test-load.js`**

```javascript
const axios = require('axios');

const API_URL = 'http://localhost:5000/api';
let authToken = '';

// Login first
async function login() {
    try {
        const response = await axios.post(`${API_URL}/auth/login`, {
            username: 'admin',
            password: 'admin123'
        });
        authToken = response.data.token;
        console.log('✅ Logged in successfully');
        return true;
    } catch (error) {
        console.error('❌ Login failed:', error.message);
        return false;
    }
}

// Create a single order
async function createOrder(orderNumber) {
    try {
        const response = await axios.post(
            `${API_URL}/orders`,
            {
                customerName: `Customer ${orderNumber}`,
                items: [
                    { menuItem: '6756f1234567890abcdef001', quantity: Math.ceil(Math.random() * 3) },
                    { menuItem: '6756f1234567890abcdef002', quantity: Math.ceil(Math.random() * 2) }
                ],
                notes: `Load test order ${orderNumber}`
            },
            {
                headers: { Authorization: `Bearer ${authToken}` }
            }
        );
        console.log(`✅ Order ${orderNumber} created: ${response.data.data.orderId}`);
        return response.data.data;
    } catch (error) {
        console.error(`❌ Order ${orderNumber} failed:`, error.response?.data?.message || error.message);
        return null;
    }
}

// Run load test
async function runLoadTest(numberOfOrders = 20, batchSize = 5) {
    console.log(`\n🔥 Starting Load Test: ${numberOfOrders} orders in batches of ${batchSize}\n`);
    
    const loggedIn = await login();
    if (!loggedIn) return;

    const startTime = Date.now();
    let successCount = 0;
    let failCount = 0;

    // Create orders in batches
    for (let i = 0; i < numberOfOrders; i += batchSize) {
        const batch = [];
        const currentBatch = Math.min(batchSize, numberOfOrders - i);
        
        console.log(`\n📦 Batch ${Math.floor(i / batchSize) + 1}: Creating ${currentBatch} orders simultaneously...`);
        
        for (let j = 0; j < currentBatch; j++) {
            batch.push(createOrder(i + j + 1));
        }

        const results = await Promise.all(batch);
        successCount += results.filter(r => r !== null).length;
        failCount += results.filter(r => r === null).length;

        // Small delay between batches to simulate real-world scenario
        if (i + batchSize < numberOfOrders) {
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    console.log('\n' + '='.repeat(60));
    console.log('📊 LOAD TEST RESULTS');
    console.log('='.repeat(60));
    console.log(`Total Orders Attempted: ${numberOfOrders}`);
    console.log(`✅ Successful: ${successCount}`);
    console.log(`❌ Failed: ${failCount}`);
    console.log(`⏱️ Total Time: ${duration} seconds`);
    console.log(`⚡ Average: ${(numberOfOrders / duration).toFixed(2)} orders/second`);
    console.log('='.repeat(60) + '\n');
}

// Run with command line arguments
const totalOrders = parseInt(process.argv[2]) || 20;
const batchSize = parseInt(process.argv[3]) || 5;

runLoadTest(totalOrders, batchSize);
```

### How to Run Load Test

```bash
# Navigate to server directory
cd server

# Install axios if not present
npm install axios --save-dev

# Run load test (20 orders in batches of 5)
node test-load.js 20 5

# Heavy load test (50 orders in batches of 10)
node test-load.js 50 10

# Stress test (100 orders in batches of 20)
node test-load.js 100 20
```

### What to Monitor During Load Test

1. **Browser Performance:**
   - Open `/ready` in one tab
   - Open `/kitchen` in another tab
   - Open `/dashboard` in a third tab
   - Watch all screens update in real-time

2. **Server Console:**
   - Monitor for errors or warnings
   - Check Socket.io connection messages
   - Watch database query times

3. **Network Tab (Dev Tools):**
   - Monitor WebSocket frames
   - Check API response times
   - Look for failed requests

4. **Database:**
   - Check MongoDB for all orders created
   - Verify auto-generated orderIds are sequential
   - Ensure no duplicate orderIds

### Expected Results

✅ **Good Performance:**
- All orders created successfully
- Real-time updates on all screens within 1-2 seconds
- No Socket.io disconnections
- Server response time < 500ms per order

⚠️ **Needs Optimization if:**
- Orders fail to create (> 5% failure rate)
- Updates delayed > 3 seconds
- Socket connections drop
- Server response time > 1000ms

---

## 📱 Mobile Responsiveness Testing

### Current Mobile Support Status

**✅ Already Responsive:**
- Customer Portal (`CustomerPortal.css`)
- Public Status Board (`PublicStatusBoard.css`)
- Ready Orders Display (partial)

**⚠️ Needs Improvement:**
- Ready Orders Display (3-column layout doesn't adapt well)
- Staff Dashboard (desktop-focused)
- Kitchen Display (designed for large screens)

### Test on Real Devices

1. **Get your local IP:**
   ```bash
   # Windows PowerShell
   ipconfig
   # Look for IPv4 Address (e.g., 192.168.1.100)
   ```

2. **Update client/.env:**
   ```env
   VITE_API_URL=http://YOUR_IP:5000/api
   VITE_SOCKET_URL=http://YOUR_IP:5000
   ```

3. **Update server/.env:**
   ```env
   CLIENT_URL=http://YOUR_IP:5173
   ```

4. **Access from mobile:**
   - Visit `http://YOUR_IP:5173/customer` on phone
   - Visit `http://YOUR_IP:5173/ready` on tablet

### Mobile Testing Checklist

**iPhone/Android (Portrait):**
- [ ] Customer portal menu loads and scrolls
- [ ] Add to cart buttons are tappable (min 44x44px)
- [ ] Cart modal shows correctly
- [ ] Order placement works
- [ ] Order tracking page displays properly
- [ ] Text is readable without zooming

**Tablet (Landscape):**
- [ ] `/ready` board shows all 3 columns
- [ ] Order cards are readable
- [ ] Real-time updates work
- [ ] No horizontal scrolling

**Small Screens (< 375px):**
- [ ] No content cutoff
- [ ] Buttons don't overlap
- [ ] Forms are usable

### Known Mobile Issues to Fix

1. **Ready Orders Display - 3 Column Grid**
   - Currently: Always 3 columns (too narrow on mobile)
   - Fix needed: Stack vertically on small screens

2. **Kitchen Display - Action Buttons**
   - Currently: Desktop-sized buttons
   - Fix needed: Larger touch targets for tablets

3. **Staff Dashboard - Stats Grid**
   - Currently: 4 columns may overflow
   - Fix needed: Responsive grid (2x2 on mobile)

---

## 🔧 Recommended Mobile Improvements

### Priority 1: Fix Ready Orders Display Mobile

The 3-column layout needs to stack on mobile. Currently missing proper breakpoints.

### Priority 2: Touch Target Sizes

All interactive elements should be minimum 44x44px for touch:
- Buttons in KitchenDisplay
- Menu item cards in CustomerPortal
- Cart icons and action buttons

### Priority 3: Viewport Meta Tag

Ensure `client/index.html` has:
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
```

### Priority 4: Test Real-time on Mobile Data

- Test Socket.io reconnection on poor network
- Test order updates with intermittent connectivity
- Add offline detection and retry logic

---

## 📈 Performance Optimization Tips

### For Load Testing:

1. **Database Indexing:**
   - Already indexed: `orderId`, `status`, `createdAt`
   - Consider: Compound index on `status + createdAt`

2. **Socket.io Optimization:**
   - Consider: Room-based emissions (emit to specific rooms)
   - Current: Broadcasts to all clients (fine for < 100 users)

3. **API Pagination:**
   - Current: Fetches all active orders
   - Consider: Paginate if > 100 active orders

### For Mobile:

1. **Image Optimization:**
   - Use WebP format for menu images
   - Lazy load images below fold

2. **Bundle Size:**
   - Currently: Full React bundle
   - Consider: Code splitting by route

3. **PWA Features:**
   - Add service worker for offline support
   - Add app manifest for "Add to Home Screen"

---

## 🎯 Quick Test Commands

```bash
# Start servers
cd server ; npm start
cd client ; npm run dev

# Run load test
cd server ; node test-load.js 30 5

# Check mobile viewport
# Visit on phone: http://YOUR_IP:5173/customer
```

---

## ✅ Test Results Template

**Date:** _____________  
**Test Type:** [ ] Load Testing [ ] Mobile  

**Load Test Results:**
- Orders Tested: _____
- Success Rate: _____%
- Average Time: _____s
- Issues Found: _________________

**Mobile Test Results:**
- Device: _____________
- Screen Size: _____________
- Issues Found: _________________

**Overall Status:** [ ] Pass [ ] Needs Work
