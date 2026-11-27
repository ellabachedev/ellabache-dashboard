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


@app.middleware("http")
async def api_cache_headers(request: Request, call_next):
    """Let the browser reuse successful API answers briefly (third cache layer, CLAUDE.md §2).

    "private" = only this person's browser may keep it, never a shared proxy. Errors and the
    health check are never cached.
    """
    response = await call_next(request)
    path = request.url.path
    if (
        request.method == "GET"
        and path.startswith("/api/")
        and path != "/api/health"
        and response.status_code == 200
    ):
        max_age = get_settings().browser_cache_seconds
        response.headers["Cache-Control"] = f"private, max-age={max_age}"
    return response


@app.exception_handler(DataSourceError)
def data_source_unavailable(_: Request, err: DataSourceError) -> JSONResponse:
    # A friendly message only; the full error is in the server log.
    return JSONResponse(status_code=503, content={"detail": str(err)})


# Must stay last: its catch-all route would otherwise shadow /api routes.
mount_frontend(app, get_settings().frontend_dist_dir)
