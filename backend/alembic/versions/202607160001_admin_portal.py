"""add admin portal models and fields

Revision ID: 202607160001
Revises: 202607140002
Create Date: 2026-07-16 00:01:00.000000
"""

from alembic import op
import sqlalchemy as sa

revision = "202607160001"
down_revision = "202607140002"
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

    if not has_column("design_requests", "assigned_to_id"):
        op.add_column("design_requests", sa.Column("assigned_to_id", sa.String(length=64), nullable=True))
    if not has_column("design_requests", "priority"):
        op.add_column("design_requests", sa.Column("priority", sa.String(length=16), nullable=False, server_default="NORMAL"))
    if not has_column("design_requests", "internal_status"):
        op.add_column("design_requests", sa.Column("internal_status", sa.String(length=120), nullable=True))
    if not has_column("design_requests", "last_admin_viewed_at"):
        op.add_column("design_requests", sa.Column("last_admin_viewed_at", sa.DateTime(timezone=True), nullable=True))
    if not has_index("design_requests", "ix_design_requests_assigned_to_id"):
        op.create_index("ix_design_requests_assigned_to_id", "design_requests", ["assigned_to_id"])
    if not has_index("design_requests", "ix_design_requests_priority"):
        op.create_index("ix_design_requests_priority", "design_requests", ["priority"])
    if not has_index("design_requests", "ix_design_requests_internal_status"):
        op.create_index("ix_design_requests_internal_status", "design_requests", ["internal_status"])
    if not has_fk("design_requests", "fk_design_requests_assigned_to_id"):
        op.create_foreign_key(
            "fk_design_requests_assigned_to_id",
            "design_requests",
            "users",
            ["assigned_to_id"],
            ["id"],
            ondelete="SET NULL",
        )

    if not has_column("selected_designs", "assigned_to_id"):
        op.add_column("selected_designs", sa.Column("assigned_to_id", sa.String(length=64), nullable=True))
    if not has_column("selected_designs", "last_contacted_at"):
        op.add_column("selected_designs", sa.Column("last_contacted_at", sa.DateTime(timezone=True), nullable=True))
    if not has_index("selected_designs", "ix_selected_designs_assigned_to_id"):
        op.create_index("ix_selected_designs_assigned_to_id", "selected_designs", ["assigned_to_id"])
    if not has_index("selected_designs", "ix_selected_designs_last_contacted_at"):
        op.create_index("ix_selected_designs_last_contacted_at", "selected_designs", ["last_contacted_at"])
    if not has_fk("selected_designs", "fk_selected_designs_assigned_to_id"):
        op.create_foreign_key(
            "fk_selected_designs_assigned_to_id",
            "selected_designs",
            "users",
            ["assigned_to_id"],
            ["id"],
            ondelete="SET NULL",
        )

    if not has_column("bookings", "confirmed_at"):
        op.add_column("bookings", sa.Column("confirmed_at", sa.DateTime(timezone=True), nullable=True))
    if not has_column("bookings", "completed_at"):
        op.add_column("bookings", sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True))
    if not has_column("bookings", "cancelled_at"):
        op.add_column("bookings", sa.Column("cancelled_at", sa.DateTime(timezone=True), nullable=True))
    if not has_column("bookings", "assigned_to_id"):
        op.add_column("bookings", sa.Column("assigned_to_id", sa.String(length=64), nullable=True))
    if not has_index("bookings", "ix_bookings_assigned_to_id"):
        op.create_index("ix_bookings_assigned_to_id", "bookings", ["assigned_to_id"])
    if not has_fk("bookings", "fk_bookings_assigned_to_id"):
        op.create_foreign_key(
            "fk_bookings_assigned_to_id",
            "bookings",
            "users",
            ["assigned_to_id"],
            ["id"],
            ondelete="SET NULL",
        )

    if not has_column("contact_messages", "read_at"):
        op.add_column("contact_messages", sa.Column("read_at", sa.DateTime(timezone=True), nullable=True))
    if not has_column("contact_messages", "replied_at"):
        op.add_column("contact_messages", sa.Column("replied_at", sa.DateTime(timezone=True), nullable=True))
    if not has_index("contact_messages", "ix_contact_messages_read_at"):
        op.create_index("ix_contact_messages_read_at", "contact_messages", ["read_at"])
    if not has_index("contact_messages", "ix_contact_messages_replied_at"):
        op.create_index("ix_contact_messages_replied_at", "contact_messages", ["replied_at"])

    if not has_column("products", "archived_at"):
        op.add_column("products", sa.Column("archived_at", sa.DateTime(timezone=True), nullable=True))
    if not has_index("products", "ix_products_archived_at"):
        op.create_index("ix_products_archived_at", "products", ["archived_at"])

    if not has_column("blog_posts", "archived_at"):
        op.add_column("blog_posts", sa.Column("archived_at", sa.DateTime(timezone=True), nullable=True))
    if not has_index("blog_posts", "ix_blog_posts_archived_at"):
        op.create_index("ix_blog_posts_archived_at", "blog_posts", ["archived_at"])

    if not inspector.has_table("ai_generation_logs"):
        op.create_table(
            "ai_generation_logs",
            sa.Column("id", sa.String(length=64), nullable=False),
            sa.Column("design_request_id", sa.String(length=64), nullable=False),
            sa.Column("status", sa.String(length=32), nullable=False),
            sa.Column("model_text", sa.String(length=120), nullable=True),
            sa.Column("model_image", sa.String(length=120), nullable=True),
            sa.Column("prompt_tokens", sa.Integer(), nullable=True),
            sa.Column("completion_tokens", sa.Integer(), nullable=True),
            sa.Column("total_tokens", sa.Integer(), nullable=True),
            sa.Column("error_code", sa.String(length=120), nullable=True),
            sa.Column("error_message", sa.Text(), nullable=True),
            sa.Column("raw_request_summary", sa.JSON(), nullable=True),
            sa.Column("raw_response_summary", sa.JSON(), nullable=True),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
            sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
            sa.ForeignKeyConstraint(["design_request_id"], ["design_requests.id"], ondelete="CASCADE"),
            sa.PrimaryKeyConstraint("id"),
        )
        op.create_index("ix_ai_generation_logs_design_request_id", "ai_generation_logs", ["design_request_id"])
        op.create_index("ix_ai_generation_logs_status", "ai_generation_logs", ["status"])
        op.create_index("ix_ai_generation_logs_error_code", "ai_generation_logs", ["error_code"])

    if not inspector.has_table("admin_notes"):
        op.create_table(
            "admin_notes",
            sa.Column("id", sa.String(length=64), nullable=False),
            sa.Column("entity_type", sa.String(length=64), nullable=False),
            sa.Column("entity_id", sa.String(length=64), nullable=False),
            sa.Column("note", sa.Text(), nullable=False),
            sa.Column("created_by_id", sa.String(length=64), nullable=False),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
            sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
            sa.ForeignKeyConstraint(["created_by_id"], ["users.id"], ondelete="CASCADE"),
            sa.PrimaryKeyConstraint("id"),
        )
        op.create_index("ix_admin_notes_entity_type", "admin_notes", ["entity_type"])
        op.create_index("ix_admin_notes_entity_id", "admin_notes", ["entity_id"])
        op.create_index("ix_admin_notes_created_by_id", "admin_notes", ["created_by_id"])

    if not inspector.has_table("admin_audit_logs"):
        op.create_table(
            "admin_audit_logs",
            sa.Column("id", sa.String(length=64), nullable=False),
            sa.Column("actor_user_id", sa.String(length=64), nullable=True),
            sa.Column("action", sa.String(length=120), nullable=False),
            sa.Column("entity_type", sa.String(length=120), nullable=False),
            sa.Column("entity_id", sa.String(length=64), nullable=False),
            sa.Column("metadata", sa.JSON(), nullable=True),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
            sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
            sa.ForeignKeyConstraint(["actor_user_id"], ["users.id"], ondelete="SET NULL"),
            sa.PrimaryKeyConstraint("id"),
        )
        op.create_index("ix_admin_audit_logs_actor_user_id", "admin_audit_logs", ["actor_user_id"])
        op.create_index("ix_admin_audit_logs_action", "admin_audit_logs", ["action"])
        op.create_index("ix_admin_audit_logs_entity_type", "admin_audit_logs", ["entity_type"])
        op.create_index("ix_admin_audit_logs_entity_id", "admin_audit_logs", ["entity_id"])

    if not inspector.has_table("business_settings"):
        op.create_table(
            "business_settings",
            sa.Column("id", sa.String(length=64), nullable=False),
            sa.Column("key", sa.String(length=120), nullable=False),
            sa.Column("value", sa.JSON(), nullable=False),
            sa.Column("updated_by_id", sa.String(length=64), nullable=True),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
            sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
            sa.ForeignKeyConstraint(["updated_by_id"], ["users.id"], ondelete="SET NULL"),
            sa.PrimaryKeyConstraint("id"),
        )
        op.create_index("ix_business_settings_key", "business_settings", ["key"], unique=True)
        op.create_index("ix_business_settings_updated_by_id", "business_settings", ["updated_by_id"])


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    def has_index(table_name: str, index_name: str) -> bool:
        return any(index["name"] == index_name for index in inspector.get_indexes(table_name))

    def has_fk(table_name: str, constraint_name: str) -> bool:
        return any(fk["name"] == constraint_name for fk in inspector.get_foreign_keys(table_name))

    if inspector.has_table("business_settings"):
        if has_index("business_settings", "ix_business_settings_updated_by_id"):
            op.drop_index("ix_business_settings_updated_by_id", table_name="business_settings")
        if has_index("business_settings", "ix_business_settings_key"):
            op.drop_index("ix_business_settings_key", table_name="business_settings")
        op.drop_table("business_settings")

    if inspector.has_table("admin_audit_logs"):
        if has_index("admin_audit_logs", "ix_admin_audit_logs_entity_id"):
            op.drop_index("ix_admin_audit_logs_entity_id", table_name="admin_audit_logs")
        if has_index("admin_audit_logs", "ix_admin_audit_logs_entity_type"):
            op.drop_index("ix_admin_audit_logs_entity_type", table_name="admin_audit_logs")
        if has_index("admin_audit_logs", "ix_admin_audit_logs_action"):
            op.drop_index("ix_admin_audit_logs_action", table_name="admin_audit_logs")
        if has_index("admin_audit_logs", "ix_admin_audit_logs_actor_user_id"):
            op.drop_index("ix_admin_audit_logs_actor_user_id", table_name="admin_audit_logs")
        op.drop_table("admin_audit_logs")

    if inspector.has_table("admin_notes"):
        if has_index("admin_notes", "ix_admin_notes_created_by_id"):
            op.drop_index("ix_admin_notes_created_by_id", table_name="admin_notes")
        if has_index("admin_notes", "ix_admin_notes_entity_id"):
            op.drop_index("ix_admin_notes_entity_id", table_name="admin_notes")
        if has_index("admin_notes", "ix_admin_notes_entity_type"):
            op.drop_index("ix_admin_notes_entity_type", table_name="admin_notes")
        op.drop_table("admin_notes")

    if inspector.has_table("ai_generation_logs"):
        if has_index("ai_generation_logs", "ix_ai_generation_logs_error_code"):
            op.drop_index("ix_ai_generation_logs_error_code", table_name="ai_generation_logs")
        if has_index("ai_generation_logs", "ix_ai_generation_logs_status"):
            op.drop_index("ix_ai_generation_logs_status", table_name="ai_generation_logs")
        if has_index("ai_generation_logs", "ix_ai_generation_logs_design_request_id"):
            op.drop_index("ix_ai_generation_logs_design_request_id", table_name="ai_generation_logs")
        op.drop_table("ai_generation_logs")

    if "archived_at" in {c["name"] for c in inspector.get_columns("blog_posts")}:
        if has_index("blog_posts", "ix_blog_posts_archived_at"):
            op.drop_index("ix_blog_posts_archived_at", table_name="blog_posts")
        op.drop_column("blog_posts", "archived_at")

    if "archived_at" in {c["name"] for c in inspector.get_columns("products")}:
        if has_index("products", "ix_products_archived_at"):
            op.drop_index("ix_products_archived_at", table_name="products")
        op.drop_column("products", "archived_at")

    contact_columns = {c["name"] for c in inspector.get_columns("contact_messages")}
    if "replied_at" in contact_columns:
        if has_index("contact_messages", "ix_contact_messages_replied_at"):
            op.drop_index("ix_contact_messages_replied_at", table_name="contact_messages")
        op.drop_column("contact_messages", "replied_at")
    if "read_at" in contact_columns:
        if has_index("contact_messages", "ix_contact_messages_read_at"):
            op.drop_index("ix_contact_messages_read_at", table_name="contact_messages")
        op.drop_column("contact_messages", "read_at")

    booking_columns = {c["name"] for c in inspector.get_columns("bookings")}
    if "assigned_to_id" in booking_columns:
        if has_fk("bookings", "fk_bookings_assigned_to_id"):
            op.drop_constraint("fk_bookings_assigned_to_id", "bookings", type_="foreignkey")
        if has_index("bookings", "ix_bookings_assigned_to_id"):
            op.drop_index("ix_bookings_assigned_to_id", table_name="bookings")
        op.drop_column("bookings", "assigned_to_id")
    if "cancelled_at" in booking_columns:
        op.drop_column("bookings", "cancelled_at")
    if "completed_at" in booking_columns:
        op.drop_column("bookings", "completed_at")
    if "confirmed_at" in booking_columns:
        op.drop_column("bookings", "confirmed_at")

    selected_columns = {c["name"] for c in inspector.get_columns("selected_designs")}
    if "last_contacted_at" in selected_columns:
        if has_index("selected_designs", "ix_selected_designs_last_contacted_at"):
            op.drop_index("ix_selected_designs_last_contacted_at", table_name="selected_designs")
        op.drop_column("selected_designs", "last_contacted_at")
    if "assigned_to_id" in selected_columns:
        if has_fk("selected_designs", "fk_selected_designs_assigned_to_id"):
            op.drop_constraint("fk_selected_designs_assigned_to_id", "selected_designs", type_="foreignkey")
        if has_index("selected_designs", "ix_selected_designs_assigned_to_id"):
            op.drop_index("ix_selected_designs_assigned_to_id", table_name="selected_designs")
        op.drop_column("selected_designs", "assigned_to_id")

    request_columns = {c["name"] for c in inspector.get_columns("design_requests")}
    if "last_admin_viewed_at" in request_columns:
        op.drop_column("design_requests", "last_admin_viewed_at")
    if "internal_status" in request_columns:
        if has_index("design_requests", "ix_design_requests_internal_status"):
            op.drop_index("ix_design_requests_internal_status", table_name="design_requests")
        op.drop_column("design_requests", "internal_status")
    if "priority" in request_columns:
        if has_index("design_requests", "ix_design_requests_priority"):
            op.drop_index("ix_design_requests_priority", table_name="design_requests")
        op.drop_column("design_requests", "priority")
    if "assigned_to_id" in request_columns:
        if has_fk("design_requests", "fk_design_requests_assigned_to_id"):
            op.drop_constraint("fk_design_requests_assigned_to_id", "design_requests", type_="foreignkey")
        if has_index("design_requests", "ix_design_requests_assigned_to_id"):
            op.drop_index("ix_design_requests_assigned_to_id", table_name="design_requests")
        op.drop_column("design_requests", "assigned_to_id")
