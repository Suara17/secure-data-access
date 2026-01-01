"""
重置 access_policy 和 access_decision 表的 ID，使其从 1 开始自然递增
"""
import pymysql

# 连接数据库
conn = pymysql.connect(host='localhost', user='root', password='123456', database='secure_access_db')
cursor = conn.cursor()

print("=" * 80)
print("重置 access_policy 和 access_decision 表的 ID")
print("=" * 80)

try:
    # 1. 备份现有数据
    print("\n1. 备份现有数据...")
    cursor.execute('SELECT * FROM sys_access_policy ORDER BY policy_id')
    policies_backup = cursor.fetchall()
    print(f"   备份了 {len(policies_backup)} 条 access_policy 记录")

    cursor.execute('SELECT * FROM sys_access_decision ORDER BY decision_id')
    decisions_backup = cursor.fetchall()
    print(f"   备份了 {len(decisions_backup)} 条 access_decision 记录")

    # 2. 获取列名
    cursor.execute('DESCRIBE sys_access_policy')
    policy_columns = [col[0] for col in cursor.fetchall()]

    cursor.execute('DESCRIBE sys_access_decision')
    decision_columns = [col[0] for col in cursor.fetchall()]

    # 3. 删除现有数据
    print("\n2. 删除现有数据...")
    cursor.execute('DELETE FROM sys_access_decision')
    print(f"   删除了 {cursor.rowcount} 条 access_decision 记录")

    cursor.execute('DELETE FROM sys_access_policy')
    print(f"   删除了 {cursor.rowcount} 条 access_policy 记录")

    # 4. 重置 AUTO_INCREMENT
    print("\n3. 重置 AUTO_INCREMENT...")
    cursor.execute('ALTER TABLE sys_access_policy AUTO_INCREMENT = 1')
    print("   sys_access_policy AUTO_INCREMENT 已重置为 1")

    # access_decision 表没有 AUTO_INCREMENT，因为它的 decision_id 是外键

    # 5. 重新插入数据
    print("\n4. 重新插入数据...")

    # 重新插入 access_policy 数据
    for i, policy in enumerate(policies_backup, 1):
        # 构建插入语句，跳过 policy_id 字段（让数据库自动生成）
        columns = [col for col in policy_columns if col != 'policy_id']
        values = [policy[policy_columns.index(col)] for col in columns]
        placeholders = ', '.join(['%s'] * len(values))
        columns_str = ', '.join(columns)

        insert_sql = f"INSERT INTO sys_access_policy ({columns_str}) VALUES ({placeholders})"
        cursor.execute(insert_sql, values)

    print(f"   重新插入了 {len(policies_backup)} 条 access_policy 记录")

    # 重新插入 access_decision 数据
    for i, decision in enumerate(decisions_backup, 1):
        # 获取对应的 policy_id
        old_decision_id = decision[decision_columns.index('decision_id')]
        # 找到对应的 policy 记录
        old_policy = next((p for p in policies_backup if p[policy_columns.index('policy_id')] == old_decision_id), None)

        if old_policy:
            # 获取新的 policy_id
            cursor.execute('SELECT policy_id FROM sys_access_policy WHERE subject_user_id = %s AND object_data_id = %s AND target_table = %s AND operation_requested = %s AND request_time = %s LIMIT 1',
                          (old_policy[policy_columns.index('subject_user_id')],
                           old_policy[policy_columns.index('object_data_id')],
                           old_policy[policy_columns.index('target_table')],
                           old_policy[policy_columns.index('operation_requested')],
                           old_policy[policy_columns.index('request_time')]))
            new_policy_id = cursor.fetchone()[0]

            # 构建插入语句，使用新的 decision_id
            columns = [col for col in decision_columns if col != 'decision_id']
            values = [decision[decision_columns.index(col)] for col in columns]
            placeholders = ', '.join(['%s'] * len(values))
            columns_str = ', '.join(columns)

            insert_sql = f"INSERT INTO sys_access_decision ({columns_str}, decision_id) VALUES ({placeholders}, %s)"
            cursor.execute(insert_sql, values + [new_policy_id])

    print(f"   重新插入了 {len(decisions_backup)} 条 access_decision 记录")

    # 提交事务
    conn.commit()
    print("\n5. 事务已提交")

    # 6. 验证结果
    print("\n6. 验证结果...")
    cursor.execute('SELECT COUNT(*) FROM sys_access_policy')
    policy_count = cursor.fetchone()[0]

    cursor.execute('SELECT MIN(policy_id), MAX(policy_id) FROM sys_access_policy')
    min_policy, max_policy = cursor.fetchone()

    cursor.execute('SELECT COUNT(*) FROM sys_access_decision')
    decision_count = cursor.fetchone()[0]

    cursor.execute('SELECT MIN(decision_id), MAX(decision_id) FROM sys_access_decision')
    min_decision, max_decision = cursor.fetchone()

    print(f"   access_policy: {policy_count} 条记录，ID 范围: {min_policy} - {max_policy}")
    print(f"   access_decision: {decision_count} 条记录，ID 范围: {min_decision} - {max_decision}")

    # 检查 ID 是否连续
    cursor.execute('SELECT policy_id FROM sys_access_policy ORDER BY policy_id')
    policy_ids = [row[0] for row in cursor.fetchall()]
    expected_ids = list(range(1, len(policy_ids) + 1))
    is_continuous = policy_ids == expected_ids

    if is_continuous:
        print(f"   [OK] access_policy ID 连续")
    else:
        print(f"   [FAIL] access_policy ID 不连续")

    print("\n" + "=" * 80)
    print("重置完成！")
    print("=" * 80)

except Exception as e:
    print(f"\n错误: {e}")
    print("正在回滚事务...")
    conn.rollback()
    print("事务已回滚")
finally:
    conn.close()