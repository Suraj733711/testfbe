import React from 'react';

const DailyView = ({ tasks, onTaskClick }) => {
  const today = new Date();
  
  const todayTasks = tasks.filter(task => {
    const taskDate = new Date(task.due_date);
    return taskDate.getDate() === today.getDate() && 
           taskDate.getMonth() === today.getMonth() && 
           taskDate.getFullYear() === today.getFullYear();
  });

  return (
    <div className="glass-card">
      <div className="view-header">
        <div className="title-group">
          <h1>Today's Perspective</h1>
          <p>{today.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        </div>
      </div>

      <div className="daily-timeline">
        {todayTasks.length > 0 ? (
          todayTasks.map(task => {
            const time = new Date(task.due_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            return (
              <div key={task.id} className="timeline-item" onClick={() => onTaskClick(task)}>
                <div className="timeline-time">{time}</div>
                <div className="timeline-content">
                  <div className="timeline-title">
                    <span className={`priority-dot ${task.priority}`} />
                    {task.title}
                  </div>
                  <p className="timeline-desc">{task.description || 'No description provided.'}</p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="empty-state" style={{ textAlign: 'center', padding: '3rem 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <img src="/vegeta.png" alt="Vegeta Power Up" style={{ width: '150px', borderRadius: '16px', marginBottom: '1rem', boxShadow: '0 4px 15px rgba(245, 158, 11, 0.4)' }} />
            <p style={{ color: '#94a3b8', fontStyle: 'italic' }}>No tasks scheduled for today. Time to hit the gravity chamber! 💥</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyView;
