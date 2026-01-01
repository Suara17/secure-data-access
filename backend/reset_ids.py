
"""
重置 access_policy 和 access_decision 表的 ID
将 policy_id 和 decision_id 从当前值重新编号为 1, 2, 3...
"""
from database import engine
from sqlalchemy import text

def reset_ids():
    conn = engine.connect()

    try:
        # 开始事务
        trans = conn.begin()

        print("开始重置 ID...")

        # 1. 获取所有记录，按 request_time 排序
        print("\n1. 查询现有记录...")
        result = conn.execute(text("""
            SELECT policy_id FROM sys_access_policy
            ORDER BY request_time ASC
        """))
        policy_ids = [row[0] for row in result]
        print(f"   当前 policy_id 列表: {policy_ids}")

        # 2. 创建临时映射表
        print("\n2. 创建 ID 映射...")
        id_mapping = {}
        for new_id, old_id in enumerate(policy_ids, start=1):
            id_mapping[old_id] = new_id
        print(f"   ID 映射: {id_mapping}")

        # 3. 禁用外键检查
        print("\n3. 禁用外键检查...")
        conn.execute(text("SET FOREIGN_KEY_CHECKS = 0"))

        # 4. 更新 access_decision 表的 decision_id
        print("\n4. 更新 access_decision 表...")
        for old_id, new_id in id_mapping.items():
            conn.execute(text(f"""
                UPDATE sys_access_decision
                SET decision_id = {new_id}
                WHERE decision_id = {old_id}
            """))
        print(f"   access_decision 表已更新")

        # 5. 更新 access_policy 表的 policy_id
        print("\n5. 更新 access_policy 表...")
        for old_id, new_id in id_mapping.items():
            conn.execute(text(f"""
                UPDATE sys_access_policy
                SET policy_id = {new_id}
                WHERE policy_id = {old_id}
            """))
        print(f"   access_policy 表已更新")

        # 6. 重新启用外键检查
        print("\n6. 启用外键检查...")
        conn.execute(text("SET FOREIGN_KEY_CHECKS = 1"))

        # 7. 验证结果
        print("\n7. 验证结果...")
        result = conn.execute(text("""
            SELECT policy_id FROM sys_access_policy
            ORDER BY policy_id
        """))
        new_policy_ids = [row[0] for row in result]
        print(f"   新的 policy_id 列表: {new_policy_ids}")

        result = conn.execute(text("""
            SELECT decision_id FROM sys_access_decision
            ORDER BY decision_id
        """))
        new_decision_ids = [row[0] for row in result]
        print(f"   新的 decision_id 列表: {new_decision_ids}")

        # 提交事务
        trans.commit()
        print("\n[OK] ID 重置完成！")

    except Exception as e:
        # 发生错误时回滚
        trans.rollback()
        print(f"\n[ERROR] 发生错误，已回滚所有更改: {e}")
        raise

    finally:
        conn.close()

if __name__ == "__main__":
    print("=" * 50)
    print("ID 重置脚本")
    print("=" * 50)
    reset_ids()
