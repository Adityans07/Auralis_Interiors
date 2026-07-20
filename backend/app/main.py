from fastapi import FastAPI, Request
from fastapi.encoders import jsonable_encoder
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.core.config import settings
from app.utils.responses import ApiError, error_response


def create_app() -> FastAPI:
    app = FastAPI(title="Auralis Interiors API", version="1.0.0")
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[settings.frontend_origin,"http://localhost:3000" ,settings.app_base_url],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.include_router(api_router)

    @app.get("/health")
    def health() -> dict[str, str]:
        return {"status": "ok"}

    @app.exception_handler(ApiError)
    async def api_error_handler(_request: Request, exc: ApiError):
        return error_response(exc.code, exc.message, exc.status_code, exc.details)

    @app.exception_handler(RequestValidationError)
    async def validation_error_handler(_request: Request, exc: RequestValidationError):
        details = jsonable_encoder(exc.errors())
        return error_response(
            "VALIDATION_ERROR",
            "Please check the submitted fields.",
            400,
            details,
        )

    @app.exception_handler(Exception)
    async def unhandled_error_handler(_request: Request, exc: Exception):
        print(exc)
        return error_response("INTERNAL_ERROR", "Something went wrong. Please try again.", 500)

    return app


app = create_app()
