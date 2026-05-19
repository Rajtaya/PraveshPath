FROM python:3.12-slim

WORKDIR /app

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ .

RUN python manage.py collectstatic --noinput

CMD python manage.py migrate && gunicorn config.wsgi --bind 0.0.0.0:${PORT:-8000}
