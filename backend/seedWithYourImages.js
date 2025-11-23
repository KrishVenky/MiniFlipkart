require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');
const connectDB = require('./config/db');

const products = [
  // ELECTRONICS
  {
    title: "Premium Wireless Laptop - 15.6 inch Display",
    description: "High-performance laptop with stunning display, 16GB RAM, 512GB SSD, and long battery life. Perfect for work and entertainment.",
    price: 1299.99,
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500",
    category: "electronics",
    stock: 15,
    rating: 4.7,
    isActive: true,
    reservedCount: 0,
  },
  {
    title: "Noise Cancelling Wireless Headphones",
    description: "Premium sound quality with active noise cancellation. Up to 30 hours of battery life. Comfortable over-ear design.",
    price: 249.99,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500",
    category: "electronics",
    stock: 50,
    rating: 4.8,
    isActive: true,
    reservedCount: 0,
  },
  {
    title: "5G Smartphone - 256GB Storage",
    description: "Latest smartphone with advanced camera system, all-day battery, and blazing fast 5G connectivity.",
    price: 899.99,
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500",
    category: "electronics",
    stock: 30,
    rating: 4.6,
    isActive: true,
    reservedCount: 0,
  },
  {
    title: "Smartwatch with Health Tracking",
    description: "Track your fitness, heart rate, sleep patterns, and more. Water resistant design with AMOLED display.",
    price: 349.99,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500",
    category: "electronics",
    stock: 40,
    rating: 4.5,
    isActive: true,
    reservedCount: 0,
  },
  
  // MEN'S CLOTHING
  {
    title: "Premium Cotton T-Shirt - Navy Blue",
    description: "Comfortable 100% cotton t-shirt with modern fit. Soft, breathable fabric perfect for everyday wear.",
    price: 29.99,
    image: "mens-tshirt1.png",
    category: "men's clothing",
    stock: 100,
    rating: 4.4,
    isActive: true,
    reservedCount: 0,
  },
  {
    title: "Premium Cotton T-Shirt - White",
    description: "Classic white t-shirt made from premium cotton. Versatile and comfortable for any occasion.",
    price: 29.99,
    image: "mens-tshirt2.jpg",
    category: "men's clothing",
    stock: 100,
    rating: 4.5,
    isActive: true,
    reservedCount: 0,
  },
  {
    title: "Classic Button-Down Shirt - Blue",
    description: "Elegant dress shirt perfect for office or casual wear. Made from high-quality cotton blend.",
    price: 49.99,
    image: "mens-shirt1.png",
    category: "men's clothing",
    stock: 75,
    rating: 4.6,
    isActive: true,
    reservedCount: 0,
  },
  {
    title: "Classic Button-Down Shirt - White",
    description: "Timeless white dress shirt suitable for any formal occasion. Wrinkle-resistant fabric.",
    price: 49.99,
    image: "mens-shirt2.png",
    category: "men's clothing",
    stock: 75,
    rating: 4.6,
    isActive: true,
    reservedCount: 0,
  },
  {
    title: "Classic Fit Denim Jeans - Dark Blue",
    description: "Durable denim jeans with classic fit. Made from premium denim for lasting quality.",
    price: 59.99,
    image: "mens-jeans1.png",
    category: "men's clothing",
    stock: 80,
    rating: 4.3,
    isActive: true,
    reservedCount: 0,
  },
  {
    title: "Slim Fit Denim Jeans - Light Blue",
    description: "Modern slim fit jeans with comfortable stretch. Perfect for everyday style.",
    price: 64.99,
    image: "mens-jeans2.png",
    category: "men's clothing",
    stock: 70,
    rating: 4.4,
    isActive: true,
    reservedCount: 0,
  },
  {
    title: "Hooded Sweatshirt - Grey",
    description: "Cozy hoodie made from soft fleece. Perfect for casual wear and cool weather.",
    price: 49.99,
    image: "mens-hoodie1.png",
    category: "men's clothing",
    stock: 60,
    rating: 4.6,
    isActive: true,
    reservedCount: 0,
  },
  {
    title: "Hooded Sweatshirt - Black",
    description: "Classic black hoodie with adjustable drawstring hood. Soft and comfortable.",
    price: 49.99,
    image: "mens-hoodie2.png",
    category: "men's clothing",
    stock: 65,
    rating: 4.6,
    isActive: true,
    reservedCount: 0,
  },
  {
    title: "Leather Jacket - Brown",
    description: "Genuine leather jacket with modern design. Timeless style that never goes out of fashion.",
    price: 199.99,
    image: "mens-jacket1.jpg",
    category: "men's clothing",
    stock: 25,
    rating: 4.8,
    isActive: true,
    reservedCount: 0,
  },
  {
    title: "Bomber Jacket - Black",
    description: "Classic bomber jacket with zipper closure. Versatile outerwear for any season.",
    price: 89.99,
    image: "mens-jacket2.png",
    category: "men's clothing",
    stock: 40,
    rating: 4.5,
    isActive: true,
    reservedCount: 0,
  },
  
  // WOMEN'S CLOTHING
  {
    title: "Elegant Summer Dress - Floral Print",
    description: "Beautiful floral dress perfect for summer occasions. Lightweight, breathable fabric.",
    price: 79.99,
    image: "womens-dress1.png",
    category: "women's clothing",
    stock: 45,
    rating: 4.7,
    isActive: true,
    reservedCount: 0,
  },
  {
    title: "Casual Midi Dress - Solid Color",
    description: "Versatile midi dress suitable for work or weekend. Comfortable fit and elegant design.",
    price: 69.99,
    image: "womens-dress2.png",
    category: "women's clothing",
    stock: 50,
    rating: 4.6,
    isActive: true,
    reservedCount: 0,
  },
  {
    title: "Evening Dress - Black",
    description: "Sophisticated black dress perfect for evening events. Flattering silhouette.",
    price: 89.99,
    image: "womens-dress3.png",
    category: "women's clothing",
    stock: 35,
    rating: 4.8,
    isActive: true,
    reservedCount: 0,
  },
  {
    title: "Silk Blouse - White",
    description: "Elegant silk blouse suitable for office or evening wear. Soft and luxurious feel.",
    price: 69.99,
    image: "womens-blouse1.png",
    category: "women's clothing",
    stock: 50,
    rating: 4.5,
    isActive: true,
    reservedCount: 0,
  },
  {
    title: "Casual Blouse - Patterned",
    description: "Stylish patterned blouse perfect for casual or semi-formal occasions.",
    price: 59.99,
    image: "womens-blouse2.png",
    category: "women's clothing",
    stock: 60,
    rating: 4.4,
    isActive: true,
    reservedCount: 0,
  },
  {
    title: "High-Waist Skinny Jeans - Dark Wash",
    description: "Comfortable stretch jeans with flattering high-waist fit. Premium denim quality.",
    price: 64.99,
    image: "womens-jeans1.jpg",
    category: "women's clothing",
    stock: 80,
    rating: 4.6,
    isActive: true,
    reservedCount: 0,
  },
  {
    title: "Classic Straight Jeans - Light Wash",
    description: "Timeless straight-leg jeans with comfortable fit. Perfect for everyday wear.",
    price: 59.99,
    image: "womens-jeans2.jpg",
    category: "women's clothing",
    stock: 75,
    rating: 4.5,
    isActive: true,
    reservedCount: 0,
  },
  {
    title: "Boyfriend Jeans - Medium Wash",
    description: "Relaxed boyfriend fit jeans with trendy distressed details. Comfortable and stylish.",
    price: 69.99,
    image: "womens-jeans3.jpg",
    category: "women's clothing",
    stock: 65,
    rating: 4.5,
    isActive: true,
    reservedCount: 0,
  },
  {
    title: "Cozy Knit Sweater - Beige",
    description: "Soft knit sweater perfect for cooler weather. Relaxed fit with ribbed details.",
    price: 54.99,
    image: "womens-sweater1.png",
    category: "women's clothing",
    stock: 55,
    rating: 4.4,
    isActive: true,
    reservedCount: 0,
  },
  {
    title: "Turtleneck Sweater - Cream",
    description: "Classic turtleneck sweater made from soft wool blend. Warm and stylish.",
    price: 59.99,
    image: "womens-sweater2.jpg",
    category: "women's clothing",
    stock: 50,
    rating: 4.5,
    isActive: true,
    reservedCount: 0,
  },
  
  // JEWELRY
  {
    title: "Sterling Silver Necklace with Crystal Pendant",
    description: "Beautiful sterling silver necklace with elegant crystal pendant. Perfect for any occasion.",
    price: 89.99,
    image: "necklace1.png",
    category: "jewelery",
    stock: 30,
    rating: 4.9,
    isActive: true,
    reservedCount: 0,
  },
  {
    title: "Gold Chain Necklace - Delicate Design",
    description: "Elegant gold-plated chain necklace. Minimalist design that complements any outfit.",
    price: 79.99,
    image: "necklace2.png",
    category: "jewelery",
    stock: 40,
    rating: 4.8,
    isActive: true,
    reservedCount: 0,
  },
  {
    title: "Gold Plated Hoop Earrings - Large",
    description: "Classic large hoop earrings with gold plating. Hypoallergenic and comfortable.",
    price: 39.99,
    image: "earring1.png",
    category: "jewelery",
    stock: 60,
    rating: 4.7,
    isActive: true,
    reservedCount: 0,
  },
  {
    title: "Sterling Silver Stud Earrings",
    description: "Elegant sterling silver stud earrings with crystal accents. Perfect for daily wear.",
    price: 49.99,
    image: "earring2.png",
    category: "jewelery",
    stock: 55,
    rating: 4.8,
    isActive: true,
    reservedCount: 0,
  }
];

const seedProductsWithImages = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    console.log('✅ Connected to MongoDB');
    
    // Clear existing products
    await Product.deleteMany({});
    console.log('🗑️  Cleared existing products');
    
    // Insert new products with your images
    await Product.insertMany(products);
    
    console.log(`✅ Successfully added ${products.length} products with your images!`);
    console.log('\n📦 Products by category:');
    console.log(`   Electronics: 4 products`);
    console.log(`   Men's Clothing: 10 products`);
    console.log(`   Women's Clothing: 10 products`);
    console.log(`   Jewelry: 4 products`);
    console.log('\n🎉 All images are properly linked!');
    console.log('🌐 Refresh your website to see the products!');
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding products:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

seedProductsWithImages();

