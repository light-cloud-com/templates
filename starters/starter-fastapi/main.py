"""Entry point: Light Cloud starts the app with `uvicorn main:app`."""

import os

import uvicorn

from app.main import app

__all__ = ["app"]

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=int(os.environ.get("PORT", 8000)))
