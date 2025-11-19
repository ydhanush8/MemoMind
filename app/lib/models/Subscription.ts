import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    plan: {
      type: String,
      enum: ['free', 'premium'],
      default: 'free',
    },
    planType: {
      type: String,
      enum: ['monthly', 'yearly'],
    },
    status: {
      type: String,
      enum: ['active', 'cancelled', 'expired'],
      default: 'active',
    },
    razorpaySubscriptionId: {
      type: String,
      sparse: true,
    },
    razorpayCustomerId: {
      type: String,
      sparse: true,
    },
    currentPeriodStart: {
      type: Date,
    },
    currentPeriodEnd: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

const Subscription =
  mongoose.models.Subscription || mongoose.model('Subscription', subscriptionSchema);

export default Subscription;
