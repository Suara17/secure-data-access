"""
模拟前端删除用户请求（通过 Vite 代理）
"""
import requests

# 先登录获取 token
login_response = requests.post(
    "http://localhost:8082/token",  # 使用前端地址
    data={
        "username": "boss",
        "password": "123456"
    }
)

if login_response.status_code != 200:
    print("登录失败!")
    exit(1)

token = login_response.json()["access_token"]
headers = {"Authorization": f"Bearer {token}"}

print("=" * 80)
print("测试通过前端代理删除用户")
print("=" * 80)

# 创建一个测试用户
print("\n1. 创建测试用户...")
create_response = requests.post(
    "http://localhost:8082/api/admin/users",  # 使用前端地址
    json={
        "username": "frontend_test_user",
        "password": "test123456",
        "real_name": "前端测试用户",
        "security_level_id": 1,
        "category_id": 1
    },
    headers=headers
)

if create_response.status_code == 200:
    user_data = create_response.json()
    user_id = user_data.get('id')
    print(f"[OK] 用户创建成功，ID: {user_id}")
else:
    print(f"[FAIL] 用户创建失败: {create_response.text}")
    exit(1)

# 通过前端代理删除用户
print(f"\n2. 通过前端代理删除用户 {user_id}...")
delete_response = requests.delete(
    f"http://localhost:8082/api/admin/users/{user_id}",  # 使用前端地址
    headers=headers
)

print(f"状态码: {delete_response.status_code}")
print(f"响应: {delete_response.text}")

if delete_response.status_code == 200:
    print("\n[OK] 通过前端代理删除成功!")
else:
    print(f"\n[FAIL] 通过前端代理删除失败!")

# 验证数据库中的用户
print(f"\n3. 验证数据库中的用户...")
import pymysql
conn = pymysql.connect(host='localhost', user='root', password='123456', database='secure_access_db')
cursor = conn.cursor()
cursor.execute('SELECT user_id, username FROM sys_user WHERE user_id = %s', (user_id,))
result = cursor.fetchone()

if result:
    print(f"[FAIL] 用户仍在数据库中: {result}")
else:
    print(f"[OK] 用户已从数据库中删除!")

conn.close()

print("\n" + "=" * 80)
print("测试完成")
print("=" * 80)
