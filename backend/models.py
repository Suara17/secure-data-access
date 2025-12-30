from sqlalchemy import Column, Integer, String, Boolean, DECIMAL, DATETIME, BIGINT, VARCHAR, TEXT
from sqlalchemy.types import Enum
from database import Base # 引入刚才定义的基类

# 安全等级表
class SecurityLevel(Base):
    __tablename__ = "sys_security_level"

    level_id = Column(Integer, primary_key=True, comment='等级ID')
    level_name = Column(String(50), nullable=False, comment='等级名称')
    level_weight = Column(Integer, nullable=False, comment='权重值(用于比较)：1<2<3<4')
    description = Column(String(255), comment='描述')
