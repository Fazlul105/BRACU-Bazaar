import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, 'store.json');

let isMongoConnected = false;

// Initial sample seed data
const initialUsers = [
  {
    _id: '66a1b2c3d4e5f60011223344',
    name: 'Md. Fazlul Karim',
    studentId: '23101229',
    email: 'fazlul.karim@g.bracu.ac.bd',
    passwordHash: bcrypt.hashSync('23101229', 10),
    role: 'admin',
    phone: '01711223344',
    department: 'CSE',
    isBanned: false,
    bannedReason: '',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    createdAt: new Date('2025-01-15')
  },
  {
    _id: '66a1b2c3d4e5f60011223345',
    name: 'Tanvir Hossain',
    studentId: '21101452',
    email: 'tanvir.hossain@g.bracu.ac.bd',
    passwordHash: bcrypt.hashSync('student123', 10),
    role: 'both',
    phone: '01812345678',
    department: 'CSE',
    isBanned: false,
    bannedReason: '',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
    createdAt: new Date('2025-02-10')
  },
  {
    _id: '66a1b2c3d4e5f60011223346',
    name: 'Nusrat Jahan',
    studentId: '22301109',
    email: 'nusrat.jahan@g.bracu.ac.bd',
    passwordHash: bcrypt.hashSync('student123', 10),
    role: 'seller',
    phone: '01987654321',
    department: 'BBA',
    isBanned: false,
    bannedReason: '',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    createdAt: new Date('2025-03-01')
  },
  {
    _id: '66a1b2c3d4e5f60011223347',
    name: 'Arefin Rahman',
    studentId: '20101999',
    email: 'arefin.rahman@g.bracu.ac.bd',
    passwordHash: bcrypt.hashSync('student123', 10),
    role: 'buyer',
    phone: '01555443322',
    department: 'EEE',
    isBanned: false,
    bannedReason: '',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    createdAt: new Date('2025-03-12')
  }
];

const initialProducts = [
  {
    _id: '77b2c3d4e5f6a00011223344',
    title: 'Database Systems Concepts (Silberschatz) 7th Ed',
    description: 'Essential textbook for CSE370 course. Excellent condition, no highlighting or torn pages. Clean copy for exam preparation.',
    price: 450,
    category: 'Textbooks & Notes',
    condition: 'Like New',
    images: ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600'],
    sellerId: '66a1b2c3d4e5f60011223345',
    sellerName: 'Tanvir Hossain',
    sellerStudentId: '21101452',
    sellerPhone: '01812345678',
    meetupLocation: 'Merul Badda Permanent Campus (Library Plaza)',
    status: 'available',
    averageRating: 4.8,
    numReviews: 2,
    createdAt: new Date('2026-07-20')
  },
  {
    _id: '77b2c3d4e5f6a00011223345',
    title: 'Casio Scientific Calculator fx-991EX ClassWiz',
    description: 'Original Casio fx-991EX, solar powered + battery. Allowed in all BRACU exams (CSE, EEE, MAT). Perfect working condition.',
    price: 1800,
    category: 'Calculators & Lab Gear',
    condition: 'Brand New',
    images: ['https://images.unsplash.com/photo-1611125832047-1d7ad1e8e488?w=600'],
    sellerId: '66a1b2c3d4e5f60011223346',
    sellerName: 'Nusrat Jahan',
    sellerStudentId: '22301109',
    sellerPhone: '01987654321',
    meetupLocation: 'Merul Badda Permanent Campus (Food Court)',
    status: 'available',
    averageRating: 5.0,
    numReviews: 1,
    createdAt: new Date('2026-07-25')
  },
  {
    _id: '77b2c3d4e5f6a00011223346',
    title: 'Logitech G304 Lightspeed Wireless Gaming Mouse',
    description: 'Used for 3 months during hostel stay. 12k DPI HERO sensor, flawless tracking. Comes with box and nano receiver.',
    price: 2200,
    category: 'Electronics & Gadgets',
    condition: 'Good',
    images: ['https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600'],
    sellerId: '66a1b2c3d4e5f60011223345',
    sellerName: 'Tanvir Hossain',
    sellerStudentId: '21101452',
    sellerPhone: '01812345678',
    meetupLocation: 'Mohakhali UB2 / Badda Gate 1',
    status: 'available',
    averageRating: 4.5,
    numReviews: 2,
    createdAt: new Date('2026-07-28')
  },
  {
    _id: '77b2c3d4e5f6a00011223347',
    title: 'BRACU Official Limited Edition Oversized Hoodie (Navy Blue)',
    description: 'Size L. Custom BRACU Embroidery. Worn twice only. Super comfortable premium fleece cotton.',
    price: 950,
    category: 'Fashion & Merchandise',
    condition: 'Like New',
    images: ['https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600'],
    sellerId: '66a1b2c3d4e5f60011223346',
    sellerName: 'Nusrat Jahan',
    sellerStudentId: '22301109',
    sellerPhone: '01987654321',
    meetupLocation: 'Merul Badda Permanent Campus',
    status: 'available',
    averageRating: 5.0,
    numReviews: 1,
    createdAt: new Date('2026-08-01')
  },
  {
    _id: '77b2c3d4e5f6a00011223348',
    title: 'Mini Desk Fan & Study Lamp (USB Rechargeable)',
    description: '3 speed LED light fan combo for summer hostel power cuts. Battery lasts up to 6 hours continuous.',
    price: 650,
    category: 'Hostel & Mess Essentials',
    condition: 'Good',
    images: ['https://images.unsplash.com/photo-1585336261026-8f5786372966?w=600'],
    sellerId: '66a1b2c3d4e5f60011223345',
    sellerName: 'Tanvir Hossain',
    sellerStudentId: '21101452',
    sellerPhone: '01812345678',
    meetupLocation: 'Residential Campus Tarakanda / Badda',
    status: 'available',
    averageRating: 4.0,
    numReviews: 1,
    createdAt: new Date('2026-08-02')
  }
];

