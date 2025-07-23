import React, { useState, useEffect } from 'react';
import { useTasks } from '../../hooks/useTasks';
import { useStreaks } from '../../hooks/useStreaks';
import TaskList from '../../components/tasks/TaskList';
import StreakDisplay from './StreakDisplay';
import DailySummary from './DailySummary';

const Dashboard = () => {
  const { 
    tasks, 
    loading, 
    error,
    getTasksByFilter,
    getCompletedTasks,
    getPendingTasks,
    getOverdueTasks,
    markTaskCompleted 
  } = useTasks();
  
  const { 
    streaks, 
    dailySummary, 
    markTaskComplete,
    loading: streaksLoading 
  } = useStreaks();
  
  const [filter, setFilter] = useState('all');

  // Better calculation using the updated model
  const completedTasks = getCompletedTasks();
  const pendingTasks = getPendingTasks();
  const overdueTasks = getOverdueTasks();
  
  // Tasks completed today specifically
  const completedToday = tasks.filter(task => {
    if (!task.isCompleted || !task.completedAt) return false;
    const completedDate = new Date(task.completedAt).toISOString().slice(0, 10);
    const today = new Date().toISOString().slice(0, 10);
    return completedDate === today;
  }).length;

  const totalTasks = tasks.length;

  // Handle task completion with both streak and task updates
  const handleTaskComplete = async (taskId) => {
    try {
      // Mark task as completed in tasks
      await markTaskCompleted(taskId, true);
      
      // Mark task complete for streaks/daily summary
      await markTaskComplete(taskId);
    } catch (error) {
      console.error('Error completing task:', error);
    }
  };

  // Get filtered tasks
  const filteredTasks = getTasksByFilter(filter);

  if (loading || streaksLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading your dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Good morning! 👋
        </h1>
        <p className="text-gray-600">
          Here's what you have planned for today
        </p>
        {error && (
          <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Tasks</p>
              <p className="text-2xl font-bold text-gray-900">{totalTasks}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed Today</p>
              <p className="text-2xl font-bold text-green-600">{completedToday}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-orange-600">{pendingTasks.length}</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Daily Streak</p>
              <p className="text-2xl font-bold text-purple-600">{dailySummary?.streakCount || 0}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      {/* <div className="mb-6">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
          {[
            { key: 'all', label: 'All Tasks' },
            { key: 'pending', label: 'Pending' },
            { key: 'completed', label: 'Completed' },
            { key: 'high', label: 'High Priority' }
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === key
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div> */}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Task List */}
        <div className="lg:col-span-2">
          <TaskList 
            tasks={filteredTasks} 
            filter={filter}
            onTaskComplete={handleTaskComplete}
            showOverdue={overdueTasks.length > 0}
            overdueTasks={overdueTasks}
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <StreakDisplay streaks={streaks} />
          <DailySummary 
            summary={dailySummary} 
            completedToday={completedToday}
            totalTasks={totalTasks}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
