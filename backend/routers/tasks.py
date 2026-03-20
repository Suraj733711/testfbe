from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List
import uuid

from database import get_db
from models import Task
from schemas import TaskResponse, TaskCreate, TaskUpdate
from logger import logger

router = APIRouter()

@router.get("", response_model=List[TaskResponse])
def get_tasks(db: Session = Depends(get_db)):
    logger.info("Fetching all tasks from the database.")
    tasks = db.query(Task).order_by(Task.due_date.asc()).all()
    logger.info(f"Retrieved {len(tasks)} tasks.")
    return tasks

@router.get("/{task_id}", response_model=TaskResponse)
def get_task(task_id: str, db: Session = Depends(get_db)):
    logger.info(f"Fetching task with id: {task_id}")
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        logger.warning(f"Task {task_id} not found.")
        raise HTTPException(status_code=404, detail="Task not found")
    return task

@router.post("", response_model=TaskResponse, status_code=201)
def create_task(task_in: TaskCreate, db: Session = Depends(get_db)):
    logger.info(f"Creating new task: '{task_in.title}' priority: {task_in.priority}")
    new_task = Task(
        id=str(uuid.uuid4()),
        **task_in.dict()
    )
    db.add(new_task)
    db.commit()
    db.refresh(new_task)
    logger.info(f"Task created successfully. ID: {new_task.id}")
    return new_task

@router.patch("/{task_id}", response_model=TaskResponse)
def update_task(task_id: str, task_in: TaskUpdate, db: Session = Depends(get_db)):
    logger.info(f"Updating task: {task_id}")
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        logger.error(f"Failed to update task. Task {task_id} not found.")
        raise HTTPException(status_code=404, detail="Task not found")
    
    update_data = task_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(task, field, value)
    
    db.commit()
    db.refresh(task)
    logger.info(f"Task {task_id} updated successfully.")
    return task

@router.delete("/{task_id}")
def delete_task(task_id: str, db: Session = Depends(get_db)):
    logger.info(f"Deleting task: {task_id}")
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        logger.warning(f"Failed to delete task. Task {task_id} not found.")
        raise HTTPException(status_code=404, detail="Task not found")
    db.delete(task)
    db.commit()
    logger.info(f"Task {task_id} deleted successfully.")
    return {"message": "Task deleted successfully"}
