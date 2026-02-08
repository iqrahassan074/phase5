from fastapi import FastAPI, HTTPException
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
from dapr.clients import DaprClient

app = FastAPI()

class Task(BaseModel):
    id: Optional[str] = None
    title: str
    description: Optional[str] = None
    dueDate: Optional[datetime] = None
    priority: Optional[str] = None
    tags: Optional[List[str]] = None
    isCompleted: bool = False
    recurrence: Optional[str] = None
    createdAt: Optional[datetime] = None

# In-memory store for demonstration purposes
tasks_db: List[Task] = []

DAPR_PUBSUB_NAME = "pubsub.kafka"
TASK_EVENTS_TOPIC = "task-events"

@app.post("/tasks", response_model=Task)
async def create_task(task: Task):
    task.id = str(len(tasks_db) + 1) # Simple ID generation
    task.createdAt = datetime.now()
    tasks_db.append(task)
    
    with DaprClient() as client:
        client.publish_event(
            pubsub_name=DAPR_PUBSUB_NAME,
            topic_name=TASK_EVENTS_TOPIC,
            data=task.json(),
            data_content_type='application/json',
            # headers={'dapr-pubsub-routing-key': task.id} # Optional: for routing if needed
        )
    return task

@app.get("/tasks", response_model=List[Task])
async def get_tasks(task_id: Optional[str] = None, page: int = 1, limit: int = 10):
    if task_id:
        filtered_tasks = [task for task in tasks_db if task.id == task_id]
        if not filtered_tasks:
            raise HTTPException(status_code=404, detail="Task not found")
        return filtered_tasks

    start_index = (page - 1) * limit
    end_index = start_index + limit
    return tasks_db[start_index:end_index]


@app.put("/tasks/{task_id}", response_model=Task)
async def update_task(task_id: str, updated_task: Task):
    for idx, task in enumerate(tasks_db):
        if task.id == task_id:
            tasks_db[idx] = updated_task
            
            with DaprClient() as client:
                client.publish_event(
                    pubsub_name=DAPR_PUBSUB_NAME,
                    topic_name=TASK_EVENTS_TOPIC,
                    data=updated_task.json(),
                    data_content_type='application/json',
                    # headers={'dapr-pubsub-routing-key': task.id} # Optional
                )
            return updated_task
    raise HTTPException(status_code=404, detail="Task not found")

@app.delete("/tasks/{task_id}")
async def delete_task(task_id: str):
    global tasks_db
    initial_len = len(tasks_db)
    tasks_db = [task for task in tasks_db if task.id != task_id]
    if len(tasks_db) == initial_len:
        raise HTTPException(status_code=404, detail="Task not found")
    
    with DaprClient() as client:
        client.publish_event(
            pubsub_name=DAPR_PUBSUB_NAME,
            topic_name=TASK_EVENTS_TOPIC,
            data=f'{{"id": "{task_id}", "status": "deleted"}}', # Simple payload for deletion
            data_content_type='application/json',
            # headers={'dapr-pubsub-routing-key': task_id} # Optional
        )
    return {"message": "Task deleted"}

@app.post("/tasks/{task_id}/schedule-reminder")
async def schedule_reminder(task_id: str, reminder_time: datetime, message: str):
    # For now, this is a placeholder.
    # In a real Dapr implementation, we would use Dapr's Jobs API here.
    # This might involve invoking a Dapr sidecar endpoint or using a specific Dapr SDK method
    # when it becomes fully available for Python.
    print(f"Reminder scheduled for Task {task_id} at {reminder_time}: {message}")
    # Simulate a successful scheduling
    return {"message": f"Reminder for task {task_id} scheduled successfully for {reminder_time}."}
