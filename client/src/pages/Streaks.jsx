import React from 'react';
import { useStreaks } from '../hooks/useStreaks';
import { useTasks } from '../hooks/useTasks';
import StreakDisplay from '../components/dashboard/StreakDisplay';

const Streaks = () => {
  const { streaks, dailySummary, loading, error, getTotalActiveStreaks, getLongestStreak } = useStreaks();
  const { tasks } = useTasks();

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const activeStreaks = getTotalActiveStreaks();
  const longestStreak = getLongestStreak();
  const recurringTasks = tasks.filter(task => task.frequency !== 'once');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Streaks & Habits</h1>
        <p className="text-gray-600 mt-2">
          Track your consistency and build lasting habits
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <span className="text-2xl">🔥</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Streaks</p>
              <p className="text-2xl font-bold text-orange-600">{activeStreaks}</p>
            </div>
          </div>
        </div>

        {/* <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <span className="text-2xl">🏆</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Longest Streak</p>
              <p className="text-2xl font-bold text-purple-600">{longestStreak}</p>
            </div>
          </div>
        </div> */}

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <span className="text-2xl">🔄</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Recurring Tasks</p>
              <p className="text-2xl font-bold text-blue-600">{recurringTasks.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-2xl">📅</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Daily Streak</p>
              <p className="text-2xl font-bold text-green-600">{dailySummary?.streakCount || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Streak Display */}
        <div className="lg:col-span-1">
          <StreakDisplay streaks={streaks} />
        </div>

        {/* Recurring Tasks */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              🔄 Recurring Tasks
            </h3>
            
            {recurringTasks.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <span className="text-4xl mb-4 block">📝</span>
                <p className="text-sm">No recurring tasks yet</p>
                <p className="text-xs text-gray-400">Create daily/weekly tasks to build streaks!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recurringTasks.map(task => (
                  <div key={task._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{task.title}</p>
                      <p className="text-xs text-gray-500">
                        {task.frequency} • {task.isCompleted ? 'Completed' : 'Pending'}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        task.isCompleted 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {task.frequency}
                      </span>
                      {task.totalCompletions > 0 && (
                        <span className="text-xs text-gray-500">
                          ✓ {task.totalCompletions}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tips Section */}
      <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">💡 Streak Building Tips</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-800">
          <div>
            <h4 className="font-medium mb-2">Start Small</h4>
            <p>Begin with achievable daily tasks to build momentum.</p>
          </div>
          <div>
            <h4 className="font-medium mb-2">Be Consistent</h4>
            <p>Consistency matters more than perfection in building habits.</p>
          </div>
          <div>
            <h4 className="font-medium mb-2">Track Progress</h4>
            <p>Visual progress tracking helps maintain motivation.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Streaks;
