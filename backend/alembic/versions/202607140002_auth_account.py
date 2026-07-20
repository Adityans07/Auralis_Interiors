"""add auth and account tables

Revision ID: 202607140002
Revises: 202607140001
Create Date: 2026-07-14 00:02:00.000000
"""

from alembic import op
import sqlalchemy as sa

revision = "202607140002"
down_revision = "202607140001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    def has_column(table_name: str, column_name: str) -> bool:
        return any(column["name"] == column_name for column in inspector.get_columns(table_name))

    def has_index(table_name: str, index_name: str) -> bool:
        return any(index["name"] == index_name for index in inspector.get_indexes(table_name))

    def has_fk(table_name: str, constraint_name: str) -> bool:
        return any(fk["name"] == constraint_name for fk in inspector.get_foreign_keys(table_name))

    user_columns = [
        ("email_verified_at", sa.Column("email_verified_at", sa.DateTime(timezone=True), nullable=True)),
        ("password_hash", sa.Column("password_hash", sa.String(length=255), nullable=True)),
        ("role", sa.Column("role", sa.String(length=32), nullable=False, server_default="CUSTOMER")),
        ("status", sa.Column("status", sa.String(length=32), nullable=False, server_default="ACTIVE")),
        ("city", sa.Column("city", sa.String(length=120), nullable=True)),
        ("state", sa.Column("state", sa.String(length=120), nullable=True)),
        ("country", sa.Column("country", sa.String(length=120), nullable=True)),
        ("address", sa.Column("address", sa.Text(), nullable=True)),
        ("preferred_style", sa.Column("preferred_style", sa.String(length=120), nullable=True)),
        ("preferred_contact_time", sa.Column("preferred_contact_time", sa.String(length=120), nullable=True)),
        ("marketing_opt_in", sa.Column("marketing_opt_in", sa.Boolean(), nullable=False, server_default=sa.text("false"))),
        ("last_login_at", sa.Column("last_login_at", sa.DateTime(timezone=True), nullable=True)),
        ("signup_ip_hash", sa.Column("signup_ip_hash", sa.String(length=255), nullable=True)),
        ("signup_user_agent", sa.Column("signup_user_agent", sa.Text(), nullable=True)),
        ("signup_anonymous_session_id", sa.Column("signup_anonymous_session_id", sa.String(length=64), nullable=True)),
    ]
    for column_name, column in user_columns:
        if not has_column("users", column_name):
            op.add_column("users", column)

    if not has_index("users", "ix_users_role"):
        op.create_index("ix_users_role", "users", ["role"])
    if not has_index("users", "ix_users_status"):
        op.create_index("ix_users_status", "users", ["status"])
    if not has_index("users", "ix_users_signup_anonymous_session_id"):
        op.create_index("ix_users_signup_anonymous_session_id", "users", ["signup_anonymous_session_id"])
    if not has_fk("users", "fk_users_signup_anonymous_session_id"):
        op.create_foreign_key(
            "fk_users_signup_anonymous_session_id",
            "users",
            "anonymous_sessions",
            ["signup_anonymous_session_id"],
            ["id"],
            ondelete="SET NULL",
        )

    if not has_column("anonymous_sessions", "linked_user_id"):
        op.add_column("anonymous_sessions", sa.Column("linked_user_id", sa.String(length=64), nullable=True))
    if not has_column("anonymous_sessions", "linked_at"):
        op.add_column("anonymous_sessions", sa.Column("linked_at", sa.DateTime(timezone=True), nullable=True))
    if not has_index("anonymous_sessions", "ix_anonymous_sessions_linked_user_id"):
        op.create_index("ix_anonymous_sessions_linked_user_id", "anonymous_sessions", ["linked_user_id"])
    if not has_fk("anonymous_sessions", "fk_anonymous_sessions_linked_user_id"):
        op.create_foreign_key(
            "fk_anonymous_sessions_linked_user_id",
            "anonymous_sessions",
            "users",
            ["linked_user_id"],
            ["id"],
            ondelete="SET NULL",
        )

    if not inspector.has_table("user_sessions"):
        op.create_table(
            "user_sessions",
            sa.Column("id", sa.String(length=64), nullable=False),
            sa.Column("user_id", sa.String(length=64), nullable=False),
            sa.Column("session_token_hash", sa.String(length=255), nullable=False),
            sa.Column("csrf_token_hash", sa.String(length=255), nullable=True),
            sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
            sa.Column("last_seen_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
            sa.Column("revoked_at", sa.DateTime(timezone=True), nullable=True),
            sa.Column("ip_hash", sa.String(length=255), nullable=True),
            sa.Column("user_agent", sa.Text(), nullable=True),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
            sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
            sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
            sa.PrimaryKeyConstraint("id"),
        )
        op.create_index("ix_user_sessions_user_id", "user_sessions", ["user_id"])
        op.create_index("ix_user_sessions_session_token_hash", "user_sessions", ["session_token_hash"], unique=True)

    if not inspector.has_table("password_reset_tokens"):
        op.create_table(
            "password_reset_tokens",
            sa.Column("id", sa.String(length=64), nullable=False),
            sa.Column("user_id", sa.String(length=64), nullable=False),
            sa.Column("token_hash", sa.String(length=255), nullable=False),
            sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
            sa.Column("used_at", sa.DateTime(timezone=True), nullable=True),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
            sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
            sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
            sa.PrimaryKeyConstraint("id"),
        )
        op.create_index("ix_password_reset_tokens_user_id", "password_reset_tokens", ["user_id"])
        op.create_index("ix_password_reset_tokens_token_hash", "password_reset_tokens", ["token_hash"], unique=True)

    if not inspector.has_table("email_verification_tokens"):
        op.create_table(
            "email_verification_tokens",
            sa.Column("id", sa.String(length=64), nullable=False),
            sa.Column("user_id", sa.String(length=64), nullable=False),
            sa.Column("token_hash", sa.String(length=255), nullable=False),
            sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
            sa.Column("used_at", sa.DateTime(timezone=True), nullable=True),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
            sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
            sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
            sa.PrimaryKeyConstraint("id"),
        )
        op.create_index("ix_email_verification_tokens_user_id", "email_verification_tokens", ["user_id"])
        op.create_index("ix_email_verification_tokens_token_hash", "email_verification_tokens", ["token_hash"], unique=True)

    if not inspector.has_table("customer_account_events"):
        op.create_table(
            "customer_account_events",
            sa.Column("id", sa.String(length=64), nullable=False),
            sa.Column("user_id", sa.String(length=64), nullable=False),
            sa.Column("event_type", sa.String(length=64), nullable=False),
            sa.Column("event_metadata", sa.JSON(), nullable=True),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
            sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
            sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
            sa.PrimaryKeyConstraint("id"),
        )
        op.create_index("ix_customer_account_events_user_id", "customer_account_events", ["user_id"])
        op.create_index("ix_customer_account_events_event_type", "customer_account_events", ["event_type"])


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    def has_index(table_name: str, index_name: str) -> bool:
        return any(index["name"] == index_name for index in inspector.get_indexes(table_name))

    def has_fk(table_name: str, constraint_name: str) -> bool:
        return any(fk["name"] == constraint_name for fk in inspector.get_foreign_keys(table_name))

    if inspector.has_table("customer_account_events"):
        if has_index("customer_account_events", "ix_customer_account_events_event_type"):
            op.drop_index("ix_customer_account_events_event_type", table_name="customer_account_events")
        if has_index("customer_account_events", "ix_customer_account_events_user_id"):
            op.drop_index("ix_customer_account_events_user_id", table_name="customer_account_events")
        op.drop_table("customer_account_events")

    if inspector.has_table("email_verification_tokens"):
        if has_index("email_verification_tokens", "ix_email_verification_tokens_token_hash"):
            op.drop_index("ix_email_verification_tokens_token_hash", table_name="email_verification_tokens")
        if has_index("email_verification_tokens", "ix_email_verification_tokens_user_id"):
            op.drop_index("ix_email_verification_tokens_user_id", table_name="email_verification_tokens")
        op.drop_table("email_verification_tokens")

    if inspector.has_table("password_reset_tokens"):
        if has_index("password_reset_tokens", "ix_password_reset_tokens_token_hash"):
            op.drop_index("ix_password_reset_tokens_token_hash", table_name="password_reset_tokens")
        if has_index("password_reset_tokens", "ix_password_reset_tokens_user_id"):
            op.drop_index("ix_password_reset_tokens_user_id", table_name="password_reset_tokens")
        op.drop_table("password_reset_tokens")

    if inspector.has_table("user_sessions"):
        if has_index("user_sessions", "ix_user_sessions_session_token_hash"):
            op.drop_index("ix_user_sessions_session_token_hash", table_name="user_sessions")
        if has_index("user_sessions", "ix_user_sessions_user_id"):
            op.drop_index("ix_user_sessions_user_id", table_name="user_sessions")
        op.drop_table("user_sessions")

    anonymous_columns = {column["name"] for column in inspector.get_columns("anonymous_sessions")}
    if "linked_user_id" in anonymous_columns:
        if has_fk("anonymous_sessions", "fk_anonymous_sessions_linked_user_id"):
            op.drop_constraint("fk_anonymous_sessions_linked_user_id", "anonymous_sessions", type_="foreignkey")
        if has_index("anonymous_sessions", "ix_anonymous_sessions_linked_user_id"):
            op.drop_index("ix_anonymous_sessions_linked_user_id", table_name="anonymous_sessions")
        op.drop_column("anonymous_sessions", "linked_user_id")
    if "linked_at" in anonymous_columns:
        op.drop_column("anonymous_sessions", "linked_at")

    user_columns = {column["name"] for column in inspector.get_columns("users")}
    if "signup_anonymous_session_id" in user_columns:
        if has_fk("users", "fk_users_signup_anonymous_session_id"):
            op.drop_constraint("fk_users_signup_anonymous_session_id", "users", type_="foreignkey")
        if has_index("users", "ix_users_signup_anonymous_session_id"):
            op.drop_index("ix_users_signup_anonymous_session_id", table_name="users")
        op.drop_column("users", "signup_anonymous_session_id")
    if "signup_user_agent" in user_columns:
        op.drop_column("users", "signup_user_agent")
    if "signup_ip_hash" in user_columns:
        op.drop_column("users", "signup_ip_hash")
    if "last_login_at" in user_columns:
        op.drop_column("users", "last_login_at")
    if "marketing_opt_in" in user_columns:
        op.drop_column("users", "marketing_opt_in")
    if "preferred_contact_time" in user_columns:
        op.drop_column("users", "preferred_contact_time")
    if "preferred_style" in user_columns:
        op.drop_column("users", "preferred_style")
    if "address" in user_columns:
        op.drop_column("users", "address")
    if "country" in user_columns:
        op.drop_column("users", "country")
    if "state" in user_columns:
        op.drop_column("users", "state")
    if "city" in user_columns:
        op.drop_column("users", "city")
    if "status" in user_columns:
        if has_index("users", "ix_users_status"):
            op.drop_index("ix_users_status", table_name="users")
        op.drop_column("users", "status")
    if "role" in user_columns:
        if has_index("users", "ix_users_role"):
            op.drop_index("ix_users_role", table_name="users")
        op.drop_column("users", "role")
    if "password_hash" in user_columns:
        op.drop_column("users", "password_hash")
    if "email_verified_at" in user_columns:
        op.drop_column("users", "email_verified_at")
