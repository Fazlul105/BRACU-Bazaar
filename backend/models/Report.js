import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
  reporterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reporterName: {
    type: String,
    required: true
  },
  targetType: {
    type: String,
    enum: ['product', 'user'],
    required: true
  },
  targetId: {
    type: String,
    required: true
  },
  targetName: {
    type: String,
    default: 'Item/User'
  },
  reason: {
    type: String,
    required: [true, 'Report reason is required']
  },
  description: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['pending', 'resolved', 'dismissed'],
    default: 'pending'
  }
}, {
  timestamps: true
});

const Report = mongoose.models.Report || mongoose.model('Report', reportSchema);
export default Report;
