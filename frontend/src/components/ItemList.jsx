import React from 'react';

const ItemList = ({ items, onEdit, onDelete }) => {
  if (items.length === 0) {
    return (
      <div className="glass-card" style={{ textAlign: 'center', padding: '4rem' }}>
        <p style={{ color: '#94a3b8' }}>No tasks found in this view. Ready for a new one? 🚀</p>
      </div>
    );
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6366f1';
    }
  };

  return (
    <div className="glass-card">
      <div className="view-header">
        <div className="title-group">
          <h1>Master Task Board</h1>
          <p>Complete history and future planning</p>
        </div>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1.5rem' }}>
        {items.map(item => (
          <div key={item.id} className="timeline-item" style={{ cursor: 'pointer' }} onClick={() => onEdit(item)}>
            <div className="timeline-content">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="timeline-title">
                  <span className={`priority-dot ${item.priority}`} />
                  {item.title}
                  <span style={{ 
                    fontSize: '0.65rem', 
                    padding: '0.1rem 0.4rem', 
                    borderRadius: '4px', 
                    background: 'rgba(255,255,255,0.05)',
                    color: '#64748b',
                    marginLeft: '0.5rem'
                  }}>
                    {item.status.toUpperCase()}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button 
                    className="btn btn-ghost" 
                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem' }}
                    onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
                  >
                    Delete
                  </button>
                </div>
              </div>
              <p style={{ margin: '0.25rem 0', color: '#64748b', fontSize: '0.85rem' }}>
                Due: {new Date(item.due_date).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ItemList;
