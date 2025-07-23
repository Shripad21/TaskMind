// models/Task.js
import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: String,
  dueDate: Date,
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  category: String,
  frequency: { 
    type: String, 
    enum: ['once', 'daily', 'weekly', 'monthly', 'yearly'], 
    default: 'once' 
  },
  
  // Completion tracking
  isCompleted: { type: Boolean, default: false },
  completedAt: { type: Date },
  status: { 
    type: String, 
    enum: ['active', 'completed', 'paused', 'archived'], 
    default: 'active' 
  },
  
  // Recurring task tracking
  totalCompletions: { type: Number, default: 0 },
  lastCompletedDate: String, // "2025-07-21"
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt field on save
taskSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

taskSchema.index({ userId: 1, frequency: 1, isCompleted: 1 });

export default mongoose.model("Task", taskSchema);
