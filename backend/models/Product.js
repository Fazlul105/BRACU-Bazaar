import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Product title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'Textbooks & Notes',
      'Electronics & Gadgets',
      'Hostel & Mess Essentials',
      'Calculators & Lab Gear',
      'Fashion & Merchandise',
      'Sports & Gaming',
      'Miscellaneous'
    ]
  },
  condition: {
    type: String,
    required: [true, 'Condition is required'],
    enum: ['Brand New', 'Like New', 'Good', 'Fair']
  },
  images: [{
    type: String
  }],
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sellerName: {
    type: String,
    default: 'BRACU Student'
  },
  sellerStudentId: {
    type: String,
    default: ''
  },
  sellerPhone: {
    type: String,
    default: ''
  },
  meetupLocation: {
    type: String,
    required: [true, 'Meetup location is required'],
    default: 'Merul Badda Permanent Campus'
  },
  status: {
    type: String,
    enum: ['available', 'reserved', 'sold'],
    default: 'available'
  },
  averageRating: {
    type: Number,
    default: 0
  },
  numReviews: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);
export default Product;
