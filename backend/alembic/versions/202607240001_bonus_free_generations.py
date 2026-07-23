"""add bonus_free_generations to user_usages

Revision ID: 202607240001
Revises: 202607160001
Create Date: 2026-07-24 00:00:00.000000
"""

from alembic import op
import sqlalchemy as sa

revision = "202607240001"
down_revision = "202607160001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    def has_column(table_name: str, column_name: str) -> bool:
        return any(column["name"] == column_name for column in inspector.get_columns(table_name))

    if not has_column("user_usages", "bonus_free_generations"):
        op.add_column(
            "user_usages",
            sa.Column("bonus_free_generations", sa.Integer(), nullable=False, server_default="0"),
        )


def downgrade() -> None:
    op.drop_column("user_usages", "bonus_free_generations")
