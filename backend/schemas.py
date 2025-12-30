from pydantic import BaseModel
from typing import Optional

# 安全等级基础模型
class SecurityLevelBase(BaseModel):
    level_id: int
    level_name: str
    level_weight: int
    description: str | None = None

    class Config:
        from_attributes = True # 允许从ORM模型读取数据

# 职能类别基础模型
class CategoryBase(BaseModel):
    category_id: int
    category_code: str
    category_name: str
    description: str | None = None

    class Config:
        from_attributes = True

# 用户认证相关模型
class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

# 用户信息模型（返回给前端）
class UserResponse(BaseModel):
    id: int
    username: str
    email: Optional[str] = None
    role: str  # 'user' 或 'admin'
    security_level: SecurityLevelBase
    created_at: str

    class Config:
        from_attributes = True

# 管理员用户响应模型
class UserAdminResponse(BaseModel):
    id: int
    username: str
    real_name: str
    security_level: SecurityLevelBase
    category: CategoryBase
    trust_level: str  # 'USER' 或 'ADMIN'
    created_at: str

    class Config:
        from_attributes = True

# 用户创建模型
class UserCreate(BaseModel):
    username: str
    password: str
    real_name: str
    security_level_id: int
    category_id: int

# 用户标签更新模型
class UserLabelsUpdate(BaseModel):
    security_level_id: int
    category_id: int

# 薪资数据模型
class SalaryBase(BaseModel):
    employee_name: str
    amount: Optional[float] = None  # 脱敏时为null
    security_level: str
    access_result: str  # ALLOW 或 DENY

class SalaryDetail(BaseModel):
    id: int
    employee_name: str
    base_salary: float
    bonus: float
    security_level: str
    category: str
    lifecycle_status: str
    create_time: str

    class Config:
        from_attributes = True

# 公告数据模型
class NoticeBase(BaseModel):
    title: str
    content: Optional[str] = None
    security_level: str
    access_result: str  # ALLOW 或 DENY

class NoticeDetail(BaseModel):
    notice_id: int
    title: str
    content: str
    security_level: str
    category: str
    create_time: Optional[str] = None

    class Config:
        from_attributes = True

# 薪资录入模型
class SalaryCreate(BaseModel):
    employee_name: str
    base_salary: float
    bonus: float = 0.0
    data_security_level_id: int
    data_category_id: int

# 公告录入模型
class NoticeCreate(BaseModel):
    title: str
    content: str
    data_security_level_id: int
    data_category_id: int

# 审计日志查询模型
class AuditLogBase(BaseModel):
    request_time: str
    username: str
    resource_name: str
    operation: str
    result: str  # ALLOW 或 DENY
    fail_reason: Optional[str] = None

    class Config:
        from_attributes = True
