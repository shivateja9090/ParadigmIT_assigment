# Alfred Command Center - Design Document

## Overview

This project management dashboard was built to solve a common problem: teams spending too much time in meetings just to get status updates. The idea was to create a real-time dashboard that shows everything at a glance, so meetings can focus on actual problem-solving instead of status reporting.

## Architecture Decisions

### Why Django + React?

I went with Django for the backend because it's rock-solid for APIs and has excellent admin capabilities. The Django REST framework makes building clean APIs straightforward, and Django Channels handles WebSockets really well.

For the frontend, React was the obvious choice. It's mature, has great tooling, and Bootstrap makes it easy to build something that looks professional without spending weeks on CSS.

### Database Choice

PostgreSQL over SQLite because:
- Better for concurrent users
- More robust for production
- Easier to scale

### Real-time Updates

The 30-second refresh interval was chosen because:
- Frequent enough to feel truly real-time
- Not so frequent that it overwhelms the server
- Gives users time to actually read the updates
- Provides more responsive Alfred Insights for critical alerts

## Data Models

### Projects
Simple but effective - just the basics you need to track progress:
- Name and description
- Status (planning, active, completed)
- Progress percentage
- Start/end dates

### Communications
Team messages with timestamps. Kept it simple - just who said what and when.

### Actions
Action items with assignees and status. This is where the real work gets tracked.

## API Design

Went with RESTful endpoints because they're predictable and easy to debug. The main dashboard endpoint (`/api/dashboard/`) aggregates everything in one call to reduce frontend complexity.

### WebSocket Implementation
Django Channels with in-memory channel layer. For production, you'd want Redis, but this keeps the setup simple for development.

## Frontend Architecture

### Component Structure
- `Dashboard` - Main container
- `ProjectCard` - Individual project display
- `CommunicationList` - Team messages
- `ActionList` - Action items


## Security Considerations

This is a demo/assignment, so security is minimal:
- No authentication (yet)
- CORS enabled for all origins
- No input validation beyond Django's defaults

For production, you'd want:
- User authentication
- Proper CORS configuration
- Input sanitization
- Rate limiting

## Performance

### Backend
- Django's ORM handles database optimization
- Simple queries, no complex joins needed
- In-memory channel layer for WebSockets

### Frontend
- Vite for fast development builds
- Minimal dependencies
- Efficient re-renders with React

## Deployment

Docker Compose setup for easy development and deployment:
- Separate containers for frontend, backend, and database
- Volume persistence for database
- Environment variables for configuration

