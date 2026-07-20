"""initial schema

Revision ID: 202607140001
Revises:
Create Date: 2026-07-14 00:01:00.000000
"""

from alembic import op

from app.db.base import Base
from app.models import entities  # noqa: F401

revision = "202607140001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    Base.metadata.create_all(bind=bind)


def downgrade() -> None:
    bind = op.get_bind()
    Base.metadata.drop_all(bind=bind)
