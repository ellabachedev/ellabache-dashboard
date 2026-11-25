# One container for Cloud Run: FastAPI serves the API (/api/*) and the built React app.
# Build:  docker build -t ellabache-dashboard .
# Run:    docker run -p 8080:8080 ellabache-dashboard   (needs Google credentials for BigQuery)

# --- Stage 1: build the React app ---------------------------------------------------------
FROM node:22-alpine AS frontend
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# --- Stage 2: Python API that also serves the built files ---------------------------------
FROM python:3.13-slim
COPY --from=ghcr.io/astral-sh/uv:0.10.6 /uv /usr/local/bin/uv

WORKDIR /app/backend
ENV UV_COMPILE_BYTECODE=1 \
    UV_LINK_MODE=copy

# Install dependencies first (cached layer), then copy the code.
COPY backend/pyproject.toml backend/uv.lock ./
RUN uv sync --frozen --no-dev --no-install-project
COPY backend/ ./

COPY --from=frontend /app/frontend/dist /app/frontend/dist

ENV PATH="/app/backend/.venv/bin:$PATH" \
    APP_FRONTEND_DIST_DIR=/app/frontend/dist \
    PORT=8080

# Run as a normal user, not root.
RUN useradd --create-home appuser
USER appuser

# Cloud Run sets $PORT; BigQuery access comes from the service's own service account.
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT}"]
