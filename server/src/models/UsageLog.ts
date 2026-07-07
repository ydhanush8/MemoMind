import mongoose, { type Model } from 'mongoose';

const { Schema, model, models } = mongoose;

export interface IUsageLog {
  userId: string;
  action: string;
  date: string; // YYYY-MM-DD
  count: number;
  expiresAt?: Date;
}

const UsageLogSchema = new Schema<IUsageLog>({
  userId: { type: String, required: true },
  action: { type: String, required: true },
  date: { type: String, required: true },
  count: { type: Number, default: 0 },
  expiresAt: { type: Date },
});

UsageLogSchema.index({ userId: 1, action: 1, date: 1 }, { unique: true });
UsageLogSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const UsageLog =
  (models.UsageLog as Model<IUsageLog>) || model<IUsageLog>('UsageLog', UsageLogSchema);

export default UsageLog;