const initialReviews = [
  {
    _id: '88c3d4e5f6a0001122334455',
    productId: '77b2c3d4e5f6a00011223344',
    reviewerId: '66a1b2c3d4e5f60011223347',
    reviewerName: 'Arefin Rahman',
    reviewerStudentId: '20101999',
    rating: 5,
    comment: 'Great book condition! Met at permanent campus cafeteria. Very smooth transaction with Tanvir.',
    verifiedBuyer: true,
    createdAt: new Date('2026-07-22')
  },
  {
    _id: '88c3d4e5f6a0001122334456',
    productId: '77b2c3d4e5f6a00011223345',
    reviewerId: '66a1b2c3d4e5f60011223347',
    reviewerName: 'Arefin Rahman',
    reviewerStudentId: '20101999',
    rating: 5,
    comment: 'Authentic Casio calculator. Verified student seller.',
    verifiedBuyer: true,
    createdAt: new Date('2026-07-26')
  }
];

// Persistent Local Database Storage
class LocalDatabase {
  constructor() {
    this.loadFromFile();
  }

  loadFromFile() {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf8');
        const data = JSON.parse(raw);
        this.users = data.users || [...initialUsers];
        this.products = data.products || [...initialProducts];
        this.reviews = data.reviews || [...initialReviews];
        this.orders = data.orders || [];
        this.messages = data.messages || [];
        this.reports = data.reports || [];
        return;
      }
    } catch (e) {
      console.log('Using initial seed data store:', e.message);
    }
    this.users = [...initialUsers];
    this.products = [...initialProducts];
    this.reviews = [...initialReviews];
    this.orders = [];
    this.messages = [];
    this.reports = [];
    this.saveToFile();
  }

  saveToFile() {
    try {
      const data = {
        users: this.users,
        products: this.products,
        reviews: this.reviews,
        orders: this.orders,
        messages: this.messages,
        reports: this.reports
      };
      fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
    } catch (e) {
      console.error('Failed to write store.json:', e.message);
    }
  }

  // Users
  async findUserByStudentId(studentId) {
    if (!studentId) return null;
    return this.users.find(u => u.studentId && u.studentId.toString().trim() === studentId.toString().trim());
  }

  async findUserByEmail(email) {
    if (!email) return null;
    return this.users.find(u => u.email && u.email.toLowerCase() === email.toLowerCase());
  }

  async findUserById(id) {
    if (!id) return null;
    return this.users.find(u => u._id && u._id.toString() === id.toString());
  }

  async getAllUsers() {
    return this.users.map(({ passwordHash, ...u }) => u);
  }

  async createUser(userData) {
    const newUser = {
      _id: userData._id || ('user_' + Date.now() + Math.random().toString(36).substring(2, 7)),
      ...userData,
      passwordHash: userData.passwordHash || (userData.password ? bcrypt.hashSync(userData.password, 10) : ''),
      isBanned: false,
      bannedReason: '',
      avatar: userData.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      createdAt: new Date()
    };
    this.users.push(newUser);
    this.saveToFile();
    const { passwordHash, ...safeUser } = newUser;
    return safeUser;
  }

  async banUser(id, reason = 'Kicked out by Admin (Md. Fazlul Karim)') {
    const user = this.users.find(u => u._id.toString() === id.toString());
    if (user) {
      user.isBanned = true;
      user.bannedReason = reason;
      this.saveToFile();
      return user;
    }
    return null;
  }

  async unbanUser(id) {
    const user = this.users.find(u => u._id.toString() === id.toString());
    if (user) {
      user.isBanned = false;
      user.bannedReason = '';
      this.saveToFile();
      return user;
    }
    return null;
  }

  async deleteUser(id) {
    const idx = this.users.findIndex(u => u._id.toString() === id.toString());
    if (idx !== -1) {
      const removed = this.users.splice(idx, 1)[0];
      // remove user's products
      this.products = this.products.filter(p => p.sellerId.toString() !== id.toString());
      this.saveToFile();
      return removed;
    }
    return null;
  }

  // Products
  async getAllProducts(filters = {}) {
    let result = [...this.products];
    
    if (filters.category && filters.category !== 'All') {
      result = result.filter(p => p.category === filters.category);
    }
    if (filters.condition && filters.condition !== 'All') {
      result = result.filter(p => p.condition === filters.condition);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(p => 
        p.title.toLowerCase().includes(q) || 
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.meetupLocation.toLowerCase().includes(q)
      );
    }
    if (filters.minPrice) {
      result = result.filter(p => p.price >= Number(filters.minPrice));
    }
    if (filters.maxPrice) {
      result = result.filter(p => p.price <= Number(filters.maxPrice));
    }
    if (filters.sellerId) {
      result = result.filter(p => p.sellerId.toString() === filters.sellerId.toString());
    }

    return result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  async getProductById(id) {
    return this.products.find(p => p._id.toString() === id.toString());
  }

  async createProduct(productData) {
    const newProduct = {
      _id: 'prod_' + Date.now() + Math.random().toString(36).substring(2, 7),
      ...productData,
      status: 'available',
      averageRating: 0,
      numReviews: 0,
      createdAt: new Date()
    };
    this.products.push(newProduct);
    this.saveToFile();
    return newProduct;
  }

  async updateProduct(id, updateData) {
    const product = this.products.find(p => p._id.toString() === id.toString());
    if (product) {
      Object.assign(product, updateData, { updatedAt: new Date() });
      this.saveToFile();
      return product;
    }
    return null;
  }

  async deleteProduct(id) {
    const idx = this.products.findIndex(p => p._id.toString() === id.toString());
    if (idx !== -1) {
      const removed = this.products.splice(idx, 1)[0];
      this.reviews = this.reviews.filter(r => r.productId.toString() !== id.toString());
      this.saveToFile();
      return removed;
    }
    return null;
  }

  // Reviews
  async getReviewsForProduct(productId) {
    return this.reviews
      .filter(r => r.productId.toString() === productId.toString())
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  async addReview(reviewData) {
    const newReview = {
      _id: 'rev_' + Date.now() + Math.random().toString(36).substring(2, 7),
      ...reviewData,
      verifiedBuyer: true,
      createdAt: new Date()
    };
    this.reviews.push(newReview);

    // Update product rating
    const prodReviews = this.reviews.filter(r => r.productId.toString() === reviewData.productId.toString());
    const avg = prodReviews.reduce((acc, item) => acc + item.rating, 0) / prodReviews.length;
    
    const prod = this.products.find(p => p._id.toString() === reviewData.productId.toString());
    if (prod) {
      prod.averageRating = Number(avg.toFixed(1));
      prod.numReviews = prodReviews.length;
    }

    return newReview;
  }

  async deleteReview(id) {
    const idx = this.reviews.findIndex(r => r._id.toString() === id.toString());
    if (idx !== -1) {
      const removed = this.reviews.splice(idx, 1)[0];
      const prodReviews = this.reviews.filter(r => r.productId.toString() === removed.productId.toString());
      const prod = this.products.find(p => p._id.toString() === removed.productId.toString());
      if (prod) {
        prod.numReviews = prodReviews.length;
        prod.averageRating = prodReviews.length > 0
          ? Number((prodReviews.reduce((acc, item) => acc + item.rating, 0) / prodReviews.length).toFixed(1))
          : 0;
      }
      return removed;
    }
    return null;
  }

  // Orders
  async createOrder(orderData) {
    const newOrder = {
      _id: 'ord_' + Date.now() + Math.random().toString(36).substring(2, 7),
      orderNumber: 'BRACU-ORD-' + Math.floor(100000 + Math.random() * 900000),
      ...orderData,
      orderStatus: 'Confirmed',
      createdAt: new Date()
    };
    this.orders.push(newOrder);
    this.saveToFile();
    return newOrder;
  }

  async getOrdersForUser(userId) {
    return this.orders
      .filter(o => o.buyerId && o.buyerId.toString() === userId.toString())
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  async getOrderById(id) {
    return this.orders.find(o => o._id.toString() === id.toString() || o.orderNumber === id);
  }

  async updateOrderStatus(id, status) {
    const order = this.orders.find(o => o._id.toString() === id.toString() || o.orderNumber === id);
    if (order) {
      order.orderStatus = status;
      order.updatedAt = new Date();
      this.saveToFile();
      return order;
    }
    return null;
  }

  // Messages between Buyers & Sellers
  async sendMessage({ senderId, senderName, recipientId, recipientName, productId, productTitle, text }) {
    const newMessage = {
      _id: 'msg_' + Date.now() + Math.random().toString(36).substring(2, 7),
      senderId: senderId.toString(),
      senderName,
      recipientId: recipientId.toString(),
      recipientName,
      productId: productId ? productId.toString() : null,
      productTitle: productTitle || '',
      text: text.trim(),
      isRead: false,
      createdAt: new Date()
    };
    this.messages.push(newMessage);
    this.saveToFile();
    return newMessage;
  }

  async getConversationsForUser(userId) {
    const uid = userId.toString();
    const map = new Map();

    const userMsgs = this.messages.filter(m => m.senderId === uid || m.recipientId === uid);
    
    for (const msg of userMsgs) {
      const partnerId = msg.senderId === uid ? msg.recipientId : msg.senderId;
      const partnerName = msg.senderId === uid ? msg.recipientName : msg.senderName;
      
      const existing = map.get(partnerId);
      if (!existing || new Date(msg.createdAt) > new Date(existing.lastMessageDate)) {
        const unread = this.messages.filter(m => m.senderId === partnerId && m.recipientId === uid && !m.isRead).length;
        map.set(partnerId, {
          partnerId,
          partnerName,
          lastMessage: msg.text,
          lastMessageDate: msg.createdAt,
          productId: msg.productId,
          productTitle: msg.productTitle,
          unreadCount: unread
        });
      }
    }

    return Array.from(map.values()).sort((a, b) => new Date(b.lastMessageDate) - new Date(a.lastMessageDate));
  }

  async getMessagesInConversation(userId, partnerId) {
    const uid = userId.toString();
    const pid = partnerId.toString();

    return this.messages
      .filter(m => (m.senderId === uid && m.recipientId === pid) || (m.senderId === pid && m.recipientId === uid))
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  }

  async markMessagesAsRead(userId, partnerId) {
    const uid = userId.toString();
    const pid = partnerId.toString();
    let updated = false;

    this.messages.forEach(m => {
      if (m.senderId === pid && m.recipientId === uid && !m.isRead) {
        m.isRead = true;
        updated = true;
      }
    });

    if (updated) this.saveToFile();
    return true;
  }

  async getUnreadCount(userId) {
    const uid = userId.toString();
    return this.messages.filter(m => m.recipientId === uid && !m.isRead).length;
  }

  // Reports Management for Moderation
  async createReport({ reporterId, reporterName, targetType, targetId, targetName, reason, description }) {
    const newReport = {
      _id: 'rep_' + Date.now() + Math.random().toString(36).substring(2, 7),
      reporterId: reporterId.toString(),
      reporterName,
      targetType,
      targetId: targetId.toString(),
      targetName: targetName || '',
      reason,
      description: description || '',
      status: 'pending',
      createdAt: new Date()
    };
    this.reports.push(newReport);
    this.saveToFile();
    return newReport;
  }

  async getAllReports() {
    return this.reports.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  async resolveReport(id) {
    const report = this.reports.find(r => r._id.toString() === id.toString());
    if (report) {
      report.status = 'resolved';
      report.resolvedAt = new Date();
      this.saveToFile();
      return report;
    }
    return null;
  }

  async deleteReport(id) {
    const idx = this.reports.findIndex(r => r._id.toString() === id.toString());
    if (idx !== -1) {
      const removed = this.reports.splice(idx, 1)[0];
      this.saveToFile();
      return removed;
    }
    return null;
  }
}

export const dbStore = new LocalDatabase();

export const connectDB = async () => {
  const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/bracu-bazaar';
  try {
    const conn = await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 2000
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    isMongoConnected = true;
  } catch (error) {
    console.log(`MongoDB not running locally (${error.message}). Switched to high-performance local database store.`);
    isMongoConnected = false;
  }
};
