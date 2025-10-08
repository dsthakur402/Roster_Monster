# Radiology Shift Scheduler

A FastAPI-based application for managing radiology shift scheduling.

## Setup

1. Install Poetry (if not already installed):
```bash
curl -sSL https://install.python-poetry.org | python3 -
```

2. Install dependencies:
```bash
poetry install
```

3. Create the MySQL database:
```bash
mysql -u root -p
CREATE DATABASE roster_db;
```

4. Run database migrations:
```bash
alembic upgrade head
```

5. Start the application:
```bash
uvicorn app.main:app --reload
```

## API Endpoints

### Locations
- POST /locations/ - Create a new location
- GET /locations/ - Get all locations
- GET /locations/{location_id} - Get a specific location
- PUT /locations/{location_id} - Update a location
- DELETE /locations/{location_id} - Delete a location

### Radiologists
- POST /radiologists/ - Create a new radiologist
- GET /radiologists/ - Get all radiologists
- GET /radiologists/{radiologist_id} - Get a specific radiologist
- PUT /radiologists/{radiologist_id} - Update a radiologist
- DELETE /radiologists/{radiologist_id} - Delete a radiologist

### Leaves
- POST /leaves/ - Create a new leave
- GET /leaves/ - Get all leaves
- GET /leaves/{leave_id} - Get a specific leave
- PUT /leaves/{leave_id} - Update a leave
- DELETE /leaves/{leave_id} - Delete a leave

### Shifts
- POST /shifts/ - Create a new shift
- GET /shifts/ - Get all shifts
- GET /shifts/{shift_id} - Get a specific shift
- PUT /shifts/{shift_id} - Update a shift
- DELETE /shifts/{shift_id} - Delete a shift

### Schedule
- POST /schedule/ - Create a new schedule with radiologists and shifts

## Environment Variables

Create a `.env` file with the following variables:
```
DB_HOST=localhost
DB_PORT=3306
DB_NAME=roster_db
DB_USER=root
DB_PASSWORD=123456
```

## Database Schema

The application uses the following tables:
- radiologists
- locations
- leaves
- shifts

Each table has appropriate relationships and constraints as defined in the models. 