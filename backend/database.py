from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base

# ❗注意：把 root:123456 改成你本地 MySQL 的账号密码
# 格式：mysql+pymysql://用户名:密码@地址:端口/数据库名
SQLALCHEMY_DATABASE_URL = "mysql+pymysql://root:123456@localhost:3306/secure_access_db"

# 创建引擎（电话线插头）
engine = create_engine(SQLALCHEMY_DATABASE_URL)

# 创建会话工厂（打电话的人）
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 创建模型基类（所有表的祖宗类）
Base = declarative_base()

# 一个工具函数：用来获取数据库连接，用完自动关闭
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
