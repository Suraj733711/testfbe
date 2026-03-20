import { useState, useEffect, useCallback } from 'react';
import ItemList from './components/ItemList';
import './App.css';

// Use environment variable for API URL, fallback to localhost for development
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function App() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connected, setConnected] = useState(false);
  const [toast, setToast] = useState(null);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  // Fetch items
  const fetchItems = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/items`);
      if (!response.ok) throw new Error('Failed to fetch items');
      const data = await response.json();
      setItems(data);
      setConnected(true);
      setError(null);
    } catch (err) {
      setError('Unable to connect to the API. Make sure the backend is running.');
      setConnected(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // Create item
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/api/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), description: description.trim() || null }),
      });
      if (!response.ok) throw new Error('Failed to create item');
      const newItem = await response.json();
      setItems((prev) => [newItem, ...prev]);
      setTitle('');
      setDescription('');
      showToast('✨ Item created successfully!');
    } catch (err) {
      setError('Failed to create item. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete item
  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${API_URL}/api/items/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete item');
      setItems((prev) => prev.filter((item) => item.id !== id));
      showToast('🗑️ Item deleted');
    } catch (err) {
      setError('Failed to delete item. Please try again.');
    }
  };

  return (
    <div className="app">
      <div className="container">
        {/* Header */}
        <header className="header">
          <div className="header__badge">
            <span className="header__badge-dot" />
            React + FastAPI
          </div>
          <h1 className="header__title">Task Dashboard</h1>
          <p className="header__subtitle">
            A beautifully crafted full-stack app — React on Vercel, FastAPI on Render
          </p>
        </header>

        {/* Status Bar */}
        <div className="status-bar">
          <div className="status-bar__info">
            <span
              className={`status-bar__indicator ${
                connected
                  ? 'status-bar__indicator--connected'
                  : 'status-bar__indicator--disconnected'
              }`}
            >
              ● {connected ? 'Connected' : 'Disconnected'}
            </span>
            <span className="status-bar__count">
              {items.length} item{items.length !== 1 ? 's' : ''}
            </span>
          </div>
          <span className="status-bar__count" style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
            API: {API_URL}
          </span>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="error-banner">
            ⚠️ {error}
          </div>
        )}

        {/* Create Form */}
        <form className="create-form" onSubmit={handleCreate} id="create-item-form">
          <h2 className="create-form__header">✦ Create New Item</h2>
          <div className="create-form__fields">
            <input
              id="item-title-input"
              className="create-form__input"
              type="text"
              placeholder="Item title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <textarea
              id="item-description-input"
              className="create-form__input create-form__textarea"
              placeholder="Description (optional)..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="create-form__actions">
            <button
              id="create-item-button"
              type="submit"
              className="btn btn--primary"
              disabled={submitting || !title.trim()}
            >
              {submitting ? 'Creating...' : '+ Add Item'}
            </button>
          </div>
        </form>

        {/* Item List */}
        {loading ? (
          <div className="loading">
            <div className="loading__spinner" />
            <span className="loading__text">Connecting to API...</span>
          </div>
        ) : (
          <ItemList items={items} onDelete={handleDelete} />
        )}

        {/* Toast */}
        {toast && <div className="toast">{toast}</div>}
      </div>
    </div>
  );
}

export default App;
