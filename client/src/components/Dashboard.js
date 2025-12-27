import React, { useState, useEffect } from 'react';
import { studentsAPI, tasksAPI } from '../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeStudents: 0,
    pendingTasks: 0,
    completedTasks: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [studentsRes, tasksRes] = await Promise.all([
          studentsAPI.getAll(),
          tasksAPI.getAll()
        ]);

        const students = studentsRes.data;
        const tasks = tasksRes.data;

        setStats({
          totalStudents: students.length,
          activeStudents: students.filter(s => s.status === 'active' || s.status === 'applied').length,
          pendingTasks: tasks.filter(t => t.status === 'pending' || t.status === 'in_progress').length,
          completedTasks: tasks.filter(t => t.status === 'completed').length
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <div className="dashboard-loading">Loading...</div>;
  }

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Students</h3>
          <p className="stat-number">{stats.totalStudents}</p>
        </div>
        <div className="stat-card">
          <h3>Active Students</h3>
          <p className="stat-number">{stats.activeStudents}</p>
        </div>
        <div className="stat-card">
          <h3>Pending Tasks</h3>
          <p className="stat-number">{stats.pendingTasks}</p>
        </div>
        <div className="stat-card">
          <h3>Completed Tasks</h3>
          <p className="stat-number">{stats.completedTasks}</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

