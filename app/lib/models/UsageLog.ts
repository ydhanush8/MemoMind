import mongoose from 'mongoose';

const UsageLogSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  action: { type: String, required: true },
  date: { type: String, required: true }, // YYYY-MM-DD
  count: { type: Number, default: 0 },
  expiresAt: { type: Date },
});

UsageLogSchema.index({ userId: 1, action: 1, date: 1 }, { unique: true });
UsageLogSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const UsageLog = mongoose.models.UsageLog || mongoose.model('UsageLog', UsageLogSchema);

export default UsageLog;
