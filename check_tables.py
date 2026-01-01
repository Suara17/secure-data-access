#!/usr/bin/env python3
"""
检查 access_policy 和 access_decision 表的数据
"""
import pymysql

# 连接数据库
conn = pymysql.connect(host='localhost', user='root', password='123456', database='secure_access_db')
cursor = conn.cursor()

print("=" * 80)
print("检查 access_policy 表")
print("=" * 80)

# 查询 access_policy 表的最大 ID
cursor.execute('SELECT MAX(policy_id) FROM sys_access_policy')
max_policy_id = cursor.fetchone()[0]
print(f"\n最大 policy_id: {max_policy_id}")

# 查询最近的几条记录
cursor.execute('SELECT policy_id, subject_user_id, object_data_id, target_table, operation_requested, request_time FROM sys_access_policy ORDER BY policy_id DESC LIMIT 10')
policies = cursor.fetchall()
print(f"\n最近的 10 条记录:")
for policy in policies:
    print(f"  ID: {policy[0]}, 用户ID: {policy[1]}, 对象ID: {policy[2]}, 表: {policy[3]}, 操作: {policy[4]}, 时间: {policy[5]}")

print("\n" + "=" * 80)
print("检查 access_decision 表")
print("=" * 80)

# 查询 access_decision 表的最大 ID
cursor.execute('SELECT MAX(decision_id) FROM sys_access_decision')
max_decision_id = cursor.fetchone()[0]
print(f"\n最大 decision_id: {max_decision_id}")

# 查询最近的几条记录
cursor.execute('SELECT decision_id, result_code, result_message, decision_time FROM sys_access_decision ORDER BY decision_id DESC LIMIT 10')
decisions = cursor.fetchall()
print(f"\n最近的 10 条记录:")
for decision in decisions:
    print(f"  ID: {decision[0]}, 结果: {decision[1]}, 消息: {decision[2]}, 时间: {decision[3]}")

print("\n" + "=" * 80)
print("检查 AUTO_INCREMENT 值")
print("=" * 80)

# 检查表的 AUTO_INCREMENT 值
cursor.execute("SHOW TABLE STATUS LIKE 'sys_access_policy'")
policy_status = cursor.fetchone()
print(f"\nsys_access_policy AUTO_INCREMENT: {policy_status[10]}")

cursor.execute("SHOW TABLE STATUS LIKE 'sys_access_decision'")
decision_status = cursor.fetchone()
print(f"sys_access_decision AUTO_INCREMENT: {decision_status[10]}")

conn.close()

print("\n" + "=" * 80)