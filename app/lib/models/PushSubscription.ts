import mongoose from 'mongoose';

const PushSubscriptionSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  subscription: {
    type: Object,
    required: true,
  },
  enabled: {
    type: Boolean,
    default: true,
  },
  preferredTime: {
    type: String,
    default: '19:00', // 7 PM
  },
  notificationTypes: {
    dailyReminder: {
      type: Boolean,
      default: true,
    },
    streakWarning: {
      type: Boolean,
      default: true,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update timestamp on save
PushSubscriptionSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

const PushSubscription =
  mongoose.models.PushSubscription ||
  mongoose.model('PushSubscription', PushSubscriptionSchema);

export default PushSubscription;
