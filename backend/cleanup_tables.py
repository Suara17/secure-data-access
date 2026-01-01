"""
安全清理 access_policy 和 access_decision 表
每个表只保留最新的10条记录
"""
from database import engine
from sqlalchemy import text

def cleanup_tables():
    conn = engine.connect()

    try:
        # 开始事务
        trans = conn.begin()

        print("开始清理数据...")

        # 1. 获取要保留的10条最新记录的 policy_id
        print("\n1. 查询 access_policy 表...")
        result = conn.execute(text("""
            SELECT policy_id FROM sys_access_policy
            ORDER BY request_time DESC
            LIMIT 10
        """))
        keep_policy_ids = [row[0] for row in result]
        print(f"   要保留的 policy_id: {keep_policy_ids}")

        # 2. 删除 access_decision 表中不在保留列表中的记录
        print("\n2. 清理 access_decision 表...")
        if keep_policy_ids:
            placeholders = ','.join([str(pid) for pid in keep_policy_ids])
            delete_decision = conn.execute(text(f"""
                DELETE FROM sys_access_decision
                WHERE decision_id NOT IN ({placeholders})
            """))
            print(f"   删除了 {delete_decision.rowcount} 条 access_decision 记录")

        # 3. 删除 access_policy 表中不在保留列表中的记录
        print("\n3. 清理 access_policy 表...")
        if keep_policy_ids:
            delete_policy = conn.execute(text(f"""
                DELETE FROM sys_access_policy
                WHERE policy_id NOT IN ({placeholders})
            """))
            print(f"   删除了 {delete_policy.rowcount} 条 access_policy 记录")

        # 4. 验证结果
        print("\n4. 验证结果...")
        policy_count = conn.execute(text("SELECT COUNT(*) FROM sys_access_policy")).scalar()
        decision_count = conn.execute(text("SELECT COUNT(*) FROM sys_access_decision")).scalar()

        print(f"   access_policy 表剩余记录数: {policy_count}")
        print(f"   access_decision 表剩余记录数: {decision_count}")

        # 提交事务
        trans.commit()
        print("\n[OK] 清理完成！数据已安全删除。")

    except Exception as e:
        # 发生错误时回滚
        trans.rollback()
        print(f"\n[ERROR] 发生错误，已回滚所有更改: {e}")
        raise

    finally:
        conn.close()

if __name__ == "__main__":
    print("=" * 50)
    print("数据清理脚本")
    print("=" * 50)
    cleanup_tables()