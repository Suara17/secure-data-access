"""
检查 ID 是否有跳跃
"""
import pymysql

# 连接数据库
conn = pymysql.connect(host='localhost', user='root', password='123456', database='secure_access_db')
cursor = conn.cursor()

print("=" * 80)
print("检查 access_policy 表的 ID 跳跃")
print("=" * 80)

# 查询所有 policy_id
cursor.execute('SELECT policy_id FROM sys_access_policy ORDER BY policy_id')
policy_ids = [row[0] for row in cursor.fetchall()]

if policy_ids:
    print(f"\n总记录数: {len(policy_ids)}")
    print(f"最小 ID: {min(policy_ids)}")
    print(f"最大 ID: {max(policy_ids)}")

    # 检查缺失的 ID
    missing_ids = []
    expected_id = min(policy_ids)
    for actual_id in policy_ids:
        while expected_id < actual_id:
            missing_ids.append(expected_id)
            expected_id += 1
        expected_id += 1

    if missing_ids:
        print(f"\n缺失的 ID 数量: {len(missing_ids)}")
        if len(missing_ids) <= 20:
            print(f"缺失的 ID: {missing_ids}")
        else:
            print(f"缺失的 ID (前20个): {missing_ids[:20]}")
            print(f"缺失的 ID (后20个): {missing_ids[-20:]}")
    else:
        print(f"\n没有缺失的 ID，ID 是连续的")
else:
    print("\n表中没有数据")

conn.close()

print("\n" + "=" * 80)