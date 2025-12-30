from fastapi import HTTPException
from models import User, Salary, Notice

def verify_access(user: User, resource, action: str = "read") -> bool:
    """
    基于 BLP (Bell-LaPadula) 模型的简化实现
    下读(Read Down): 主体等级 >= 客体等级
    """
    if not user.security_label or not hasattr(resource, 'security_label') or not resource.security_label:
        return False

    user_level = user.security_label.level_weight
    resource_level = resource.security_label.level_weight

    if action == "read":
        # 核心策略：只有当用户等级 >= 资源等级时，才允许读取
        if user_level >= resource_level:
            return True
        else:
            return False

    # 如果有写操作，可以在这里扩展 "上写" (Write Up) 逻辑
    return False
