"""Serve the built React app. Registered AFTER the /api routes so it never hides them."""

from pathlib import Path

from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles


def mount_frontend(app: FastAPI, dist_dir: Path) -> None:
    """Serve dist/assets as files and every other non-API path as index.html (React routes)."""
    index_file = dist_dir / "index.html"
    if not index_file.is_file():
        return  # Frontend not built yet (normal during backend-only development).

    assets_dir = dist_dir / "assets"
    if assets_dir.is_dir():
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{path:path}", include_in_schema=False)
    def react_app(path: str) -> FileResponse:
        requested = (dist_dir / path).resolve()
        # Serve real files (favicon etc.) only from inside dist; everything else gets the app.
        if path and requested.is_file() and requested.is_relative_to(dist_dir.resolve()):
            return FileResponse(requested)
        return FileResponse(index_file)
