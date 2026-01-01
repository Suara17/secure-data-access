"""
修正 AUTO_INCREMENT 值
"""
import pymysql

# 连接数据库
conn = pymysql.connect(host='localhost', user='root', password='123456', database='secure_access_db')
cursor = conn.cursor()

print("=" * 80)
print("修正 AUTO_INCREMENT 值")
print("=" * 80)

# 获取当前最大 ID
cursor.execute('SELECT MAX(policy_id) FROM sys_access_policy')
max_policy_id = cursor.fetchone()[0]

print(f"\n当前最大 policy_id: {max_policy_id}")

# 设置 AUTO_INCREMENT 为最大 ID + 1
new_auto_increment = max_policy_id + 1
cursor.execute(f'ALTER TABLE sys_access_policy AUTO_INCREMENT = {new_auto_increment}')

print(f"已将 AUTO_INCREMENT 设置为: {new_auto_increment}")

# 验证
cursor.execute("SHOW TABLE STATUS LIKE 'sys_access_policy'")
status = cursor.fetchone()
print(f"验证: AUTO_INCREMENT = {status[10]}")

conn.commit()
conn.close()

print("\n" + "=" * 80)
print("完成！")
print("=" * 80)