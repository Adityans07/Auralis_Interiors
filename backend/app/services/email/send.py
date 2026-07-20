from __future__ import annotations

import logging

import aiosmtplib
import resend
from email.message import EmailMessage

from app.core.config import settings

logger = logging.getLogger(__name__)


async def send_email(to: str, subject: str, text: str, html: str | None = None) -> dict:
    if settings.email_provider == "none":
        logger.info("Email provider is disabled; skipping email delivery for subject '%s'.", subject)
        return {"skipped": True}
    if settings.email_provider == "resend":
        if not settings.resend_api_key:
            logger.warning("Resend provider selected but RESEND_API_KEY is missing; skipping email.")
            return {"skipped": True}
        resend.api_key = settings.resend_api_key
        resend.Emails.send({"from": settings.email_from, "to": to, "subject": subject, "text": text, "html": html})
        return {"skipped": False}
    if settings.email_provider == "smtp":
        if not all([settings.smtp_host, settings.smtp_port, settings.smtp_user, settings.smtp_password]):
            logger.warning("SMTP provider selected but SMTP credentials are incomplete; skipping email.")
            return {"skipped": True}
        message = EmailMessage()
        message["From"] = settings.email_from
        message["To"] = to
        message["Subject"] = subject
        message.set_content(text)
        if html:
            message.add_alternative(html, subtype="html")
        await aiosmtplib.send(
            message,
            hostname=settings.smtp_host,
            port=settings.smtp_port,
            username=settings.smtp_user,
            password=settings.smtp_password,
            start_tls=settings.smtp_port != 465,
        )
        return {"skipped": False}
    logger.warning("Unknown email provider '%s'; skipping email.", settings.email_provider)
    return {"skipped": True}


async def notify_admin(subject: str, text: str, html: str | None = None) -> dict:
    if not settings.admin_notification_email:
        return {"skipped": True}
    return await send_email(settings.admin_notification_email, subject, text, html)

