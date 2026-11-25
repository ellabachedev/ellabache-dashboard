"""Create the FastAPI app: API routes under /api first, then the React app."""

import logging

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from app.clients.bigquery import DataSourceError
from app.config import get_settings
from app.frontend import mount_frontend
from app.routers import filters, health, products

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")

app = FastAPI(title="Ella Baché Analytics API", version="0.1.0")

app.include_router(health.router, prefix="/api")
app.include_router(filters.router, prefix="/api")
app.include_router(products.router, prefix="/api")


@app.exception_handler(DataSourceError)
def data_source_unavailable(_: Request, err: DataSourceError) -> JSONResponse:
    # A friendly message only; the full error is in the server log.
    return JSONResponse(status_code=503, content={"detail": str(err)})


# Must stay last: its catch-all route would otherwise shadow /api routes.
mount_frontend(app, get_settings().frontend_dist_dir)
