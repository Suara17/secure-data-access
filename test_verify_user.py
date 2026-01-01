"""
验证新创建的用户
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
print("验证新创建的用户")
print("=" * 80)

# 获取用户列表
users_response = requests.get("http://127.0.0.1:8002/api/admin/users", headers=headers)

if users_response.status_code == 200:
    users = users_response.json()
    
    # 查找刚创建的用户
    test_user = next((u for u in users if u['username'] == 'testuser001'), None)
    
    if test_user:
        print("\n找到新创建的用户:")
        print(f"  ID: {test_user['id']}")
        print(f"  用户名: {test_user['username']}")
        print(f"  真实姓名: {test_user['real_name']}")
        print(f"  安全等级: {test_user['security_level']['level_name']}")
        print(f"  安全等级ID: {test_user['security_level']['level_id']}")
        print(f"  职能类别: {test_user['category']['category_name']}")
        print(f"  职能类别ID: {test_user['category']['category_id']}")
        print(f"  信任等级: {test_user['trust_level']}")
        print("\n[OK] 用户信息验证成功!")
    else:
        print("\n[FAIL] 未找到新创建的用户")
else:
    print(f"[FAIL] 获取用户列表失败: {users_response.status_code}")

print("\n" + "=" * 80)
print("验证完成")
print("=" * 80)