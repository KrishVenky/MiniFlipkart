require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');
const User = require('./models/User');
const connectDB = require('./config/db');

// Sample products from FakeStore API categories
const sampleProducts = [
  // Electronics
  {
    title: "Apple iPhone 14 Pro",
    description: "6.1-inch Super Retina XDR display with ProMotion. Dynamic Island. A16 Bionic chip. Pro camera system with 48MP Main camera.",
    price: 999.99,
    category: "electronics",
    image: "https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_.jpg",
    rating: 4.7,
    stock: 50,
    isActive: true,
    reservedCount: 0,
  },
  {
    title: "Samsung 4K Smart TV 55\"",
    description: "Crystal UHD 4K Smart TV with Alexa built-in. HDR, Motion Rate 120, PurColor, Ultra Slim design.",
    price: 549.99,
    category: "electronics",
    image: "https://fakestoreapi.com/img/81QpkIctqPL._AC_SX679_.jpg",
    rating: 4.5,
    stock: 25,
    isActive: true,
    reservedCount: 0,
  },
  {
    title: "Sony WH-1000XM5 Wireless Headphones",
    description: "Industry-leading noise cancellation with Auto Noise Cancelling Optimizer. Up to 30 hours battery life.",
    price: 399.99,
    category: "electronics",
    image: "https://fakestoreapi.com/img/71li-ujtlUL._AC_UX679_.jpg",
    rating: 4.8,
    stock: 75,
    isActive: true,
    reservedCount: 0,
  },

  // Men's Clothing
  {
    title: "Men's Casual Slim Fit Shirt",
    description: "Lightweight slim fit button-down shirt perfect for casual or formal occasions. 100% cotton.",
    price: 29.99,
    category: "men's clothing",
    image: "https://fakestoreapi.com/img/71-3HjGNDUL._AC_SY879._SX._UX._SY._UY_.jpg",
    rating: 4.1,
    stock: 120,
    isActive: true,
    reservedCount: 0,
  },
  {
    title: "Men's Cotton Jacket",
    description: "Great outerwear jackets for Spring/Autumn/Winter. Suitable for many occasions.",
    price: 55.99,
    category: "men's clothing",
    image: "https://fakestoreapi.com/img/71YXzeOuslL._AC_UY879_.jpg",
    rating: 4.3,
    stock: 85,
    isActive: true,
    reservedCount: 0,
  },

  // Women's Clothing
  {
    title: "Women's Leather Jacket",
    description: "Premium leather motorcycle jacket with asymmetrical zip closure. Fully lined.",
    price: 89.99,
    category: "women's clothing",
    image: "https://fakestoreapi.com/img/51Y5NI-I5jL._AC_UX679_.jpg",
    rating: 4.6,
    stock: 60,
    isActive: true,
    reservedCount: 0,
  },
  {
    title: "Women's Summer Dress",
    description: "Floral print short sleeve dress. Perfect for summer occasions. Lightweight and comfortable.",
    price: 39.99,
    category: "women's clothing",
    image: "https://fakestoreapi.com/img/61pHAEJ4NML._AC_UX679_.jpg",
    rating: 4.4,
    stock: 95,
    isActive: true,
    reservedCount: 0,
  },

  // Jewelery
  {
    title: "Gold Plated Princess Cut Engagement Ring",
    description: "Classic princess cut engagement ring featuring a stunning cubic zirconia centerstone.",
    price: 149.99,
    category: "jewelery",
    image: "https://fakestoreapi.com/img/71YAIFU48IL._AC_UL640_QL65_ML3_.jpg",
    rating: 4.9,
    stock: 30,
    isActive: true,
    reservedCount: 0,
  },
  {
    title: "Sterling Silver Bracelet",
    description: "Elegant sterling silver chain bracelet with lobster clasp. Perfect gift for any occasion.",
    price: 79.99,
    category: "jewelery",
    image: "https://fakestoreapi.com/img/61sbMiUnoGL._AC_UL640_QL65_ML3_.jpg",
    rating: 4.7,
    stock: 45,
    isActive: true,
    reservedCount: 0,
  },

  // More products to reach good variety
  {
    title: "Portable External SSD 1TB",
    description: "Ultra-fast portable SSD with read speeds up to 1050MB/s. USB-C compatible.",
    price: 129.99,
    category: "electronics",
    image: "https://fakestoreapi.com/img/61IBBVJvSDL._AC_SY879_.jpg",
    rating: 4.6,
    stock: 100,
    isActive: true,
    reservedCount: 0,
  },
  {
    title: "Mechanical Gaming Keyboard RGB",
    description: "RGB mechanical keyboard with blue switches. Programmable keys and anti-ghosting.",
    price: 79.99,
    category: "electronics",
    image: "https://fakestoreapi.com/img/71kWymZ+c+L._AC_SX679_.jpg",
    rating: 4.5,
    stock: 65,
    isActive: true,
    reservedCount: 0,
  },
  {
    title: "Men's Running Shoes",
    description: "Lightweight running shoes with responsive cushioning. Perfect for daily training.",
    price: 89.99,
    category: "men's clothing",
    image: "https://fakestoreapi.com/img/71pWzhdJNwL._AC_UL640_QL65_ML3_.jpg",
    rating: 4.4,
    stock: 150,
    isActive: true,
    reservedCount: 0,
  },
  {
    title: "Women's Yoga Leggings",
    description: "High-waisted yoga pants with pockets. Moisture-wicking fabric for maximum comfort.",
    price: 34.99,
    category: "women's clothing",
    image: "https://fakestoreapi.com/img/51eg55uWmdL._AC_UX679_.jpg",
    rating: 4.5,
    stock: 200,
    isActive: true,
    reservedCount: 0,
  },
  {
    title: "Diamond Stud Earrings",
    description: "14k white gold diamond stud earrings. Total carat weight 1/4 CT.",
    price: 199.99,
    category: "jewelery",
    image: "https://fakestoreapi.com/img/51UDEzMJVpL._AC_UL640_QL65_ML3_.jpg",
    rating: 4.8,
    stock: 20,
    isActive: true,
    reservedCount: 0,
  }
];

// Sample admin user
const adminUser = {
  name: "Admin User",
  email: "admin@miniflipkart.com",
  password: "admin123",
  role: "admin",
  isEmailVerified: true
};

// Sample regular user
const regularUser = {
  name: "John Doe",
  email: "john@example.com",
  password: "password123",
  role: "user",
  isEmailVerified: true,
  addresses: [
    {
      fullName: "John Doe",
      addressLine1: "123 Main Street",
      addressLine2: "Apt 4B",
      city: "New York",
      state: "NY",
      zipCode: "10001",
      country: "USA",
      phone: "+1 (555) 123-4567",
      isDefault: true
    }
  ]
};

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Connect to MongoDB
    await connectDB();
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Product.deleteMany({});
    await User.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Insert products
    const products = await Product.insertMany(sampleProducts);
    console.log(`✅ Inserted ${products.length} products`);

    // Insert users
    const admin = await User.create(adminUser);
    const user = await User.create(regularUser);
    console.log('✅ Created admin and regular user accounts');

    console.log('\n📋 Seeding Summary:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Products: ${products.length}`);
    console.log(`Users: 2 (1 admin, 1 regular)`);
    console.log('\n👤 Login Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Admin:');
    console.log(`  Email: ${adminUser.email}`);
    console.log(`  Password: ${adminUser.password}`);
    console.log('\nRegular User:');
    console.log(`  Email: ${regularUser.email}`);
    console.log(`  Password: ${regularUser.password}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('✨ Database seeding completed successfully!');
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

seedDatabase();

