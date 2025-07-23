import React, { useState } from 'react';
import TaskCard from './TaskCard';
import TaskForm from './TaskForm';
import { useTasks } from '../../hooks/useTasks';

const TaskList = ({ tasks, filter, onTaskComplete, showOverdue, overdueTasks }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [currentFilter, setCurrentFilter] = useState(filter || 'all');
  const { deleteTask, loading, getTasksByFilter } = useTasks();

  // Use the hook's filtering method or local filtering
  const filteredTasks = React.useMemo(() => {
    let filtered = tasks;
    
    // Apply current filter
    if (currentFilter === 'all') {
      filtered = tasks;
    } else if (currentFilter === 'completed') {
      filtered = tasks.filter(task => task.isCompleted); // Fixed: use isCompleted
    } else if (currentFilter === 'pending') {
      filtered = tasks.filter(task => !task.isCompleted); // Fixed: use isCompleted
    } else if (currentFilter === 'active') {
      filtered = tasks.filter(task => task.status === 'active' && !task.isCompleted);
    } else if (currentFilter === 'high') {
      filtered = tasks.filter(task => task.priority === 'high');
    } else if (currentFilter === 'medium') {
      filtered = tasks.filter(task => task.priority === 'medium');
    } else if (currentFilter === 'low') {
      filtered = tasks.filter(task => task.priority === 'low');
    } else if (currentFilter === 'today') {
      const today = new Date().toISOString().slice(0, 10);
      filtered = tasks.filter(task => {
        return task.dueDate && new Date(task.dueDate).toISOString().slice(0, 10) === today;
      });
    } else if (currentFilter === 'overdue') {
      const now = new Date();
      filtered = tasks.filter(task => {
        return task.dueDate && new Date(task.dueDate) < now && !task.isCompleted;
      });
    }

    return filtered;
  }, [tasks, currentFilter]);

  const handleEdit = (task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  const handleDelete = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTask(taskId);
      } catch (error) {
        console.error('Error deleting task:', error);
        alert('Failed to delete task. Please try again.');
      }
    }
  };

  const handleAddTask = () => {
    setEditingTask(null);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingTask(null);
  };

  const filterOptions = [
    { value: 'all', label: 'All Tasks', icon: '📋' },
    { value: 'pending', label: 'Pending', icon: '⏳' },
    { value: 'completed', label: 'Completed', icon: '✅' },
    { value: 'active', label: 'Active', icon: '🎯' },
    { value: 'today', label: 'Due Today', icon: '🗓️' },
    { value: 'overdue', label: 'Overdue', icon: '⚠️' },
    { value: 'high', label: 'High Priority', icon: '🔴' },
    { value: 'medium', label: 'Medium Priority', icon: '🟡' },
    { value: 'low', label: 'Low Priority', icon: '🟢' }
  ];

  // Calculate counts for filter badges
  const filterCounts = React.useMemo(() => {
    return {
      all: tasks.length,
      pending: tasks.filter(t => !t.isCompleted).length,
      completed: tasks.filter(t => t.isCompleted).length,
      active: tasks.filter(t => t.status === 'active' && !t.isCompleted).length,
      today: tasks.filter(t => {
        const today = new Date().toISOString().slice(0, 10);
        return t.dueDate && new Date(t.dueDate).toISOString().slice(0, 10) === today;
      }).length,
      overdue: tasks.filter(t => {
        const now = new Date();
        return t.dueDate && new Date(t.dueDate) < now && !t.isCompleted;
      }).length,
      high: tasks.filter(t => t.priority === 'high').length,
      medium: tasks.filter(t => t.priority === 'medium').length,
      low: tasks.filter(t => t.priority === 'low').length,
    };
  }, [tasks]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Tasks ({filteredTasks.length})
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Manage your tasks and stay organized
          </p>
        </div>
        <button
          onClick={handleAddTask}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>Add Task</span>
        </button>
      </div>

      {/* Filter Tabs with counts */}
      <div className="flex flex-wrap gap-2 mb-6 pb-4 border-b border-gray-200">
        {filterOptions.map(option => {
          const count = filterCounts[option.value];
          return (
            <button
              key={option.value}
              onClick={() => setCurrentFilter(option.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 ${
                currentFilter === option.value
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <span>{option.icon}</span>
              <span>{option.label}</span>
              {count > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  currentFilter === option.value
                    ? 'bg-blue-200 text-blue-800'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Task Count Info */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <span>
            Showing {filteredTasks.length} of {tasks.length} tasks
          </span>
          {currentFilter !== 'all' && (
            <button
              onClick={() => setCurrentFilter('all')}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Clear filter
            </button>
          )}
        </div>
      </div>

      {/* Task List */}
      {filteredTasks.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {currentFilter === 'all' ? 'No tasks found' : `No ${currentFilter} tasks`}
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            {currentFilter === 'all' 
              ? 'Create your first task to get started with your productivity journey!'
              : `No tasks match the ${currentFilter} filter. Try a different filter or create a new task.`
            }
          </p>
          <button
            onClick={handleAddTask}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors inline-flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Create Your First Task</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTasks.map(task => (
            <TaskCard
              key={task._id}
              task={task}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Task Form Modal */}
      {showForm && (
        <TaskForm
          task={editingTask}
          onClose={handleCloseForm}
        />
      )}
    </div>
  );
};

export default TaskList;
