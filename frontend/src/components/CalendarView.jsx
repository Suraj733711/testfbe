import React from 'react';

const CalendarView = ({ tasks, onTaskClick }) => {
  const [currentDate, setCurrentDate] = React.useState(new Date());

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  
  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const year = currentDate.getFullYear();

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const days = [];
  // Fill in prefix empty slots
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(<div key={`prefix-${i}`} className="calendar-cell prefix"></div>);
  }

  // Fill in actual days
  for (let d = 1; d <= daysInMonth; d++) {
    const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), d).toDateString();
    
    // Find tasks for this day
    const dayTasks = tasks.filter(task => {
      const taskDate = new Date(task.due_date);
      return taskDate.getDate() === d && 
             taskDate.getMonth() === currentDate.getMonth() && 
             taskDate.getFullYear() === currentDate.getFullYear();
    });

    days.push(
      <div key={d} className={`calendar-cell ${isToday ? 'today' : ''}`}>
        <div className="day-number">{d}</div>
        <div className="calendar-tasks">
          {dayTasks.map(task => (
            <div 
              key={task.id} 
              className={`task-chip ${task.priority} ${task.status === 'done' ? 'done' : ''}`}
              title={task.title}
              onClick={(e) => {
                e.stopPropagation();
                onTaskClick(task);
              }}
            >
              {task.title}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card">
      <div className="view-header">
        <div className="title-group">
          <h1>{monthName} {year}</h1>
          <p>Monthly Task Distribution</p>
        </div>
        <div className="calendar-nav">
          <button className="btn btn-ghost" onClick={prevMonth}>&larr;</button>
          <button className="btn btn-ghost" onClick={() => setCurrentDate(new Date())}>Today</button>
          <button className="btn btn-ghost" onClick={nextMonth}>&rarr;</button>
        </div>
      </div>

      <div className="calendar-grid">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="calendar-day-header">{day}</div>
        ))}
        {days}
      </div>
    </div>
  );
};

export default CalendarView;
