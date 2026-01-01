"""
测试更新和删除功能
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
print("测试更新和删除功能")
print("=" * 80)

# 获取一条薪资记录
salary_response = requests.get("http://127.0.0.1:8002/api/salaries", headers=headers)
salaries = salary_response.json()

if not salaries:
    print("没有薪资记录!")
    exit(1)

# 选择第一条记录进行测试
test_salary = salaries[0]
salary_id = test_salary["data_id"]
print(f"\n选择测试记录: ID={salary_id}, 姓名={test_salary['employee_name']}")

# 测试更新
print("\n" + "-" * 80)
print("测试更新功能")
print("-" * 80)
update_data = {
    "employee_name": test_salary["employee_name"] + " (已修改)",
    "base_salary": 10000.0,
    "bonus": 2000.0
}

update_response = requests.put(
    f"http://127.0.0.1:8002/api/admin/salaries/{salary_id}",
    json=update_data,
    headers=headers
)

print(f"更新请求: PUT /api/admin/salaries/{salary_id}")
print(f"状态码: {update_response.status_code}")
print(f"响应: {update_response.text}")

if update_response.status_code == 200:
    print("[OK] 更新成功!")
else:
    print("[FAIL] 更新失败!")

# 测试删除
print("\n" + "-" * 80)
print("测试删除功能")
print("-" * 80)

# 获取另一条记录用于删除测试
if len(salaries) > 1:
    delete_salary = salaries[1]
    delete_id = delete_salary["data_id"]
    print(f"选择删除记录: ID={delete_id}, 姓名={delete_salary['employee_name']}")

    delete_response = requests.delete(
        f"http://127.0.0.1:8002/api/admin/salaries/{delete_id}",
        headers=headers
    )

    print(f"删除请求: DELETE /api/admin/salaries/{delete_id}")
    print(f"状态码: {delete_response.status_code}")
    print(f"响应: {delete_response.text}")

    if delete_response.status_code == 200:
        print("[OK] 删除成功!")
    else:
        print("[FAIL] 删除失败!")
else:
    print("没有足够的记录进行删除测试")

print("\n" + "=" * 80)
print("测试完成")
print("=" * 80)