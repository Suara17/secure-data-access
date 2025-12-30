from sqlalchemy import Column, Integer, String, Boolean, DECIMAL, DATETIME, BIGINT, VARCHAR, TEXT, ForeignKey
from sqlalchemy.types import Enum
from sqlalchemy.orm import relationship
from database import Base # 引入刚才定义的基类

# 安全等级表
class SecurityLevel(Base):
    __tablename__ = "sys_security_level"

    level_id = Column(Integer, primary_key=True, comment='等级ID')
    level_name = Column(String(50), nullable=False, comment='等级名称')
    level_weight = Column(Integer, nullable=False, comment='权重值(用于比较)：1<2<3<4')
    description = Column(String(255), comment='描述')

# 职能类别表
class Category(Base):
    __tablename__ = "sys_category"

    category_id = Column(Integer, primary_key=True, autoincrement=True)
    category_code = Column(String(20), nullable=False, unique=True, comment='编码')
    category_name = Column(String(50), nullable=False, comment='名称')
    description = Column(String(255), comment='职能描述')

# 用户表
class User(Base):
    __tablename__ = "sys_user"

    user_id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String(50), nullable=False, unique=True, comment='登录账号')
    password_hash = Column(String(100), nullable=False, comment='密码哈希')
    real_name = Column(String(50), nullable=False, comment='真实姓名')

    # 主体安全标记
    security_level_id = Column(Integer, ForeignKey('sys_security_level.level_id'), nullable=False, default=1)
    category_id = Column(Integer, ForeignKey('sys_category.category_id'), nullable=False)
    trust_level = Column(Enum('USER', 'ADMIN'), default='USER', comment='信任等级')

    created_at = Column(DATETIME, default='CURRENT_TIMESTAMP')

    # 关系
    security_label = relationship("SecurityLevel", backref="users")
    category = relationship("Category", backref="users")
