from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import uuid

app = FastAPI(
    title="TestProject API",
    description="A simple FastAPI backend for the TestProject application",
    version="1.0.0",
)

# CORS configuration - update origins with your Vercel URL after deployment
origins = [
    "http://localhost:5173",      # Vite dev server
    "http://localhost:3000",      # Alternative dev port
    # Add your Vercel deployment URL here, e.g.:
    "https://testfbe.onrender.com"
    "https://testfbe.vercel.app"
    # "https://your-app.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------- Models ----------
class ItemCreate(BaseModel):
    title: str
    description: Optional[str] = None


class Item(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    created_at: str


# ---------- In-memory store ----------
items_db: dict[str, Item] = {}

# Seed some sample data
_seed_items = [
    ("Learn FastAPI", "Build REST APIs with Python's fastest framework"),
    ("Build React Frontend", "Create a beautiful UI with React and Vite"),
    ("Deploy to Cloud", "Host frontend on Vercel and backend on Render"),
]
for title, desc in _seed_items:
    _id = str(uuid.uuid4())
    items_db[_id] = Item(
        id=_id,
        title=title,
        description=desc,
        created_at=datetime.utcnow().isoformat(),
    )


# ---------- Routes ----------
@app.get("/")
async def root():
    return {
        "message": "Welcome to the TestProject API 🚀",
        "docs": "/docs",
        "endpoints": {
            "items": "/api/items",
            "health": "/api/health",
        },
    }


@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}


@app.get("/api/items", response_model=list[Item])
async def get_items():
    return list(items_db.values())


@app.get("/api/items/{item_id}", response_model=Item)
async def get_item(item_id: str):
    if item_id not in items_db:
        raise HTTPException(status_code=404, detail="Item not found")
    return items_db[item_id]


@app.post("/api/items", response_model=Item, status_code=201)
async def create_item(item: ItemCreate):
    new_id = str(uuid.uuid4())
    new_item = Item(
        id=new_id,
        title=item.title,
        description=item.description,
        created_at=datetime.utcnow().isoformat(),
    )
    items_db[new_id] = new_item
    return new_item


@app.delete("/api/items/{item_id}")
async def delete_item(item_id: str):
    if item_id not in items_db:
        raise HTTPException(status_code=404, detail="Item not found")
    del items_db[item_id]
    return {"message": "Item deleted successfully"}
