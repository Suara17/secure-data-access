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
