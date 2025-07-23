import mongoose from 'mongoose';

const taskStreakSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
  datesCompleted: [String],
  currentStreak: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 }, // Track best streak
  lastCompletedDate: String,
  
  // ADD: Track completion quality
  completionHistory: [{
    date: String,
    quality: { type: Number, min: 1, max: 5, default: 5 },
    timeSpent: Number,
    notes: String
  }]
});

export default mongoose.model('TaskStreak', taskStreakSchema);
