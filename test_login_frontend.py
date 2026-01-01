"""
测试前端登录流程（使用与前端相同的请求格式）
"""
import requests

# 测试登录（使用与前端相同的格式）
def test_login_frontend(username, password):
    url = "http://127.0.0.1:8002/token"

    # 使用 URLSearchParams 格式（与前端 AuthContext.tsx 相同）
    from urllib.parse import urlencode
    data = urlencode({
        "username": username,
        "password": password
    })

    headers = {
        "Content-Type": "application/x-www-form-urlencoded"
    }

    print(f"\n测试登录: 用户名={username}, 密码={password}")
    print(f"请求头: {headers}")
    print(f"请求体: {data}")
    print("-" * 60)

    try:
        response = requests.post(url, data=data, headers=headers)

        print(f"状态码: {response.status_code}")

        if response.status_code == 200:
            result = response.json()
            print(f"[OK] 登录成功!")
            print(f"访问令牌: {result['access_token'][:50]}...")

            # 测试获取用户信息（使用 token）
            token = result['access_token']
            headers_auth = {"Authorization": f"Bearer {token}"}
            user_response = requests.get("http://127.0.0.1:8002/users/me", headers=headers_auth)

            if user_response.status_code == 200:
                user_data = user_response.json()
                print(f"\n用户信息:")
                print(f"  ID: {user_data['id']}")
                print(f"  用户名: {user_data['username']}")
                print(f"  角色: {user_data['role']}")
                print(f"  安全等级: {user_data['security_level']['level_name']}")
                print(f"  安全权重: {user_data['security_level']['level_weight']}")
            else:
                print(f"[FAIL] 获取用户信息失败: {user_response.status_code}")
                print(f"错误: {user_response.text}")
        else:
            print(f"[FAIL] 登录失败!")
            print(f"错误信息: {response.text}")
    except Exception as e:
        print(f"[ERROR] 请求异常: {e}")
        import traceback
        traceback.print_exc()

# 测试几个用户
print("=" * 80)
print("测试前端登录流程")
print("=" * 80)

# 测试 boss 用户（管理员）
test_login_frontend("boss", "123456")

# 测试 intern 用户（普通用户）
test_login_frontend("intern", "123456")

# 测试错误密码
test_login_frontend("boss", "wrong_password")

print("\n" + "=" * 80)
print("测试完成")
print("=" * 80)
print("\n如果所有测试都通过，说明后端 API 工作正常。")
print("问题可能出在前端：")
print("1. 检查浏览器控制台的网络请求")
print("2. 检查是否有 CORS 错误")
print("3. 检查前端代码中的 API 地址配置")
print("4. 检查浏览器控制台的 JavaScript 错误")