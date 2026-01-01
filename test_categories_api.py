"""
测试获取类别列表接口
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

# 测试获取类别列表
print("=" * 80)
print("测试 /api/admin/categories 接口")
print("=" * 80)
categories_response = requests.get("http://127.0.0.1:8002/api/admin/categories", headers=headers)
print(f"状态码: {categories_response.status_code}")

if categories_response.status_code == 200:
    categories = categories_response.json()
    print(f"\n返回 {len(categories)} 个类别:")
    for cat in categories:
        print(f"  category_id: {cat.get('category_id')}")
        print(f"  category_code: {cat.get('category_code')}")
        print(f"  category_name: {cat.get('category_name')}")
        print(f"  description: {cat.get('description')}")
        print()
else:
    print(f"错误: {categories_response.text}")

print("=" * 80)
print("测试完成")
print("=" * 80)