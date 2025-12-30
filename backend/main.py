from fastapi import FastAPI, Depends, HTTPException, status, Form
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timezone, timedelta
from jose import JWTError, jwt
import uvicorn

# 引入我们刚才写的文件
import models
import schemas
from database import engine, get_db

# JWT 配置
SECRET_KEY = "your-secret-key-here"  # 在生产环境中应该从环境变量读取
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# 简单的密码验证函数（因为数据库中存储的是明文密码）
def verify_password(plain_password, stored_password):
    # 直接比较明文密码
    return plain_password == stored_password

# JWT token 函数
def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = schemas.TokenData(username=username)
    except JWTError:
        raise credentials_exception
    user = db.query(models.User).filter(models.User.username == token_data.username).first()
    if user is None:
        raise credentials_exception
    return user

# 1. 自动在数据库创建表（虽然我们已经用SQL建过了，但这行代码能确保连接正常）
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# CORS 配置 - 允许前端跨域请求
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:8080", "http://127.0.0.1:8080"],  # 前端开发服务器地址
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 认证接口 ---

@app.post("/token", response_model=schemas.Token)
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    # 验证用户
    user = db.query(models.User).filter(models.User.username == form_data.username).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    # 验证明文密码（因为数据库中存储的是明文）
    if not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # 创建访问令牌
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/users/me", response_model=schemas.UserResponse)
async def read_users_me(current_user: models.User = Depends(get_current_user)):
    # 构建返回的用户信息
    return {
        "id": current_user.user_id,
        "username": current_user.username,
        "email": None,  # 数据库中没有email字段
        "role": current_user.trust_level.lower(),  # 'user' 或 'admin'
        "security_level": {
            "level_id": current_user.security_label.level_id,
            "level_name": current_user.security_label.level_name,
            "level_weight": current_user.security_label.level_weight,
            "description": current_user.security_label.description
        },
        "created_at": current_user.created_at.isoformat() if current_user.created_at else None
    }

# --- 其他接口 ---

# 接口功能：获取所有安全等级
# URL地址：http://localhost:8000/security-levels
@app.get("/security-levels", response_model=List[schemas.SecurityLevelBase])
def read_security_levels(db: Session = Depends(get_db)):
    # 逻辑：去数据库查 sys_security_level 表的所有数据
    levels = db.query(models.SecurityLevel).all()
    return levels

# 启动代码
if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8002)  # 改为8002端口