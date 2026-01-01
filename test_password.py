"""
测试密码哈希和登录功能
"""
from passlib.context import CryptContext
import pymysql

# 密码加密上下文
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password):
    """生成密码哈希"""
    return pwd_context.hash(password)

def verify_password(plain_password, stored_password):
    """
    验证密码
    支持向后兼容：如果存储的是明文密码则直接比较，如果是哈希则使用bcrypt验证
    """
    # 检查是否是bcrypt哈希（以$2开头）
    if stored_password.startswith('$2'):
        return pwd_context.verify(plain_password, stored_password)
    else:
        # 向后兼容：直接比较明文密码
        return plain_password == stored_password

# 连接数据库
conn = pymysql.connect(host='localhost', user='root', password='123456', database='secure_access_db')
cursor = conn.cursor()

# 查询所有用户
cursor.execute('SELECT user_id, username, password_hash, real_name FROM sys_user')
users = cursor.fetchall()

print("=" * 80)
print("测试密码验证功能")
print("=" * 80)

# 常见密码测试
test_passwords = ['123456', 'password', 'admin', 'boss', 'test123', '123456789']

for user in users:
    user_id, username, password_hash, real_name = user
    print(f"\n用户: {username} ({real_name})")
    print(f"密码哈希: {password_hash[:50]}...")

    # 测试常见密码
    found = False
    for test_pwd in test_passwords:
        if verify_password(test_pwd, password_hash):
            print(f"[OK] 密码是: {test_pwd}")
            found = True
            break

    if not found:
        print(f"[FAIL] 未找到匹配的密码 (尝试了: {', '.join(test_passwords)})")

conn.close()

print("\n" + "=" * 80)
print("如果所有密码都不匹配，可能需要重置密码")
print("=" * 80)