import { useState, useEffect, useCallback } from 'react';
import CalendarView from './components/CalendarView';
import DailyView from './components/DailyView';
import ItemList from './components/ItemList';
import AIAssistant from './components/AIAssistant';
import './App.css';

// Using environment variable for API URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('daily'); // 'daily', 'calendar', 'all'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState(null); // For editing

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: 'todo',
    due_date: new Date().toISOString().slice(0, 16) // Default to now
  });

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/tasks`);
      if (res.ok) {
        const data = await res.json();
        setTasks(data);
      }
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = currentTask ? 'PATCH' : 'POST';
    const url = currentTask ? `${API_URL}/api/tasks/${currentTask.id}` : `${API_URL}/api/tasks`;
    
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setIsModalOpen(false);
        setFormData({ title: '', description: '', priority: 'medium', status: 'todo', due_date: new Date().toISOString().slice(0, 16) });
        setCurrentTask(null);
        fetchTasks();
      }
    } catch (err) {
      console.error('Submit error:', err);
    }
  };

  const handleEdit = (task) => {
    setCurrentTask(task);
    setFormData({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      status: task.status,
      due_date: new Date(task.due_date).toISOString().slice(0, 16)
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      await fetch(`${API_URL}/api/tasks/${id}`, { method: 'DELETE' });
      fetchTasks();
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="logo-section">
          <h2 className="title-group" style={{ fontSize: '1.2rem', color: 'white', fontWeight: 'bold' }}>
            <span style={{ color: '#f59e0b' }}>✦</span> CAPSULE CORP
          </h2>
        </div>
        <nav>
          <div className={`nav-link ${view === 'daily' ? 'active' : ''}`} onClick={() => setView('daily')}>
            <span>Today</span>
          </div>
          <div className={`nav-link ${view === 'calendar' ? 'active' : ''}`} onClick={() => setView('calendar')}>
            <span>Calendar</span>
          </div>
          <div className={`nav-link ${view === 'all' ? 'active' : ''}`} onClick={() => setView('all')}>
            <span>All Tasks</span>
          </div>
        </nav>
        <button className="btn btn-primary" onClick={() => { setIsModalOpen(true); setCurrentTask(null); }} style={{ width: '100%', marginTop: 'auto' }}>
          + New Task
        </button>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {loading ? (
          <div className="loading">Processing board...</div>
        ) : (
          <>
            {view === 'daily' && <DailyView tasks={tasks} onTaskClick={handleEdit} />}
            {view === 'calendar' && <CalendarView tasks={tasks} onTaskClick={handleEdit} />}
            {view === 'all' && <ItemList items={tasks} onEdit={handleEdit} onDelete={handleDelete} />}
          </>
        )}
      </main>

      {/* Modern Modal Form */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 style={{ marginBottom: '1.5rem' }}>{currentTask ? '✦ Edit Task' : '✦ Create Task'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Title</label>
                <input 
                  className="form-input" required 
                  value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                  placeholder="Task title..."
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea 
                  className="form-input" 
                  value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                  placeholder="Additional context..."
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Priority</label>
                  <select className="form-input" value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Due Date</label>
                  <input 
                    type="datetime-local" className="form-input" required
                    value={formData.due_date} onChange={e => setFormData({...formData, due_date: e.target.value})}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Status</label>
                <select className="form-input" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="done">Completed</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setIsModalOpen(false)} style={{ flex: 1 }}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  {currentTask ? 'Save Changes' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Global AI Assistant */}
      <AIAssistant onUpdate={fetchTasks} apiUrl={API_URL} />
    </div>
  );
}

export default App;
