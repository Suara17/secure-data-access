"""
测试修改后的 API 是否返回 ID 字段
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

# 测试获取薪资列表
print("=" * 80)
print("测试 /api/salaries 接口")
print("=" * 80)
salary_response = requests.get("http://127.0.0.1:8002/api/salaries", headers=headers)
print(f"状态码: {salary_response.status_code}")

if salary_response.status_code == 200:
    salaries = salary_response.json()
    print(f"\n返回 {len(salaries)} 条薪资记录:")
    for salary in salaries[:3]:  # 只显示前3条
        print(f"  data_id: {salary.get('data_id', 'MISSING')}")
        print(f"  employee_name: {salary.get('employee_name')}")
        print(f"  amount: {salary.get('amount')}")
        print(f"  security_level: {salary.get('security_level')}")
        print(f"  access_result: {salary.get('access_result')}")
        print()

# 测试获取公告列表
print("=" * 80)
print("测试 /api/notices 接口")
print("=" * 80)
notice_response = requests.get("http://127.0.0.1:8002/api/notices", headers=headers)
print(f"状态码: {notice_response.status_code}")

if notice_response.status_code == 200:
    notices = notice_response.json()
    print(f"\n返回 {len(notices)} 条公告记录:")
    for notice in notices:
        print(f"  notice_id: {notice.get('notice_id', 'MISSING')}")
        print(f"  title: {notice.get('title')}")
        print(f"  security_level: {notice.get('security_level')}")
        print(f"  access_result: {notice.get('access_result')}")
        print()

print("=" * 80)
print("测试完成")
print("=" * 80)