from fastapi import HTTPException
from sqlalchemy.orm import Session
from models import User, Salary, Notice, AccessPolicy, AccessDecision

def verify_access(user: User, resource, action: str = "read", db: Session = None) -> bool:
    """
    基于 BLP (Bell-LaPadula) 模型的简化实现
    下读(Read Down): 主体等级 >= 客体等级 且 范畴匹配
    """
    if not user.security_label or not hasattr(resource, 'security_label') or not resource.security_label or not user.category or not hasattr(resource, 'category') or not resource.category:
        allowed = False
    else:
        user_level = user.security_label.level_weight
        resource_level = resource.security_label.level_weight

        # 等级检查
        level_ok = user_level >= resource_level

        # 范畴检查：用户范畴必须匹配资源范畴
        # 但是公告是公司级别的通知，应该允许所有范畴的用户访问
        # 另外，公开级别的数据也应该跨部门访问
        if isinstance(resource, Notice) or resource_level == 1:
            # 公告和公开级别数据对所有用户开放
            category_ok = True
        else:
            # 其他资源需要范畴匹配
            category_ok = user.category_id == resource.data_category_id

        # 特定职能访问规则：综合部可以看公告，但不能看财务
        if user.category.category_code == 'GEN' and resource.category.category_code == 'FIN':
            category_ok = False

        allowed = level_ok and category_ok

    # 审计日志
    if db:
        try:
            # 确定 object_data_id 和 target_table
            if isinstance(resource, Salary):
                object_data_id = resource.data_id
                target_table = 'data_salary'
            elif isinstance(resource, Notice):
                object_data_id = resource.notice_id
                target_table = 'data_notice'
            else:
                object_data_id = 0  # fallback
                target_table = 'unknown'

            subject_level_snapshot = user.security_label.level_weight if user.security_label else 0
            object_level_snapshot = resource.security_label.level_weight if hasattr(resource, 'security_label') and resource.security_label else 0

            # 插入访问策略记录
            policy = AccessPolicy(
                subject_user_id=user.user_id,
                object_data_id=object_data_id,
                target_table=target_table,
                subject_level_snapshot=subject_level_snapshot,
                object_level_snapshot=object_level_snapshot,
                operation_requested=action.upper()
            )
            db.add(policy)
            db.commit()
            db.refresh(policy)

            # 插入访问决策记录
            result_message = ""
            if not allowed:
                if not (user.security_label and hasattr(resource, 'security_label') and resource.security_label):
                    result_message = "Missing security labels"
                elif not (user.category and hasattr(resource, 'category') and resource.category):
                    result_message = "Missing category labels"
                elif not (user.security_label.level_weight >= resource.security_label.level_weight):
                    result_message = "Insufficient security level"
                elif not (user.category_id == resource.data_category_id):
                    result_message = "Category mismatch"
                elif user.category.category_code == 'GEN' and resource.category.category_code == 'FIN':
                    result_message = "GEN cannot access FIN data"

            decision = AccessDecision(
                decision_id=policy.policy_id,
                result_code='ALLOW' if allowed else 'DENY',
                result_message=result_message
            )
            db.add(decision)
            db.commit()
        except Exception as e:
            # 审计日志失败不影响访问控制决策
            print(f"Audit logging failed: {e}")
            db.rollback()

    return allowed
