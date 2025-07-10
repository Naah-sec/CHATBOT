# ---- Backend (Django) ----
FROM python:3.12-slim AS backend
WORKDIR /app
RUN apt-get update && apt-get upgrade -y && apt-get clean
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY chatbot_demo/ ./chatbot_demo/

# ---- Frontend (React) ----
FROM node:20-alpine AS frontend
WORKDIR /frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

FROM python:3.12-slim
WORKDIR /app
RUN apt-get update && apt-get upgrade -y && apt-get clean
COPY --from=backend /app /app
COPY --from=frontend /frontend/dist /app/frontend_dist
COPY --from=frontend /frontend/dist /app/frontend_dist

# Expose Django port
EXPOSE 8000

# Set environment variables
ENV DJANGO_SETTINGS_MODULE=chatbot_demo.settings
ENV PYTHONUNBUFFERED=1

# Collect static (if needed)
# RUN python manage.py collectstatic --noinput

# Start Django server
CMD ["python", "chatbot_demo/manage.py", "runserver", "0.0.0.0:8000"]
