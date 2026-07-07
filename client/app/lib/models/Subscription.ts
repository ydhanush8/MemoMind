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
      // 'pending_payment' = subscription created on Razorpay, user hasn't paid yet / verify failed
      enum: ['active', 'cancelled', 'expired', 'pending_payment'],
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
    pendingPlanType: {
      type: String,
      enum: ['monthly', 'yearly'],
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
