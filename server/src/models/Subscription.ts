import mongoose, { type Model } from 'mongoose';

const { Schema, model, models } = mongoose;

export interface ISubscription {
  userId: string;
  plan: 'free' | 'premium';
  planType?: 'monthly' | 'yearly';
  status: 'active' | 'cancelled' | 'expired' | 'pending_payment';
  razorpaySubscriptionId?: string;
  razorpayCustomerId?: string;
  pendingPlanType?: 'monthly' | 'yearly';
  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const subscriptionSchema = new Schema<ISubscription>(
  {
    userId: { type: String, required: true, unique: true, index: true },
    plan: { type: String, enum: ['free', 'premium'], default: 'free' },
    planType: { type: String, enum: ['monthly', 'yearly'] },
    status: {
      type: String,
      enum: ['active', 'cancelled', 'expired', 'pending_payment'],
      default: 'active',
    },
    razorpaySubscriptionId: { type: String, sparse: true },
    razorpayCustomerId: { type: String, sparse: true },
    pendingPlanType: { type: String, enum: ['monthly', 'yearly'] },
    currentPeriodStart: { type: Date },
    currentPeriodEnd: { type: Date },
  },
  { timestamps: true },
);

const Subscription =
  (models.Subscription as Model<ISubscription>) ||
  model<ISubscription>('Subscription', subscriptionSchema);

export default Subscription;
