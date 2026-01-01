"""
测试登录 API
"""
import requests

# 测试登录
def test_login(username, password):
    url = "http://127.0.0.1:8002/token"
    data = {
        "username": username,
        "password": password
    }

    print(f"\n测试登录: 用户名={username}, 密码={password}")
    print("-" * 60)

    try:
        response = requests.post(url, data=data)

        print(f"状态码: {response.status_code}")
        print(f"响应头: {dict(response.headers)}")

        if response.status_code == 200:
            result = response.json()
            print(f"登录成功!")
            print(f"访问令牌: {result['access_token'][:50]}...")

            # 测试获取用户信息
            token = result['access_token']
            headers = {"Authorization": f"Bearer {token}"}
            user_response = requests.get("http://127.0.0.1:8002/users/me", headers=headers)
            print(f"\n用户信息:")
            print(user_response.json())
        else:
            print(f"登录失败!")
            print(f"错误信息: {response.text}")
    except Exception as e:
        print(f"请求异常: {e}")

# 测试几个用户
print("=" * 80)
print("测试登录 API")
print("=" * 80)

# 测试 boss 用户（管理员）
test_login("boss", "123456")

# 测试 intern 用户（普通用户）
test_login("intern", "123456")

# 测试错误密码
test_login("boss", "wrong_password")

# 测试不存在的用户
test_login("nonexistent", "123456")

print("\n" + "=" * 80)