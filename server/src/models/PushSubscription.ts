import mongoose, { type Model } from 'mongoose';
import type { WebPushSubscription } from '../types/notification.types.js';

const { Schema, model, models } = mongoose;

export interface IPushSubscription {
  userId: string;
  endpoint: string;
  subscription: WebPushSubscription;
  enabled: boolean;
  preferredTime: string;
  notificationTypes: { dailyReminder: boolean; streakWarning: boolean };
  createdAt: Date;
  updatedAt: Date;
}

const PushSubscriptionSchema = new Schema<IPushSubscription>({
  userId: { type: String, required: true, index: true },
  // Stored separately for compound-index queries; mirrors subscription.endpoint
  endpoint: { type: String, required: true },
  subscription: { type: Object, required: true },
  enabled: { type: Boolean, default: true },
  preferredTime: { type: String, default: '19:00' },
  notificationTypes: {
    dailyReminder: { type: Boolean, default: true },
    streakWarning: { type: Boolean, default: true },
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Unique compound index — one subscription document per (user, device endpoint)
PushSubscriptionSchema.index({ userId: 1, endpoint: 1 }, { unique: true });

PushSubscriptionSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

const PushSubscription =
  (models.PushSubscription as Model<IPushSubscription>) ||
  model<IPushSubscription>('PushSubscription', PushSubscriptionSchema);

export default PushSubscription;
