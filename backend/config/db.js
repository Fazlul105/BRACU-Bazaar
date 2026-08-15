import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Review from '../models/Review.js';

// Seed data definitions
const initialUsers = [
  {
    _id: new mongoose.Types.ObjectId('66a1b2c3d4e5f60011223344'),
    name: 'Md. Fazlul Karim',
    studentId: '23101229',
    email: 'fazlul.karim@g.bracu.ac.bd',
    passwordHash: bcrypt.hashSync('23101229', 10),
    role: 'admin',
    phone: '01711223344',
    department: 'CSE',
    isBanned: false,
    bannedReason: '',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
  },
  {
    _id: new mongoose.Types.ObjectId('66a1b2c3d4e5f60011223345'),
    name: 'Tanvir Hossain',
    studentId: '21101452',
    email: 'tanvir.hossain@g.bracu.ac.bd',
    passwordHash: bcrypt.hashSync('student123', 10),
    role: 'both',
    phone: '01812345678',
    department: 'CSE',
    isBanned: false,
    bannedReason: '',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150'
  },
  {
    _id: new mongoose.Types.ObjectId('66a1b2c3d4e5f60011223346'),
    name: 'Nusrat Jahan',
    studentId: '22301109',
    email: 'nusrat.jahan@g.bracu.ac.bd',
    passwordHash: bcrypt.hashSync('student123', 10),
    role: 'seller',
    phone: '01987654321',
    department: 'BBA',
    isBanned: false,
    bannedReason: '',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'
  },
  {
    _id: new mongoose.Types.ObjectId('66a1b2c3d4e5f60011223347'),
    name: 'Arefin Rahman',
    studentId: '20101999',
    email: 'arefin.rahman@g.bracu.ac.bd',
    passwordHash: bcrypt.hashSync('student123', 10),
    role: 'buyer',
    phone: '01555443322',
    department: 'EEE',
    isBanned: false,
    bannedReason: '',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
  }
];

const initialProducts = [
  {
    _id: new mongoose.Types.ObjectId('77b2c3d4e5f6a00011223344'),
    title: 'Database Systems Concepts (Silberschatz) 7th Ed',
    description: 'Essential textbook for CSE370 course. Excellent condition, no highlighting or torn pages. Clean copy for exam preparation.',
    price: 450,
    category: 'Textbooks & Notes',
    condition: 'Like New',
    images: ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600'],
    sellerId: new mongoose.Types.ObjectId('66a1b2c3d4e5f60011223345'),
    sellerName: 'Tanvir Hossain',
    sellerStudentId: '21101452',
    sellerPhone: '01812345678',
    meetupLocation: 'Merul Badda Permanent Campus (Library Plaza)',
    status: 'available',
    averageRating: 4.8,
    numReviews: 2
  },
  {
    _id: new mongoose.Types.ObjectId('77b2c3d4e5f6a00011223345'),
    title: 'Casio Scientific Calculator fx-991EX ClassWiz',
    description: 'Original Casio fx-991EX, solar powered + battery. Allowed in all BRACU exams (CSE, EEE, MAT). Perfect working condition.',
    price: 1800,
    category: 'Calculators & Lab Gear',
    condition: 'Brand New',
    images: ['https://images.unsplash.com/photo-1611125832047-1d7ad1e8e488?w=600'],
    sellerId: new mongoose.Types.ObjectId('66a1b2c3d4e5f60011223346'),
    sellerName: 'Nusrat Jahan',
    sellerStudentId: '22301109',
    sellerPhone: '01987654321',
    meetupLocation: 'Merul Badda Permanent Campus (Food Court)',
    status: 'available',
    averageRating: 5.0,
    numReviews: 1
  },
  {
    _id: new mongoose.Types.ObjectId('77b2c3d4e5f6a00011223346'),
    title: 'Logitech G304 Lightspeed Wireless Gaming Mouse',
    description: 'Used for 3 months during hostel stay. 12k DPI HERO sensor, flawless tracking. Comes with box and nano receiver.',
    price: 2200,
    category: 'Electronics & Gadgets',
    condition: 'Good',
    images: ['https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600'],
    sellerId: new mongoose.Types.ObjectId('66a1b2c3d4e5f60011223345'),
    sellerName: 'Tanvir Hossain',
    sellerStudentId: '21101452',
    sellerPhone: '01812345678',
    meetupLocation: 'Mohakhali UB2 / Badda Gate 1',
    status: 'available',
    averageRating: 4.5,
    numReviews: 2
  },
  {
    _id: new mongoose.Types.ObjectId('77b2c3d4e5f6a00011223347'),
    title: 'BRACU Official Limited Edition Oversized Hoodie (Navy Blue)',
    description: 'Size L. Custom BRACU Embroidery. Worn twice only. Super comfortable premium fleece cotton.',
    price: 950,
    category: 'Fashion & Merchandise',
    condition: 'Like New',
    images: ['https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600'],
    sellerId: new mongoose.Types.ObjectId('66a1b2c3d4e5f60011223346'),
    sellerName: 'Nusrat Jahan',
    sellerStudentId: '22301109',
    sellerPhone: '01987654321',
    meetupLocation: 'Merul Badda Permanent Campus',
    status: 'available',
    averageRating: 5.0,
    numReviews: 1
  },
  {
    _id: new mongoose.Types.ObjectId('77b2c3d4e5f6a00011223348'),
    title: 'Mini Desk Fan & Study Lamp (USB Rechargeable)',
    description: '3 speed LED light fan combo for summer hostel power cuts. Battery lasts up to 6 hours continuous.',
    price: 650,
    category: 'Hostel & Mess Essentials',
    condition: 'Good',
    images: ['https://images.unsplash.com/photo-1585336261026-8f5786372966?w=600'],
    sellerId: new mongoose.Types.ObjectId('66a1b2c3d4e5f60011223345'),
    sellerName: 'Tanvir Hossain',
    sellerStudentId: '21101452',
    sellerPhone: '01812345678',
    meetupLocation: 'Residential Campus Tarakanda / Badda',
    status: 'available',
    averageRating: 4.0,
    numReviews: 1
  }
];

