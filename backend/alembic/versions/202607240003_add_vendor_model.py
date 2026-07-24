"""add vendor model

Revision ID: 202607240003
Revises: 202607240002
Create Date: 2026-07-24 12:30:00.000000

"""
from typing import Sequence, Union
import uuid

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '202607240003'
down_revision: Union[str, None] = '202607240002'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Create `vendors` table
    vendors_table = op.create_table(
        'vendors',
        sa.Column('id', sa.String(length=64), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('slug', sa.String(length=255), nullable=False),
        sa.Column('logo_url', sa.Text(), nullable=True),
        sa.Column('banner_url', sa.Text(), nullable=True),
        sa.Column('website_url', sa.Text(), nullable=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('contact_person', sa.String(length=255), nullable=True),
        sa.Column('email', sa.String(length=320), nullable=True),
        sa.Column('phone', sa.String(length=80), nullable=True),
        sa.Column('address', sa.Text(), nullable=True),
        sa.Column('status', sa.Enum('ACTIVE', 'INACTIVE', name='vendorstatus'), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_vendors_name'), 'vendors', ['name'], unique=False)
    op.create_index(op.f('ix_vendors_slug'), 'vendors', ['slug'], unique=True)
    op.create_index(op.f('ix_vendors_status'), 'vendors', ['status'], unique=False)

    # 2. Insert Default Vendor
    default_vendor_id = uuid.uuid4().hex
    op.bulk_insert(
        vendors_table,
        [
            {
                'id': default_vendor_id,
                'name': 'Default Vendor',
                'slug': 'default-vendor',
                'status': 'ACTIVE',
            }
        ]
    )

    # 3. Add `vendor_id` to `products` (nullable first)
    op.add_column('products', sa.Column('vendor_id', sa.String(length=64), nullable=True))

    # 4. Update existing products with Default Vendor ID
    op.execute(f"UPDATE products SET vendor_id = '{default_vendor_id}'")

    # 5. Make `vendor_id` NOT NULL
    op.alter_column('products', 'vendor_id', nullable=False)

    # 6. Create index and foreign key
    op.create_index(op.f('ix_products_vendor_id'), 'products', ['vendor_id'], unique=False)
    op.create_foreign_key('fk_products_vendor_id_vendors', 'products', 'vendors', ['vendor_id'], ['id'], ondelete='CASCADE')


def downgrade() -> None:
    op.drop_constraint('fk_products_vendor_id_vendors', 'products', type_='foreignkey')
    op.drop_index(op.f('ix_products_vendor_id'), table_name='products')
    op.drop_column('products', 'vendor_id')
    op.drop_index(op.f('ix_vendors_status'), table_name='vendors')
    op.drop_index(op.f('ix_vendors_slug'), table_name='vendors')
    op.drop_index(op.f('ix_vendors_name'), table_name='vendors')
    op.drop_table('vendors')
    op.execute("DROP TYPE IF EXISTS vendorstatus;")
