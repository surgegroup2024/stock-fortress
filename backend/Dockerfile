FROM python:3.12-slim
WORKDIR /app
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY backend/ .
# Railway injects a PORT env var, simple EXPOSE isn't enough for documentation
EXPOSE 8000
# Use shell form to allow variable expansion for ${PORT}
CMD sh -c "uvicorn stock_fortress_backend:app --host 0.0.0.0 --port ${PORT:-8000}"
