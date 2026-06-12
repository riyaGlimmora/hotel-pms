# Hotel PMS - Property Management System

A full-stack Hotel Management System built with FastAPI and React.

## Tech Stack
- Frontend: React + Vite + Tailwind CSS
- Backend: FastAPI + Python
- Database: SQLite
- Auth: JWT tokens

## Setup

### Backend
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload

### Frontend
cd frontend
npm install
npm run dev

## API Docs
Visit http://127.0.0.1:8000/docs