#!/usr/bin/env python3
import sys
import os

print(f"Current working directory: {os.getcwd()}")
print(f"Script directory: {os.path.dirname(os.path.abspath(__file__))}")

# Add current directory to path
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, current_dir)
print(f"Added to sys.path: {current_dir}")
print(f"sys.path: {sys.path}")

try:
    import database
    print("database import successful")
except ImportError as e:
    print(f"database import failed: {e}")

try:
    import models
    print("models import successful")
except ImportError as e:
    print(f"models import failed: {e}")

try:
    import security_engine
    print("security_engine import successful")
except ImportError as e:
    print(f"security_engine import failed: {e}")

try:
    import main
    print("main import successful")
except ImportError as e:
    print(f"main import failed: {e}")

# 测试数据库连接和数据
print("\n--- Database Connection Test ---")
try:
    from database import engine, SessionLocal
    from models import User, SecurityLevel

    # 创建表
    models.Base.metadata.create_all(bind=engine)
    print("✅ 数据库连接成功，表创建完成")

    # 检查用户数据
    db = SessionLocal()
    users = db.query(User).all()
    print(f"📊 找到 {len(users)} 个用户:")
    for user in users:
        level_name = user.security_label.level_name if user.security_label else 'N/A'
        print(f"  - {user.username}: {user.real_name} (等级: {level_name}, 密码: {user.password_hash})")

    if len(users) == 0:
        print("⚠️  用户表为空，可能需要先运行SQL脚本创建数据")

    db.close()

except Exception as e:
    print(f"❌ 数据库测试失败: {e}")
    import traceback
    traceback.print_exc()
