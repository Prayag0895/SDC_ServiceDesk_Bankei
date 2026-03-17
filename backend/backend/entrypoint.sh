#!/bin/sh
set -e

cd /app/backend

echo "[entrypoint] Waiting for PostgreSQL..."
python - <<'PY'
import os
import time
import psycopg2

host = os.getenv("DB_HOST", "db")
port = int(os.getenv("DB_PORT", "5432"))
name = os.getenv("DB_NAME", "sdc")
user = os.getenv("DB_USER", "postgres")
password = os.getenv("DB_PASSWORD", "postgres")

for attempt in range(60):
    try:
        conn = psycopg2.connect(
            host=host,
            port=port,
            dbname=name,
            user=user,
            password=password,
        )
        conn.close()
        print("[entrypoint] PostgreSQL is ready")
        break
    except Exception:
        time.sleep(2)
else:
    raise SystemExit("[entrypoint] PostgreSQL did not become ready in time")
PY

echo "[entrypoint] Running migrations..."
python manage.py migrate --noinput

echo "[entrypoint] Collecting static files..."
python manage.py collectstatic --noinput

echo "[entrypoint] Ensuring admin user exists..."
python - <<'PY'
import os

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")

import django
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

username = "admin"
password = "123"
email = "admin@sdc.local"
role = "OFFICER"

user, _ = User.objects.get_or_create(username=username, defaults={"email": email})
user.email = email
user.is_superuser = True
user.is_staff = True
if hasattr(user, "is_approved"):
    user.is_approved = True
if hasattr(user, "role") and role:
    user.role = role
user.set_password(password)
user.save()

print(f"[entrypoint] Admin ready: {username}")
PY

echo "[entrypoint] Seeding departments and domains..."
python manage.py seed_departments || true

echo "[entrypoint] Seeding ticket and request types..."
python manage.py seed_ticket_types || true

echo "[entrypoint] Seeding demo users..."
python manage.py seed_users || true

echo "[entrypoint] Starting gunicorn..."
exec gunicorn backend.wsgi:application --bind 0.0.0.0:8000 --workers 4 --timeout 120