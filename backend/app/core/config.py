from functools import lru_cache
from typing import Literal

from pydantic import AnyHttpUrl, Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # database_url: str = "postgresql+psycopg://aditya@localhost:5432/auralis"
    database_url: str = "postgresql+psycopg://auralis_eros_user:DLlU6UUtNRbD0Ii79byYdy9koMzHjM1j@dpg-d9f82f9kh4rs73dn9eh0-a.oregon-postgres.render.com/auralis_eros"
    auth_secret: str = Field(default="development-only-secret", validation_alias="AUTH_SECRET")
    nextauth_secret: str | None = Field(default=None, validation_alias="NEXTAUTH_SECRET")
    nextauth_url: str | None = Field(default=None, validation_alias="NEXTAUTH_URL")
    app_base_url: str = "http://localhost:3000"
    frontend_origin: str = "http://localhost:3000,https://auralis-interiors.vercel.app,https://auralis-interiors-7ln23i4e2-adityar739-gmailcoms-projects.vercel.app"

    openai_api_key: str | None = None
    openai_model_text: str = "gpt-4o-mini"
    openai_model_image: str | None = None

    stripe_secret_key: str | None = None
    stripe_webhook_secret: str | None = None
    next_public_stripe_publishable_key: str | None = None
    design_generation_price_cents: int = 2900

    storage_provider: Literal["s3", "r2", "supabase", "local"] = "s3"
    s3_region: str = "auto"
    s3_bucket: str | None = None
    s3_access_key_id: str | None = None
    s3_secret_access_key: str | None = None
    s3_endpoint: str | None = None
    s3_public_base_url: str | None = None

    email_from: str = "Auralis Interiors <hello@auralisinteriors.com>"
    email_provider: Literal["none", "resend", "smtp"] = "none"
    resend_api_key: str | None = None
    smtp_host: str | None = None
    smtp_port: int | None = None
    smtp_user: str | None = None
    smtp_password: str | None = None
    admin_notification_email: str | None = None
    admin_email: str | None = None
    admin_name: str | None = None
    admin_password: str | None = None
    admin_emails: str = ""

    anonymous_cookie_name: str = "auralis_anon_session"
    user_cookie_name: str = "auralis_user_id"
    session_cookie_name: str = "auralis_session"
    csrf_cookie_name: str = "auralis_csrf"
    auth_session_ttl_hours: int = 24 * 30
    password_reset_ttl_minutes: int = 30
    email_verification_ttl_minutes: int = 60 * 24
    secure_cookies: bool = True

    @property
    def effective_auth_secret(self) -> str:
        return self.auth_secret or self.nextauth_secret or "development-only-secret"

    @property
    def admin_email_list(self) -> list[str]:
        emails = [email.strip().lower() for email in self.admin_emails.split(",") if email.strip()]
        if self.admin_email and self.admin_email.strip():
            emails.append(self.admin_email.strip().lower())
        # Preserve order while deduplicating.
        seen: set[str] = set()
        unique: list[str] = []
        for email in emails:
            if email in seen:
                continue
            seen.add(email)
            unique.append(email)
        return unique


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()

