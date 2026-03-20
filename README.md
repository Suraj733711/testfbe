# TestProject — React + FastAPI Full-Stack App

A modern full-stack application with a **React** frontend (deployed on **Vercel**) and a **Python FastAPI** backend (deployed on **Render**).

## 📁 Project Structure

```
testproject/
├── frontend/          # React + Vite → Vercel
│   ├── src/
│   ├── .env           # Local API URL
│   ├── .env.production # Production API URL (update after deploy)
│   ├── vercel.json
│   └── package.json
├── backend/           # FastAPI → Render
│   ├── main.py
│   ├── requirements.txt
│   └── render.yaml
└── README.md
```

---

## 🚀 Quick Start (Local Development)

### 1. Start the Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

The API will be available at `http://localhost:8000` with docs at `http://localhost:8000/docs`.

### 2. Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## ☁️ Deployment

### Deploy Backend to Render

1. Push your code to a **GitHub** repository
2. Go to [render.com](https://render.com) → **New** → **Web Service**
3. Connect your GitHub repo
4. Configure:
   - **Root Directory**: `backend`
   - **Runtime**: Python
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Click **Create Web Service**
6. Copy your Render URL (e.g., `https://your-app.onrender.com`)

### Deploy Frontend to Vercel

1. Go to [vercel.com](https://vercel.com) → **New Project**
2. Import your GitHub repo
3. Configure:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add **Environment Variable**:
   - `VITE_API_URL` = `https://your-app.onrender.com` (your Render URL)
5. Click **Deploy**

### Update CORS (Important!)

After deploying the frontend, update `backend/main.py` to add your Vercel URL to the `origins` list:

```python
origins = [
    "http://localhost:5173",
    "https://your-app.vercel.app",  # ← Add your Vercel URL
]
```

Then redeploy the backend on Render.

---

## 🛠️ API Endpoints

| Method   | Endpoint             | Description       |
|----------|---------------------|--------------------|
| `GET`    | `/`                 | API info           |
| `GET`    | `/api/health`       | Health check       |
| `GET`    | `/api/items`        | List all items     |
| `GET`    | `/api/items/{id}`   | Get single item    |
| `POST`   | `/api/items`        | Create new item    |
| `DELETE` | `/api/items/{id}`   | Delete an item     |

---

## 🧰 Tech Stack

- **Frontend**: React 19, Vite, Vanilla CSS
- **Backend**: Python, FastAPI, Pydantic
- **Hosting**: Vercel (frontend), Render (backend)
