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

# 客体资源模型：薪资信息表
class Salary(Base):
    __tablename__ = "data_salary"

    data_id = Column(Integer, primary_key=True, autoincrement=True)
    employee_name = Column(String(50), nullable=False, comment='员工姓名')
    base_salary = Column(DECIMAL(10, 2), nullable=False, comment='基本工资')
    bonus = Column(DECIMAL(10, 2), default=0.00, comment='奖金')

    # 客体安全标记
    data_security_level_id = Column(Integer, ForeignKey('sys_security_level.level_id'), nullable=False, comment='数据敏感等级')
    data_category_id = Column(Integer, ForeignKey('sys_category.category_id'), nullable=False, comment='数据所属类别')
    lifecycle_status = Column(Enum('ACTIVE', 'ARCHIVED'), default='ACTIVE', comment='生命周期：ACTIVE=活跃, ARCHIVED=归档')

    create_time = Column(DATETIME, default='CURRENT_TIMESTAMP')

    # 关系
    security_label = relationship("SecurityLevel", backref="salaries")
    category = relationship("Category", backref="salaries")

# 客体资源模型：公司公告表
class Notice(Base):
    __tablename__ = "data_notice"

    notice_id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String(100), nullable=False)
    content = Column(TEXT)

    # 客体安全标记
    data_security_level_id = Column(Integer, ForeignKey('sys_security_level.level_id'), nullable=False, default=1)
    data_category_id = Column(Integer, ForeignKey('sys_category.category_id'), nullable=False)

    # 关系
    security_label = relationship("SecurityLevel", backref="notices")
    category = relationship("Category", backref="notices")

# 审计与决策模型：访问策略记录表
class AccessPolicy(Base):
    __tablename__ = "sys_access_policy"

    policy_id = Column(BIGINT, primary_key=True, autoincrement=True)

    # 关联的主体与客体
    subject_user_id = Column(Integer, ForeignKey('sys_user.user_id'), nullable=False, comment='发起访问的主体ID')
    object_data_id = Column(Integer, nullable=False, comment='受访问的客体ID')
    target_table = Column(String(50), nullable=False, comment='受访问的表名(如data_salary)')

    # 核心策略要素（保留快照，防止日后用户等级变更导致无法追溯）
    subject_level_snapshot = Column(Integer, nullable=False, comment='当时的主体安全等级权重')
    object_level_snapshot = Column(Integer, nullable=False, comment='当时的客体安全等级权重')
    operation_requested = Column(String(20), nullable=False, comment='请求的操作：READ/WRITE')

    request_time = Column(DATETIME, default='CURRENT_TIMESTAMP')

    # 关系
    user = relationship("User", backref="access_policies")

# 审计与决策模型：访问决策结果表
class AccessDecision(Base):
    __tablename__ = "sys_access_decision"

    decision_id = Column(BIGINT, primary_key=True, comment='主键，直接使用策略ID以保证1:1')

    # 决策结果
    result_code = Column(Enum('ALLOW', 'DENY'), nullable=False, comment='决策结果')
    result_message = Column(String(255), comment='决策说明/拒绝原因')
    decision_time = Column(DATETIME, default='CURRENT_TIMESTAMP')

    # 建立 1:1 外键关系：decision_id 既是主键也是外键，指向 sys_access_policy(policy_id)
    # 注意：SQLAlchemy 中，外键约束通过 ForeignKey 指定
    policy_id = Column(BIGINT, ForeignKey('sys_access_policy.policy_id'), nullable=False)

    # 关系
    policy = relationship("AccessPolicy", backref="decision")
