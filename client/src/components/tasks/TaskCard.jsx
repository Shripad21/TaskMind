import React, { useState } from 'react';
import { useTasks } from '../../hooks/useTasks';
import { useStreaks } from '../../hooks/useStreaks';

const TaskCard = ({ task, onEdit, onDelete }) => {
  const [isCompleting, setIsCompleting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const { markTaskCompleted, deleteTask } = useTasks();
  const { markTaskComplete } = useStreaks();

  // Add early validation to prevent errors
  if (!task || !task._id || !task.title) {
    console.warn('Invalid task data:', task);
    return (
      <div className="rounded-xl shadow-sm border border-gray-200 p-6 bg-gray-50">
        <div className="text-center text-gray-500">
          <p className="text-sm">Invalid task data</p>
          <p className="text-xs">Task ID: {task?._id || 'unknown'}</p>
        </div>
      </div>
    );
  }

  // Handle task completion toggle
  const handleToggleComplete = async () => {
    if (isCompleting) return;
    
    setIsCompleting(true);
    try {
      if (task.isCompleted) {
        // Mark as incomplete
        await markTaskCompleted(task._id, false);
      } else {
        // Mark as complete - update both task and streaks
        await Promise.all([
          markTaskCompleted(task._id, true),
          markTaskComplete(task._id).catch(err => {
            console.warn('Failed to update streak:', err);
            // Don't fail the whole operation if streak fails
          })
        ]);
      }
    } catch (error) {
      console.error('Error toggling task completion:', error);
      alert('Failed to update task. Please try again.');
    } finally {
      setIsCompleting(false);
    }
  };

  // Handle task deletion with cleanup
  const handleDelete = async () => {
    if (isDeleting) return;

    const confirmMessage = task.isCompleted 
      ? `Delete "${task.title}"? This will remove the task and all related streak/completion data. This action cannot be undone.`
      : `Delete "${task.title}"? This will also remove any streak data. This action cannot be undone.`;
      
    if (window.confirm(confirmMessage)) {
      setIsDeleting(true);
      try {
        await deleteTask(task._id);
        
        // Call parent onDelete callback if provided
        if (onDelete) {
          onDelete(task._id);
        }
      } catch (error) {
        console.error('Error deleting task:', error);
        alert('Failed to delete task. Please try again.');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  // Style configurations with defaults
  const priorityConfig = {
    low: { 
      bg: 'bg-green-100', 
      text: 'text-green-800', 
      border: 'border-green-200',
      icon: '🟢',
      label: 'low'
    },
    medium: { 
      bg: 'bg-yellow-100', 
      text: 'text-yellow-800', 
      border: 'border-yellow-200',
      icon: '🟡',
      label: 'medium'
    },
    high: { 
      bg: 'bg-red-100', 
      text: 'text-red-800', 
      border: 'border-red-200',
      icon: '🔴',
      label: 'high'
    }
  };

  const statusConfig = {
    active: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Active' },
    completed: { bg: 'bg-green-100', text: 'text-green-800', label: 'Completed' },
    paused: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Paused' },
    archived: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Archived' }
  };

  const frequencyConfig = {
    once: { icon: '📅', label: 'One-time' },
    daily: { icon: '🔄', label: 'Daily' },
    weekly: { icon: '📊', label: 'Weekly' },
    monthly: { icon: '📆', label: 'Monthly' },
    yearly: { icon: '🗓️', label: 'Yearly' }
  };

  // Safe property access with defaults
  const safePriority = task.priority || 'medium';
  const safeStatus = task.status || 'active';
  const safeFrequency = task.frequency || 'once';
  
  const currentPriority = priorityConfig[safePriority] || priorityConfig.medium;
  const currentStatus = statusConfig[safeStatus] || statusConfig.active;
  const currentFrequency = frequencyConfig[safeFrequency] || frequencyConfig.once;

  // Calculate task status
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !task.isCompleted;
  const isDueToday = task.dueDate && new Date(task.dueDate).toDateString() === new Date().toDateString();

  // Card styling based on status
  const getCardStyles = () => {
    if (task.isCompleted) {
      return 'border-green-200 bg-green-50';
    } else if (isOverdue) {
      return 'border-red-200 bg-red-50';
    } else if (isDueToday) {
      return 'border-yellow-200 bg-yellow-50';
    }
    return 'border-gray-200 bg-white';
  };

  // Format dates safely
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      if (date.toDateString() === today.toDateString()) {
        return 'Today';
      } else if (date.toDateString() === tomorrow.toDateString()) {
        return 'Tomorrow';
      } else {
        return date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric',
          year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
        });
      }
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Invalid date';
    }
  };

  return (
    <div className={`rounded-xl shadow-sm border p-6 hover:shadow-md transition-all duration-200 ${getCardStyles()}`}>
      {/* Header Section */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          {/* Title and Status Badges */}
          <div className="flex items-start gap-3 mb-2">
            <h3 className={`text-lg font-semibold leading-tight ${
              task.isCompleted ? 'text-gray-500 line-through' : 'text-gray-900'
            }`}>
              {task.title}
            </h3>
            
            {/* Status Indicators */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {task.isCompleted && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Completed
                </span>
              )}
              
              {isOverdue && !task.isCompleted && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Overdue
                </span>
              )}
              
              {isDueToday && !task.isCompleted && !isOverdue && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  Due Today
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          {task.description && (
            <p className={`text-sm mb-3 leading-relaxed ${
              task.isCompleted ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {task.description}
            </p>
          )}
          
          {/* Tags and Metadata */}
          <div className="flex items-center gap-3 mb-3 flex-wrap">
            

{/* Recurring Task Info */}
{task.frequency !== 'once' && (
  <div className="mb-2 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full inline-flex items-center">
    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
    </svg>
    Recurring {task.frequency}
    {task.totalCompletions > 0 && (
      <span className="ml-1 bg-blue-200 text-blue-800 px-1.5 py-0.5 rounded-full text-xs">
        ✓ {task.totalCompletions}
      </span>
    )}
  </div>
)}

            {/* Priority Badge */}
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${currentPriority.bg} ${currentPriority.text}`}>
              <span className="mr-1">{currentPriority.icon}</span>
              {currentPriority.label} priority
            </span>

            {/* Status Badge */}
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${currentStatus.bg} ${currentStatus.text}`}>
              {currentStatus.label}
            </span>
            
            {/* Frequency Badge */}
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
              <span className="mr-1">{currentFrequency.icon}</span>
              {currentFrequency.label}
            </span>
            
            {/* Category Badge */}
            {task.category && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
                {task.category}
              </span>
            )}
          </div>

          {/* Due Date Information */}
          {task.dueDate && (
            <div className={`text-sm flex items-center ${
              isOverdue ? 'text-red-600 font-medium' : 
              isDueToday ? 'text-yellow-600 font-medium' :
              task.isCompleted ? 'text-gray-400' : 'text-gray-500'
            }`}>
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Due: {formatDate(task.dueDate)}
              
              {/* Completion Date */}
              {task.isCompleted && task.completedAt && (
                <span className="ml-3 text-green-600">
                  <svg className="w-4 h-4 mr-1 inline" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Completed: {formatDate(task.completedAt)}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        {/* Completion Button */}
        <button
          onClick={handleToggleComplete}
          disabled={isCompleting || isDeleting}
          className={`inline-flex items-center px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
            task.isCompleted
              ? 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-2 focus:ring-gray-500'
              : 'bg-green-600 text-white hover:bg-green-700 focus:ring-2 focus:ring-green-500'
          } focus:ring-offset-2`}
        >
          {isCompleting ? (
            <>
              <div className="w-4 h-4 mr-2 animate-spin border-2 border-white border-t-transparent rounded-full"></div>
              Updating...
            </>
          ) : task.isCompleted ? (
            <>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 11l3-3m0 0l3 3m-3-3v8m0-13a9 9 0 110 18 9 9 0 010-18z" />
              </svg>
              Mark Incomplete
            </>
          ) : (
            <>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Mark Complete
            </>
          )}
        </button>
        
        {/* Edit and Delete Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit?.(task)}
            disabled={isCompleting || isDeleting}
            className="p-2 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Edit task"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          
          <button
            onClick={handleDelete}
            disabled={isCompleting || isDeleting}
            className="p-2 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Delete task"
          >
            {isDeleting ? (
              <div className="w-5 h-5 animate-spin border-2 border-red-600 border-t-transparent rounded-full"></div>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          )}
        </button>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
