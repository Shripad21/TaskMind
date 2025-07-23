import mongoose from 'mongoose';

const userDailySummarySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  date: { type: String, required: true }, // "2025-07-10"
  tasksCompleted: { type: Number, default: 0 },
  completedTaskIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
  streakCount: { type: Number, default: 1 } // streak of using the app daily
});

export default mongoose.model('UserDailySummary', userDailySummarySchema);
