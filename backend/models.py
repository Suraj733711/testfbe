from sqlalchemy import Column, String, Text, DateTime
from datetime import datetime
from database import Base

class Task(Base):
    __tablename__ = "tasks"
    
    id = Column(String, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String, default="todo") # todo, in-progress, done
    priority = Column(String, default="medium") # low, medium, high
    category = Column(String, default="General")
    due_date = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
