const axios = require('axios');

const API_URL = 'http://localhost:5000/api';
let authToken = '';

// Sample menu item IDs (you'll need to get these from your database)
// Run this query in MongoDB: db.menuitems.find({}, {_id: 1, name: 1})
let menuItemIds = [];

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

// Fetch menu items
async function fetchMenuItems() {
    try {
        const response = await axios.get(`${API_URL}/menu`);
        menuItemIds = response.data.data.map(item => item._id);
        console.log(`✅ Fetched ${menuItemIds.length} menu items`);
        return menuItemIds.length > 0;
    } catch (error) {
        console.error('❌ Failed to fetch menu items:', error.message);
        return false;
    }
}

// Get random menu items for order
function getRandomItems() {
    const numItems = Math.ceil(Math.random() * 3) + 1; // 2-4 items
    const items = [];
    
    for (let i = 0; i < numItems; i++) {
        const randomItem = menuItemIds[Math.floor(Math.random() * menuItemIds.length)];
        const quantity = Math.ceil(Math.random() * 3); // 1-3 quantity
        items.push({ menuItem: randomItem, quantity });
    }
    
    return items;
}

// Create a single order
async function createOrder(orderNumber) {
    try {
        const response = await axios.post(
            `${API_URL}/orders`,
            {
                customerName: `LoadTest-${orderNumber}`,
                items: getRandomItems(),
                notes: `Load test order #${orderNumber} - ${new Date().toLocaleTimeString()}`
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

// Update order status (simulate kitchen activity)
async function updateOrderStatus(orderId, status) {
    try {
        await axios.patch(
            `${API_URL}/orders/${orderId}/status`,
            { status },
            {
                headers: { Authorization: `Bearer ${authToken}` }
            }
        );
        return true;
    } catch (error) {
        return false;
    }
}

// Run load test
async function runLoadTest(numberOfOrders = 20, batchSize = 5, simulateKitchen = false) {
    console.log('\n' + '='.repeat(70));
    console.log('🔥 RESTAURANT ORDER SYSTEM - LOAD TEST');
    console.log('='.repeat(70));
    console.log(`📋 Test Configuration:`);
    console.log(`   - Total Orders: ${numberOfOrders}`);
    console.log(`   - Batch Size: ${batchSize} (simultaneous)`);
    console.log(`   - Kitchen Simulation: ${simulateKitchen ? 'YES' : 'NO'}`);
    console.log('='.repeat(70) + '\n');
    
    const loggedIn = await login();
    if (!loggedIn) return;

    const hasMenuItems = await fetchMenuItems();
    if (!hasMenuItems) {
        console.error('\n❌ No menu items found. Please run seed script first: npm run seed');
        return;
    }

    const startTime = Date.now();
    let successCount = 0;
    let failCount = 0;
    const createdOrders = [];

    // Create orders in batches
    for (let i = 0; i < numberOfOrders; i += batchSize) {
        const batch = [];
        const currentBatch = Math.min(batchSize, numberOfOrders - i);
        
        console.log(`\n📦 Batch ${Math.floor(i / batchSize) + 1}: Creating ${currentBatch} orders simultaneously...`);
        
        for (let j = 0; j < currentBatch; j++) {
            batch.push(createOrder(i + j + 1));
        }

        const results = await Promise.all(batch);
        const successful = results.filter(r => r !== null);
        successCount += successful.length;
        failCount += results.filter(r => r === null).length;
        
        createdOrders.push(...successful.map(o => o._id));

        // Small delay between batches
        if (i + batchSize < numberOfOrders) {
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    }

    const creationTime = Date.now();
    const creationDuration = ((creationTime - startTime) / 1000).toFixed(2);

    // Simulate kitchen activity if requested
    if (simulateKitchen && createdOrders.length > 0) {
        console.log(`\n\n👨‍🍳 Simulating Kitchen Activity...`);
        
        for (const orderId of createdOrders) {
            // Random delay to simulate real kitchen timing
            await new Promise(resolve => setTimeout(resolve, Math.random() * 500));
            
            // PENDING -> STARTED
            await updateOrderStatus(orderId, 'STARTED');
            console.log(`   🔥 Order started: ${orderId}`);
            
            await new Promise(resolve => setTimeout(resolve, Math.random() * 1000));
            
            // STARTED -> COMPLETED
            await updateOrderStatus(orderId, 'COMPLETED');
            console.log(`   ✅ Order completed: ${orderId}`);
            
            // Some orders go to READY
            if (Math.random() > 0.3) {
                await new Promise(resolve => setTimeout(resolve, Math.random() * 500));
                await updateOrderStatus(orderId, 'READY');
                console.log(`   🎉 Order ready: ${orderId}`);
            }
        }
    }

    const endTime = Date.now();
    const totalDuration = ((endTime - startTime) / 1000).toFixed(2);

    // Final Results
    console.log('\n\n' + '='.repeat(70));
    console.log('📊 LOAD TEST RESULTS');
    console.log('='.repeat(70));
    console.log(`\n📈 Order Creation:`);
    console.log(`   Total Attempted: ${numberOfOrders}`);
    console.log(`   ✅ Successful: ${successCount} (${((successCount/numberOfOrders)*100).toFixed(1)}%)`);
    console.log(`   ❌ Failed: ${failCount} (${((failCount/numberOfOrders)*100).toFixed(1)}%)`);
    console.log(`   ⏱️  Creation Time: ${creationDuration}s`);
    console.log(`   ⚡ Throughput: ${(successCount / parseFloat(creationDuration)).toFixed(2)} orders/second`);
    
    if (simulateKitchen) {
        console.log(`\n👨‍🍳 Kitchen Simulation:`);
        console.log(`   ⏱️  Total Time: ${totalDuration}s`);
        console.log(`   📋 Orders Processed: ${createdOrders.length}`);
    }
    
    console.log('\n' + '='.repeat(70));
    
    // Performance Assessment
    const ordersPerSecond = successCount / parseFloat(creationDuration);
    console.log('\n🎯 Performance Assessment:');
    
    if (failCount === 0 && ordersPerSecond > 10) {
        console.log('   ✅ EXCELLENT - System handling load efficiently');
    } else if (failCount === 0 && ordersPerSecond > 5) {
        console.log('   ✅ GOOD - System performing well');
    } else if (failCount < numberOfOrders * 0.05) {
        console.log('   ⚠️  ACCEPTABLE - Minor issues, consider optimization');
    } else {
        console.log('   ❌ NEEDS WORK - System struggling under load');
    }
    
    console.log('\n💡 Recommendations:');
    if (ordersPerSecond < 5) {
        console.log('   - Consider database indexing optimization');
        console.log('   - Check server CPU/memory usage');
        console.log('   - Review Socket.io configuration');
    }
    if (failCount > 0) {
        console.log('   - Check server logs for errors');
        console.log('   - Verify database connection pool size');
        console.log('   - Review API rate limiting settings');
    }
    
    console.log('\n📱 Next Steps:');
    console.log('   1. Open http://localhost:5173/ready to see real-time board');
    console.log('   2. Open http://localhost:5173/kitchen to see kitchen view');
    console.log('   3. Open http://localhost:5173/dashboard to see all orders');
    console.log('   4. Check if all screens updated in real-time');
    console.log('\n' + '='.repeat(70) + '\n');
}

// Parse command line arguments
const args = process.argv.slice(2);
const totalOrders = parseInt(args[0]) || 20;
const batchSize = parseInt(args[1]) || 5;
const simulateKitchen = args[2] === 'true' || args[2] === 'kitchen';

// Show usage if help requested
if (args[0] === '--help' || args[0] === '-h') {
    console.log('\n📖 Load Test Usage:');
    console.log('   node test-load.js [orders] [batchSize] [kitchen]\n');
    console.log('Examples:');
    console.log('   node test-load.js                    # 20 orders, batch 5');
    console.log('   node test-load.js 50 10              # 50 orders, batch 10');
    console.log('   node test-load.js 30 5 true          # 30 orders with kitchen simulation');
    console.log('   node test-load.js 100 20 kitchen     # 100 orders with kitchen flow\n');
    process.exit(0);
}

// Run the test
runLoadTest(totalOrders, batchSize, simulateKitchen);
