import React from 'react';
import { useNavigate } from 'react-router-dom';

const DailySummary = ({ summary, completedToday, totalTasks }) => {
  const navigate = useNavigate();
  
  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const defaultSummary = {
    date: new Date().toISOString().slice(0, 10),
    tasksCompleted: completedToday || 0,
    completedTaskIds: [],
    streakCount: 0
  };

  const currentSummary = summary || defaultSummary;
  
  // Use actual completed today count
  const tasksCompletedToday = completedToday || currentSummary.tasksCompleted;
  
  // Calculate progress percentage
  const progressPercentage = totalTasks > 0 
    ? Math.min((tasksCompletedToday / totalTasks) * 100, 100) 
    : 0;

  const getMotivationalMessage = () => {
    if (tasksCompletedToday === 0) {
      return "Start your day by completing your first task!";
    } else if (tasksCompletedToday >= totalTasks) {
      return "Outstanding! All tasks completed today! 🎉";
    } else if (tasksCompletedToday >= totalTasks * 0.8) {
      return "Amazing! You're almost done for the day!";
    } else if (tasksCompletedToday >= totalTasks * 0.5) {
      return "Great progress! You're halfway there!";
    } else {
      return `You've completed ${tasksCompletedToday} tasks. Keep up the momentum!`;
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        📊 Daily Summary
      </h3>
      
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <p className="text-sm text-gray-600">{today}</p>
          <span className="text-xs text-gray-500">
            {tasksCompletedToday}/{totalTasks} completed
          </span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-green-400 to-blue-500 transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Tasks Completed</p>
              <p className="text-xs text-gray-500">Great progress today!</p>
            </div>
          </div>
          <span className="text-lg font-bold text-green-600">
            {tasksCompletedToday}
          </span>
        </div>

        <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Daily Streak</p>
              <p className="text-xs text-gray-500">Keep it going!</p>
            </div>
          </div>
          <span className="text-lg font-bold text-purple-600">
            {currentSummary.streakCount}
          </span>
        </div>

        {/* Motivational Message */}
        <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-lg">💡</span>
            <p className="text-sm font-medium text-blue-900">Today's Insight</p>
          </div>
          <p className="text-sm text-blue-800">
            {getMotivationalMessage()}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="mt-4 space-y-2">
          <button 
            onClick={() => navigate('/tasks/new')}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 px-4 rounded-lg font-medium text-sm hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
          >
            Add New Task
          </button>
          <button 
            onClick={() => navigate('/tasks')}
            className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-lg font-medium text-sm hover:bg-gray-50 transition-colors"
          >
            View All Tasks
          </button>
        </div>
      </div>
    </div>
  );
};

export default DailySummary;
