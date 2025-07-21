# Alfred Command Center

A real-time project management dashboard that keeps teams in sync with live updates and comprehensive project tracking.

## Tech Stack

**Frontend**: React 18 with Bootstrap for a clean, responsive UI
**Backend**: Django 4.2 with REST framework for robust APIs
**Database**: PostgreSQL for reliable data storage
**Real-time**: WebSockets with Django Channels for live updates
**Deployment**: Docker containers for easy setup

## Getting Started

### Prerequisites
- Docker and Docker Compose installed
- Git (obviously)

### Quick Setup

1. Clone this repo:
   ```bash
   git clone https://github.com/shivateja9090/ParadigmIT_assigment.git
   cd paradigmit_assignment
   ```

2. Fire up the whole stack:
   ```bash
   docker compose up --build
   ```

3. Once everything's running, hit these URLs:
   - **Dashboard**: http://localhost:3000
   - **API**: http://localhost:8000

4. Sample data is automatically created on server startup, but you can also manually populate with fresh data:
   ```bash
   curl -X POST http://localhost:8000/api/create-mock-data/
   ```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/dashboard/` | GET | Get all dashboard data in one call |
| `/api/projects/` | GET | List all projects |
| `/api/communications/` | GET | Get team communications |
| `/api/actions/` | GET | Fetch action items |

## Project Structure

```
paradigmit_assignment/
├── frontend/                 # React app (Vite)
│   ├── src/                 # Source code
│   ├── package.json         # Dependencies
│   └── Dockerfile          # Frontend container
├── backend/                 # Django app
│   ├── dashboard/          # Main app
│   ├── alfred_project/     # Django settings
│   ├── requirements.txt    # Python dependencies
│   └── Dockerfile         # Backend container
└── docker-compose.yml      # Orchestration
```

## Development

### Frontend Development
```bash
cd frontend
npm install
npm run dev
```

### Backend Development
```bash
cd backend
pip install -r requirements.txt
python manage.py runserver
```

## Database

The app uses PostgreSQL with these main models:
- **Projects**: Project details and progress tracking
- **Communications**: Team messages and updates
- **Actions**: Action items and their status

## Real-time Features

The dashboard uses WebSockets to push updates every 30 seconds, so you'll see changes without refreshing the page. Pretty handy for keeping everyone in the loop.
