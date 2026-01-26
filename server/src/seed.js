// Seed script to populate initial data
// Run: node src/seed.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const MenuItem = require('./models/MenuItem');
const Settings = require('./models/Settings');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const seedUsers = async () => {
  const users = [
    {
      username: 'admin',
      password: 'admin123',
      role: 'owner'
    },
    {
      username: 'staff1',
      password: 'staff123',
      role: 'staff'
    },
    {
      username: 'kitchen1',
      password: 'kitchen123',
      role: 'kitchen'
    }
  ];

  for (const userData of users) {
    const existingUser = await User.findOne({ username: userData.username });
    if (!existingUser) {
      const user = new User(userData);
      await user.save();
      console.log(`✅ Created user: ${userData.username}`);
    } else {
      console.log(`⏭️  User already exists: ${userData.username}`);
    }
  }
};

const seedMenuItems = async () => {
  const menuItems = [
    {
      name: 'Margherita Pizza',
      price: 12.99,
      description: 'Classic pizza with tomato sauce, mozzarella, and fresh basil',
      category: 'Pizza',
      imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002',
      isAvailable: true
    },
    {
      name: 'Pepperoni Pizza',
      price: 14.99,
      description: 'Loaded with pepperoni and mozzarella cheese',
      category: 'Pizza',
      imageUrl: 'https://images.unsplash.com/photo-1628840042765-356cda07504e',
      isAvailable: true
    },
    {
      name: 'Chicken Burger',
      price: 9.99,
      description: 'Grilled chicken patty with lettuce, tomato, and special sauce',
      category: 'Burgers',
      imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd',
      isAvailable: true
    },
    {
      name: 'Beef Burger',
      price: 10.99,
      description: 'Juicy beef patty with cheese, lettuce, and tomato',
      category: 'Burgers',
      imageUrl: 'https://images.unsplash.com/photo-1550547660-d9450f859349',
      isAvailable: true
    },
    {
      name: 'Caesar Salad',
      price: 7.99,
      description: 'Fresh romaine lettuce with Caesar dressing and croutons',
      category: 'Salads',
      imageUrl: 'https://images.unsplash.com/photo-1546793665-c74683f339c1',
      isAvailable: true
    },
    {
      name: 'Greek Salad',
      price: 8.99,
      description: 'Mixed greens with feta cheese, olives, and tomatoes',
      category: 'Salads',
      imageUrl: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe',
      isAvailable: true
    },
    {
      name: 'Coca Cola',
      price: 2.99,
      description: 'Chilled soft drink',
      category: 'Beverages',
      imageUrl: 'https://images.unsplash.com/photo-1554866585-cd94860890b7',
      isAvailable: true
    },
    {
      name: 'Orange Juice',
      price: 3.99,
      description: 'Freshly squeezed orange juice',
      category: 'Beverages',
      imageUrl: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba',
      isAvailable: true
    },
    {
      name: 'Chocolate Cake',
      price: 5.99,
      description: 'Rich chocolate cake with chocolate frosting',
      category: 'Desserts',
      imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587',
      isAvailable: true
    },
    {
      name: 'Cheesecake',
      price: 6.99,
      description: 'Creamy New York style cheesecake',
      category: 'Desserts',
      imageUrl: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad',
      isAvailable: true
    },
    {
      name: 'Spaghetti Carbonara',
      price: 13.99,
      description: 'Creamy pasta with bacon and parmesan',
      category: 'Pasta',
      imageUrl: 'https://images.unsplash.com/photo-1612874742237-6526221588e3',
      isAvailable: true
    },
    {
      name: 'Penne Arrabiata',
      price: 12.99,
      description: 'Spicy tomato sauce with garlic and chili',
      category: 'Pasta',
      imageUrl: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9',
      isAvailable: true
    }
  ];

  for (const itemData of menuItems) {
    const existingItem = await MenuItem.findOne({ name: itemData.name });
    if (!existingItem) {
      const menuItem = new MenuItem(itemData);
      await menuItem.save();
      console.log(`✅ Created menu item: ${itemData.name}`);
    } else {
      console.log(`⏭️  Menu item already exists: ${itemData.name}`);
    }
  }
};

const seedSettings = async () => {
  const customerOrderingSetting = await Settings.findOne({ key: 'customerOrderingEnabled' });
  if (!customerOrderingSetting) {
    const setting = new Settings({
      key: 'customerOrderingEnabled',
      value: true
    });
    await setting.save();
    console.log('✅ Created customer ordering setting (enabled by default)');
  } else {
    console.log('⏭️  Customer ordering setting already exists');
  }
};

const seed = async () => {
  console.log('🌱 Starting seed process...\n');
  
  await connectDB();
  
  console.log('\n📦 Seeding Users...');
  await seedUsers();
  
  console.log('\n🍕 Seeding Menu Items...');
  await seedMenuItems();
  
  console.log('\n⚙️  Seeding Settings...');
  await seedSettings();
  
  console.log('\n✨ Seed completed successfully!');
  console.log('\n📝 Default credentials:');
  console.log('   Owner:   username: admin    password: admin123');
  console.log('   Staff:   username: staff1   password: staff123');
  console.log('   Kitchen: username: kitchen1 password: kitchen123');
  
  process.exit(0);
};

seed().catch((error) => {
  console.error('❌ Seed error:', error);
  process.exit(1);
});
