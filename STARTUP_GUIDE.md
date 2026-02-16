# Startup Guide - SDC Service Desk Application

## ✅ System Status
- **Backend**: Django 6.0.1 with DRF (Django REST Framework)
- **Frontend**: Angular 21.0.8
- **Database**: PostgreSQL (sdc1)
- **Admin Account**: admin / 123

## Database Status
- ✅ Database connection verified
- ✅ All migrations applied
- ✅ 11 users in database
- ✅ 5 ticket types seeded
- ✅ 20 request types seeded

## Environment Configuration

### Backend (.env file)
Located at: `backend/backend/backend/.env`
```
DB_NAME=sdc1
DB_USER=postgres
DB_PASSWORD=12345678
DB_HOST=localhost
DB_PORT=5432
SECRET_KEY=your-secret-key-change-in-production-12345678901234567890
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:4200,http://127.0.0.1:4200
```

### Frontend
- Port: 4200 (default)
- No environment configuration needed for development
- CORS configured to accept any localhost port via regex

## Quick Start

### Option 1: Start Backend Only
```powershell
cd "c:\Users\banke\Desktop\Modified\backend\backend\backend"
C:/Users/banke/Desktop/Modified/backend/backend/.venv/Scripts/python.exe manage.py runserver 0.0.0.0:8000
```

### Option 2: Start Frontend Only
```powershell
cd "c:\Users\banke\Desktop\Modified\frontend\frontend"
npm start
```

### Option 3: Start Both (in separate terminals)

**Terminal 1 - Backend:**
```powershell
cd "c:\Users\banke\Desktop\Modified\backend\backend\backend"
C:/Users/banke/Desktop/Modified/backend/backend/.venv/Scripts/python.exe manage.py runserver 0.0.0.0:8000
```

**Terminal 2 - Frontend:**
```powershell
cd "c:\Users\banke\Desktop\Modified\frontend\frontend"
npm start
```

## Access Points

- **Frontend**: http://localhost:4200
- **Backend API**: http://localhost:8000/api/
- **Admin Login**: username=`admin`, password=`123`
- **API Docs**: http://localhost:8000/api/schema/ (Swagger/OpenAPI)

## Dependencies

### Backend
- ✅ Virtual environment (.venv) created
- ✅ All packages installed -> `pip install -r requirements.txt`

### Frontend
- ✅ node_modules installed
- ✅ All packages available -> `npm install` if needed

## Available Admin Features

1. **User Management** - View, edit, delete users
2. **Department Management** - Create, edit, delete departments
3. **Ticket Categories** - Manage ticket types and request types
4. **Secondary Admin** - Create, reset password, delete secondary admin accounts
5. **Profile Settings** - Access secondary admin management

## Security Notes

- ✅ SECRET_KEY is set in .env (change in production!)
- ✅ DEBUG mode set to True (change to False in production!)
- ✅ CORS configured for localhost development
- ✅ File uploads validated (5MB max, whitelisted extensions)
- ✅ Query parameters validated
- ✅ JWT authentication enabled

## Troubleshooting

### If Backend Won't Start
1. Check PostgreSQL is running: `Get-Process postgresql`
2. Verify .env file exists in `backend/backend/backend/`
3. Run database check: `python manage.py check`
4. Verify migrations: `python manage.py migrate`

### If Frontend Won't Build
1. Delete node_modules: `rm -r node_modules`
2. Reinstall: `npm install`
3. Clear cache: `npm cache clean --force`
4. Start again: `npm start`

### If CORS Issues Occur
- The backend CORS is configured to accept any localhost port
- Check that both servers are on localhost, not 127.0.0.1 for URL bar
- Frontend will work on any port (4200, 4201, etc.) automatically

## Next Steps
1. Start the backend server
2. Start the frontend server
3. Navigate to http://localhost:4200
4. Login with admin/123
5. Access the admin panel to manage system

---
**Last Updated**: February 16, 2026
**All Systems**: ✅ Ready for use
