from pydantic import BaseModel

# 安全等级基础模型
class SecurityLevelBase(BaseModel):
    level_id: int
    level_name: str
    level_weight: int
    description: str | None = None

    class Config:
        from_attributes = True # 允许从ORM模型读取数据
