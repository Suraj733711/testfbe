from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
import json
import uuid
from datetime import datetime
import google.generativeai as genai

from database import get_db
from models import Task
from schemas import ChatRequest
from config import settings
from logger import logger

router = APIRouter()

@router.post("")
def chat_with_gemini(req: ChatRequest, db: Session = Depends(get_db)):
    logger.info("Received chat request for Gemini AI.")
    if not settings.GEMINI_API_KEY:
        logger.error("Gemini API key is not configured.")
        return {"response": "I cannot help you yet, because the Gemini API key has not been configured in the backend environment."}
    
    tasks = db.query(Task).all()
    tasks_context = json.dumps([
        {
            "id": t.id, 
            "title": t.title, 
            "status": t.status, 
            "priority": t.priority,
            "due_date": t.due_date.isoformat()
        } for t in tasks
    ])
    
    current_time = datetime.now().isoformat()

    system_instruction = f"""
    You are Vegeta, the Prince of all Saiyans! You are acting as a fierce but effective task management assistant for this human.
    Current System Date and Time: {current_time}
    
    Current user tasks:
    {tasks_context}
    
    The user is going to give you a request. It could be text or transcribed speech.
    Determine if the user is asking you to manipulate tasks (create, update, delete) or just asking a general question about their tasks.
    You must return a STRICTLY VALID JSON object with this exact structure:
    {{
        "response": "<A prideful, arrogant, but helpful response as Vegeta. Use your typical personality (boasting, calling things pathetic, asserting dominance), but keep it heavily concise and strictly related to the task execution. Do not use emojis since this will be read out loud.>",
        "actions": [
            {{
                "action": "create" | "update" | "delete",
                "task_id": "<id for update/delete>",
                "title": "<title for create/update>",
                "status": "<todo, in-progress, or done>",
                "priority": "<low, medium, or high>",
                "due_date": "<ISO 8601 datestring>"
            }}
        ]
    }}
    If no actions are required, leave the actions array empty []. The response property is required and should answer the user like the Prince of all Saiyans.
    If the human DOES NOT provide a specific date or time to complete a task, you MUST default the `due_date` to the end of the Current System Date (23:59:00).
    """

    try:
        logger.debug(f"Sending prompt to Gemini: {req.message}")
        model = genai.GenerativeModel('gemini-2.5-flash', system_instruction=system_instruction)
        result = model.generate_content(
            req.message,
            generation_config=genai.GenerationConfig(
                response_mime_type="application/json",
                temperature=0.2
            )
        )
        
        data = json.loads(result.text)
        actions_run = 0
        
        logger.info(f"Gemini responded with {len(data.get('actions', []))} actions.")
        
        for action in data.get("actions", []):
            act_type = action.get("action")
            logger.info(f"Executing Gemini action: {act_type} on task: {action.get('task_id', 'new task')}")
            if act_type == "create":
                dt = datetime.utcnow()
                if action.get("due_date"):
                    try:
                        from dateutil import parser as dparser
                        dt = dparser.isoparse(action["due_date"])
                    except Exception as parse_e:
                        logger.warning(f"Failed to parse date from Gemini: {parse_e}")
                        
                new_task = Task(
                    id=str(uuid.uuid4()),
                    title=action.get("title", "New Task"),
                    status=action.get("status", "todo"),
                    priority=action.get("priority", "medium"),
                    due_date=dt
                )
                db.add(new_task)
                db.commit()
                actions_run += 1
                logger.info(f"Gemini effectively created task ID: {new_task.id}")
                
            elif act_type == "update":
                tid = action.get("task_id")
                if tid:
                    task = db.query(Task).filter(Task.id == tid).first()
                    if task:
                        if "title" in action: task.title = action["title"]
                        if "status" in action: task.status = action["status"]
                        if "priority" in action: task.priority = action["priority"]
                        db.commit()
                        actions_run += 1
                        logger.info(f"Gemini accurately updated task ID: {tid}")
                    else:
                        logger.warning(f"Task ID {tid} explicitly requested by Gemini not found in DB.")
                        
            elif act_type == "delete":
                tid = action.get("task_id")
                if tid:
                    task = db.query(Task).filter(Task.id == tid).first()
                    if task:
                        db.delete(task)
                        db.commit()
                        actions_run += 1
                        logger.info(f"Gemini deleted task ID: {tid}")
                    else:
                        logger.warning(f"Task ID {tid} explicitly requested by Gemini for deletion not found.")

        logger.info("Successfully completed Gemini operations.")
        return {
            "response": data.get("response", "I have updated your tasks."),
            "actions_executed": actions_run
        }

    except Exception as e:
        logger.error(f"Gemini API Error details: {str(e)}", exc_info=True)
        return {
            "response": f"I encountered an error trying to process your command: {str(e)}",
            "actions_executed": 0
        }
