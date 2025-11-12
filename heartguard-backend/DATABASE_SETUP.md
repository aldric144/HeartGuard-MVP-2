# HeartGuard™ Database Setup

## Overview

HeartGuard™ has been migrated from in-memory storage to persistent database storage using SQLAlchemy ORM.

## Database Models

The following tables have been created:

1. **users** - User accounts (for future multi-user support)
2. **trust_reports** - Trust Score reports with metadata
3. **photo_analyses** - Photo analysis results linked to reports
4. **chat_analyses** - Chat analysis results linked to reports
5. **manipulation_patterns** - Manipulation patterns detected in chats
6. **analysis_history** - Audit trail of all analyses

## Local Development (SQLite)

By default, the backend uses SQLite for local development:

```bash
DATABASE_URL=sqlite:///./heartguard.db
```

This creates a `heartguard.db` file in the backend directory that persists data between server restarts.

## Production Deployment (PostgreSQL)

### Option 1: Railway

1. Create a new project on [Railway](https://railway.app)
2. Add a PostgreSQL database to your project
3. Copy the DATABASE_URL from Railway
4. Update your `.env` file:
   ```bash
   DATABASE_URL=postgresql://user:password@host:port/database
   ```

### Option 2: Supabase

1. Create a new project on [Supabase](https://supabase.com)
2. Go to Project Settings > Database
3. Copy the Connection String (URI format)
4. Update your `.env` file:
   ```bash
   DATABASE_URL=postgresql://postgres:password@db.supabase.co:5432/postgres
   ```

### Option 3: Other PostgreSQL Providers

Any PostgreSQL provider will work. Just update the DATABASE_URL in your `.env` file with the connection string.

## Database Initialization

The database tables are automatically created on application startup using:

```python
@app.on_event("startup")
async def startup_event():
    init_db()
```

No manual migration is needed for the initial setup.

## Verification

To verify data persistence:

1. Generate a Trust Score report
2. Note the `report_id` from the response
3. Restart the backend server
4. Query the report using: `GET /trustscore/report/{report_id}`
5. Verify the report data is still present

## Environment Variables

Create a `.env` file in the backend directory:

```bash
# For local development with SQLite:
DATABASE_URL=sqlite:///./heartguard.db

# For production with PostgreSQL:
# DATABASE_URL=postgresql://user:password@host:port/database
```

## Dependencies

The following packages are required (already added to pyproject.toml):

- `sqlalchemy` - ORM framework
- `psycopg[binary]` - PostgreSQL driver
- `python-dotenv` - Environment variable management
