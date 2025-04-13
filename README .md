
# 🚦 StatusPage - Real-Time Service & Incident Monitoring

A modern, real-time public status page system built with **Django (REST API)** and **React (ShadCN + Tailwind)**. Provides WebSocket-powered live updates.

## 🔥 Features

### 🧑‍💻 Public Status Page
- Lists real-time service statuses (Operational, Maintenance, Outage, etc.)
- Active incidents with descriptions and affected services
- Vertical incident timeline with recent and historical incidents
- Incident trends chart (last 30 days)
- Uses websockets for real-time updates

### 🛠️ Admin Dashboard
- Add/Edit services and their statuses
- Create and update incidents
- Live updates to public page using WebSockets


### ⚙️ Tech Stack

#### Backend:
- Django + Django REST Framework
- PostgreSQL (or SQLite for dev)
- Django Channels (for WebSockets)
- Token-based Auth (JWT)

#### Frontend:
- React + Vite
- Tailwind CSS + ShadCN UI
- WebSocket support via native API

---

## 🚀 Getting Started

### 1. Clone the Repo

```bash
git clone https://github.com/<your-username>/statuspage.git
cd statuspage
```

### 2. Backend Setup

```bash
cd backend
python -m venv env
source env/bin/activate

pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

> ⚙️ Setup `.env` with your DB credentials and secret keys.

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

## 🧪 Dev Notes

- WebSocket server is configured using Django Channels
- Frontend connects to WebSocket for real-time updates
- Token-based auth for both user login and admin dashboard


---

## 📦 Deployment

You can deploy the backend and frontend separately or together using:
- **Render** (for Django and PostgreSQL)
- **Vercel/Netlify** for the React frontend
- Environment variables configured for both

---

## 📄 License

This project is licensed under the MIT License.

---

## 🙌 Credits

Developed by [Devjeet Sahu](https://github.com/DevjeetSahu) 🚀  

