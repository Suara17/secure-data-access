"""
检查数据库中的用户数据
"""
import pymysql

# 连接数据库
conn = pymysql.connect(host='localhost', user='root', password='123456', database='secure_access_db')
cursor = conn.cursor()

# 查询所有用户
cursor.execute('SELECT user_id, username, real_name, trust_level FROM sys_user ORDER BY user_id')
users = cursor.fetchall()

print("=" * 80)
print("数据库中的用户列表")
print("=" * 80)
print(f"\n共 {len(users)} 个用户:\n")

for user in users:
    user_id, username, real_name, trust_level = user
    print(f"ID: {user_id}, 用户名: {username}, 真实姓名: {real_name}, 信任等级: {trust_level}")

conn.close()

print("\n" + "=" * 80)