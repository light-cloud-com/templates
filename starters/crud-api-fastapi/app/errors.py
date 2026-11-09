"""Every error leaves as {"error": "..."}; a malformed id in the path is a 404."""

from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException


def http_error(request, exc: StarletteHTTPException):
    return JSONResponse({"error": exc.detail}, status_code=exc.status_code)


def validation_error(request, exc: RequestValidationError):
    errors = exc.errors()
    if any(e["loc"][0] == "path" for e in errors):
        return JSONResponse({"error": "Item not found"}, status_code=404)
    message = "; ".join(f"{'.'.join(map(str, e['loc'][1:])) or 'body'}: {e['msg']}" for e in errors)
    return JSONResponse({"error": message}, status_code=400)


def register(app: FastAPI):
    app.add_exception_handler(StarletteHTTPException, http_error)
    app.add_exception_handler(RequestValidationError, validation_error)
