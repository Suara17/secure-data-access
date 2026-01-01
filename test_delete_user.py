"""
测试删除用户功能
"""
import requests

# 先登录获取 token
login_response = requests.post(
    "http://127.0.0.1:8002/token",
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
print("测试删除用户功能")
print("=" * 80)

# 先创建一个测试用户
print("\n1. 创建测试用户...")
create_response = requests.post(
    "http://127.0.0.1:8002/api/admin/users",
    json={
        "username": "user_to_delete",
        "password": "test123456",
        "real_name": "待删除用户",
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

# 删除用户
print(f"\n2. 删除用户 {user_id}...")
delete_response = requests.delete(
    f"http://127.0.0.1:8002/api/admin/users/{user_id}",
    headers=headers
)

print(f"状态码: {delete_response.status_code}")
print(f"响应: {delete_response.text}")

if delete_response.status_code == 200:
    print("\n[OK] 用户删除成功!")
else:
    print(f"\n[FAIL] 用户删除失败!")

# 验证用户已被删除
print(f"\n3. 验证用户是否已被删除...")
users_response = requests.get("http://127.0.0.1:8002/api/admin/users", headers=headers)
if users_response.status_code == 200:
    users = users_response.json()
    deleted_user = next((u for u in users if u['id'] == user_id), None)
    if deleted_user:
        print("[FAIL] 用户仍然存在!")
    else:
        print("[OK] 用户已成功删除!")
else:
    print("[FAIL] 无法获取用户列表")

# 测试不能删除自己
print(f"\n4. 测试不能删除自己...")
delete_self_response = requests.delete(
    f"http://127.0.0.1:8002/api/admin/users/1",  # boss 的 ID
    headers=headers
)

print(f"状态码: {delete_self_response.status_code}")
print(f"响应: {delete_self_response.text}")

if delete_self_response.status_code == 400:
    print("[OK] 正确阻止删除自己的账户!")
else:
    print("[FAIL] 应该阻止删除自己的账户!")

print("\n" + "=" * 80)
print("测试完成")
print("=" * 80)