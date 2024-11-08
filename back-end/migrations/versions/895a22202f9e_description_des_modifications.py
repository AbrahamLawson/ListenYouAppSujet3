
from alembic import op
import sqlalchemy as sa


# Identifiers revision
revision = '895a22202f9e'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table('song', schema=None) as batch_op:
        batch_op.drop_column('genre')


def downgrade():
    with op.batch_alter_table('song', schema=None) as batch_op:
        batch_op.add_column(sa.Column('genre', sa.VARCHAR(length=50), autoincrement=False, nullable=True))

