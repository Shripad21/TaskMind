// hooks/useTasks.js
import { useState, useEffect } from 'react';
import { api } from '../services/api';

export const useTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTasks = async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value);
        }
      });
      
      const queryString = params.toString();
      const url = queryString ? `/tasks?${queryString}` : '/tasks';
      
      const response = await api.get(url);
      console.log('Fetched tasks with recurring reset:', response.data.length);
      setTasks(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch tasks');
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (taskData) => {
    try {
      console.log('Creating task with data:', taskData);
      const response = await api.post('/tasks', taskData);
      console.log('Server response:', response.data);
      
      if (!response.data || !response.data._id) {
        throw new Error('Invalid task data received from server');
      }
      
      setTasks(prev => [...prev, response.data]);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to create task';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const updateTask = async (id, updates) => {
    try {
      const response = await api.put(`/tasks/${id}`, updates);
      setTasks(prev => prev.map(task => 
        task._id === id ? response.data : task
      ));
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to update task';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const markTaskCompleted = async (id, isCompleted = true) => {
    try {
      const updates = {
        isCompleted,
        status: isCompleted ? 'completed' : 'active',
        completedAt: isCompleted ? new Date().toISOString() : null
      };
      
      // For recurring tasks, also increment total completions
      const task = tasks.find(t => t._id === id);
      if (task && isCompleted && task.frequency !== 'once') {
        updates.totalCompletions = (task.totalCompletions || 0) + 1;
        updates.lastCompletedDate = new Date().toISOString().slice(0, 10);
      }
      
      return await updateTask(id, updates);
    } catch (err) {
      throw new Error('Failed to update task completion status');
    }
  };

  const deleteTask = async (id) => {
    try {
      await api.delete(`/tasks/${id}`);
      setTasks(prev => prev.filter(task => task._id !== id));
      
      // Trigger refresh of related data
      window.dispatchEvent(new CustomEvent('taskDeleted', { 
        detail: { taskId: id } 
      }));
      
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to delete task';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Filter methods (updated to work with recurring tasks)
  const getTasksByFilter = (filter) => {
    if (filter === 'all') return tasks;
    if (filter === 'completed') return tasks.filter(task => task.isCompleted);
    if (filter === 'pending') return tasks.filter(task => !task.isCompleted);
    if (filter === 'active') return tasks.filter(task => task.status === 'active');
    if (filter === 'recurring') return tasks.filter(task => task.frequency !== 'once');
    if (filter === 'high') return tasks.filter(task => task.priority === 'high');
    if (filter === 'medium') return tasks.filter(task => task.priority === 'medium');
    if (filter === 'low') return tasks.filter(task => task.priority === 'low');
    return tasks;
  };

  const getRecurringTasks = () => {
    return tasks.filter(task => task.frequency !== 'once');
  };

  const getCompletedTasks = () => {
    return tasks.filter(task => task.isCompleted);
  };

  const getPendingTasks = () => {
    return tasks.filter(task => !task.isCompleted && task.status === 'active');
  };

  const getTasksDueSoon = (days = 7) => {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + days);
    
    return tasks.filter(task => {
      if (!task.dueDate || task.isCompleted) return false;
      const dueDate = new Date(task.dueDate);
      return dueDate <= targetDate && dueDate >= new Date();
    });
  };

  const getOverdueTasks = () => {
    const today = new Date();
    return tasks.filter(task => {
      if (!task.dueDate || task.isCompleted) return false;
      return new Date(task.dueDate) < today;
    });
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return {
    tasks,
    loading,
    error,
    createTask,
    updateTask,
    deleteTask,
    markTaskCompleted,
    refetch: fetchTasks,
    
    // Filter methods
    getTasksByFilter,
    getRecurringTasks,
    getCompletedTasks,
    getPendingTasks,
    getTasksDueSoon,
    getOverdueTasks,
    
    // Server-side filtering
    fetchTasksWithFilters: fetchTasks
  };
};
