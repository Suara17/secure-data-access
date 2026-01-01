"""
测试创建用户功能
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
print("测试创建用户功能")
print("=" * 80)

# 创建新用户
new_user_data = {
    "username": "testuser001",
    "password": "test123456",
    "real_name": "测试用户",
    "security_level_id": 2,  # 内部
    "category_id": 1  # 财务部
}

print(f"\n创建用户请求:")
print(f"  用户名: {new_user_data['username']}")
print(f"  密码: {new_user_data['password']}")
print(f"  真实姓名: {new_user_data['real_name']}")
print(f"  安全等级ID: {new_user_data['security_level_id']}")
print(f"  职能类别ID: {new_user_data['category_id']}")

create_response = requests.post(
    "http://127.0.0.1:8002/api/admin/users",
    json=new_user_data,
    headers=headers
)

print(f"\n状态码: {create_response.status_code}")
print(f"响应: {create_response.text}")

if create_response.status_code == 200:
    print("\n[OK] 用户创建成功!")
    result = create_response.json()
    print(f"  用户ID: {result.get('user_id')}")
    print(f"  用户名: {result.get('username')}")
    print(f"  真实姓名: {result.get('real_name')}")
else:
    print("\n[FAIL] 用户创建失败!")

print("\n" + "=" * 80)
print("测试完成")
print("=" * 80)