const initialReviews = [
  {
    _id: new mongoose.Types.ObjectId('88c3d4e5f6a0001122334455'),
    productId: new mongoose.Types.ObjectId('77b2c3d4e5f6a00011223344'),
    reviewerId: new mongoose.Types.ObjectId('66a1b2c3d4e5f60011223347'),
    reviewerName: 'Arefin Rahman',
    reviewerStudentId: '20101999',
    rating: 5,
    comment: 'Great book condition! Met at permanent campus cafeteria. Very smooth transaction with Tanvir.',
    verifiedBuyer: true
  },
  {
    _id: new mongoose.Types.ObjectId('88c3d4e5f6a0001122334456'),
    productId: new mongoose.Types.ObjectId('77b2c3d4e5f6a00011223345'),
    reviewerId: new mongoose.Types.ObjectId('66a1b2c3d4e5f60011223347'),
    reviewerName: 'Arefin Rahman',
    reviewerStudentId: '20101999',
    rating: 5,
    comment: 'Authentic Casio calculator. Verified student seller.',
    verifiedBuyer: true
  }
];

// Auto-seed MongoDB Atlas if collections are empty
async function seedInitialData() {
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('🌱 Seeding initial BRACU users (including Admin Md. Fazlul Karim 23101229)...');
      await User.insertMany(initialUsers);
      console.log('✅ Initial users seeded into MongoDB.');
    } else {
      // Ensure Admin user always exists
      const adminUser = await User.findOne({ studentId: '23101229' });
      if (!adminUser) {
        await User.create(initialUsers[0]);
        console.log('👑 Super Admin account ensured in MongoDB.');
      }
    }

    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      console.log('🌱 Seeding sample campus products...');
      await Product.insertMany(initialProducts);
      console.log('✅ Initial products seeded into MongoDB.');
    }

    const reviewCount = await Review.countDocuments();
    if (reviewCount === 0) {
      console.log('🌱 Seeding initial reviews...');
      await Review.insertMany(initialReviews);
      console.log('✅ Initial reviews seeded into MongoDB.');
    }
  } catch (seedErr) {
    console.error('⚠️ Warning: Auto-seeding error:', seedErr.message);
  }
}

export const connectDB = async () => {
  const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/bracu-bazaar';
  try {
    const conn = await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 10000
    });
    console.log(`====================================================`);
    console.log(`✅ MongoDB Atlas Connected: ${conn.connection.host}`);
    console.log(`📦 Database Name: ${conn.connection.name}`);
    console.log(`====================================================`);
    
    // Run auto-seeder once connected
    await seedInitialData();
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    throw error;
  }
};
