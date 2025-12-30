from fastapi import FastAPI, Depends, HTTPException, status, Form, Query
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import desc
from typing import List, Optional
from datetime import datetime, timezone, timedelta
from jose import JWTError, jwt
import uvicorn

# 引入我们刚才写的文件
import models
import schemas
from database import engine, get_db
from security_engine import verify_access

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

async def get_current_admin(current_user: models.User = Depends(get_current_user)):
    if current_user.trust_level != 'ADMIN':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions: Admin access required"
        )
    return current_user

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

# --- 核心业务数据接口 ---

@app.get("/api/salaries", response_model=List[schemas.SalaryBase])
async def get_salaries(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    获取当前用户权限范围内的所有薪资记录。
    核心逻辑: 查询ACTIVE状态的薪资记录，对每条记录调用安全引擎验证访问权限。
    脱敏处理: 如果DENY，返回脱敏数据（金额为null）。
    记录审计: 无论ALLOW还是DENY，都记录审计日志。
    """
    # 查询所有ACTIVE状态的薪资记录
    salaries = db.query(models.Salary).filter(models.Salary.lifecycle_status == 'ACTIVE').all()

    result = []
    for salary in salaries:
        # 调用安全引擎验证访问权限
        allowed = verify_access(current_user, salary, "read", db)

        # 计算总金额
        total_amount = float(salary.base_salary) + float(salary.bonus)

        # 构建响应数据
        salary_data = {
            "employee_name": salary.employee_name,
            "amount": total_amount if allowed else None,
            "security_level": salary.security_label.level_name if salary.security_label else "未知",
            "access_result": "ALLOW" if allowed else "DENY"
        }
        result.append(salary_data)

    return result

@app.get("/api/salaries/{salary_id}", response_model=schemas.SalaryDetail)
async def get_salary_detail(salary_id: int, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    获取单条薪资详细信息。
    逻辑: 查询ID后立即执行verify_access，如果DENY直接返回403 Forbidden。
    """
    # 查询薪资记录
    salary = db.query(models.Salary).filter(models.Salary.data_id == salary_id).first()
    if not salary:
        raise HTTPException(status_code=404, detail="Salary record not found")

    # 验证访问权限
    allowed = verify_access(current_user, salary, "read", db)
    if not allowed:
        raise HTTPException(status_code=403, detail="Access denied")

    # 返回详细信息
    return {
        "id": salary.data_id,
        "employee_name": salary.employee_name,
        "base_salary": float(salary.base_salary),
        "bonus": float(salary.bonus),
        "security_level": salary.security_label.level_name if salary.security_label else "未知",
        "category": salary.category.category_name if salary.category else "未知",
        "lifecycle_status": salary.lifecycle_status,
        "create_time": salary.create_time.isoformat() if salary.create_time else None
    }

@app.get("/api/notices", response_model=List[schemas.NoticeBase])
async def get_notices(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    获取公告信息。
    核心逻辑: 同薪资列表，需验证用户的职能和安全等级是否满足公告的data_category_id和data_security_level_id。
    """
    # 查询所有公告记录
    notices = db.query(models.Notice).all()

    result = []
    for notice in notices:
        # 调用安全引擎验证访问权限
        allowed = verify_access(current_user, notice, "read", db)

        # 构建响应数据
        notice_data = {
            "title": notice.title,
            "content": notice.content if allowed else None,
            "security_level": notice.security_label.level_name if notice.security_label else "未知",
            "access_result": "ALLOW" if allowed else "DENY"
        }
        result.append(notice_data)

    return result

# --- 系统管理接口 (Admin APIs) ---

@app.get("/api/admin/users", response_model=List[schemas.UserAdminResponse])
async def get_admin_users(current_admin: models.User = Depends(get_current_admin), db: Session = Depends(get_db)):
    """
    查看所有用户及其当前的安全标记。
    仅管理员可访问。
    """
    users = db.query(models.User).all()
    result = []
    for user in users:
        result.append({
            "id": user.user_id,
            "username": user.username,
            "real_name": user.real_name,
            "security_level": {
                "level_id": user.security_label.level_id,
                "level_name": user.security_label.level_name,
                "level_weight": user.security_label.level_weight,
                "description": user.security_label.description
            },
            "category": {
                "category_id": user.category.category_id,
                "category_code": user.category.category_code,
                "category_name": user.category.category_name,
                "description": user.category.description
            },
            "trust_level": user.trust_level,
            "created_at": user.created_at.isoformat() if user.created_at else None
        })
    return result

@app.post("/api/admin/users", response_model=schemas.UserAdminResponse)
async def create_admin_user(user_data: schemas.UserCreate, current_admin: models.User = Depends(get_current_admin), db: Session = Depends(get_db)):
    """
    创建新用户并分配主体标记（等级、职能）。
    仅管理员可访问。
    """
    # 检查用户名是否已存在
    existing_user = db.query(models.User).filter(models.User.username == user_data.username).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already exists")

    # 创建新用户
    new_user = models.User(
        username=user_data.username,
        password_hash=user_data.password,  # 注意：这里存储的是明文密码，根据现有代码
        real_name=user_data.real_name,
        security_level_id=user_data.security_level_id,
        category_id=user_data.category_id,
        trust_level='USER'  # 默认创建普通用户
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # 返回创建的用户信息
    return {
        "id": new_user.user_id,
        "username": new_user.username,
        "real_name": new_user.real_name,
        "security_level": {
            "level_id": new_user.security_label.level_id,
            "level_name": new_user.security_label.level_name,
            "level_weight": new_user.security_label.level_weight,
            "description": new_user.security_label.description
        },
        "category": {
            "category_id": new_user.category.category_id,
            "category_code": new_user.category.category_code,
            "category_name": new_user.category.category_name,
            "description": new_user.category.description
        },
        "trust_level": new_user.trust_level,
        "created_at": new_user.created_at.isoformat() if new_user.created_at else None
    }

@app.put("/api/admin/users/{user_id}/labels", response_model=schemas.UserAdminResponse)
async def update_user_labels(user_id: int, labels_data: schemas.UserLabelsUpdate, current_admin: models.User = Depends(get_current_admin), db: Session = Depends(get_db)):
    """
    调整主体标记（如将某人从"秘密"提拔为"机密"）。
    仅管理员可访问。
    """
    user = db.query(models.User).filter(models.User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # 更新安全标记
    user.security_level_id = labels_data.security_level_id
    user.category_id = labels_data.category_id
    db.commit()
    db.refresh(user)

    # 返回更新后的用户信息
    return {
        "id": user.user_id,
        "username": user.username,
        "real_name": user.real_name,
        "security_level": {
            "level_id": user.security_label.level_id,
            "level_name": user.security_label.level_name,
            "level_weight": user.security_label.level_weight,
            "description": user.security_label.description
        },
        "category": {
            "category_id": user.category.category_id,
            "category_code": user.category.category_code,
            "category_name": user.category.category_name,
            "description": user.category.description
        },
        "trust_level": user.trust_level,
        "created_at": user.created_at.isoformat() if user.created_at else None
    }

@app.post("/api/admin/salaries")
async def create_admin_salary(salary_data: schemas.SalaryCreate, current_admin: models.User = Depends(get_current_admin), db: Session = Depends(get_db)):
    """
    录入薪资数据并定密（分配客体标记）。
    仅管理员可访问。
    """
    new_salary = models.Salary(
        employee_name=salary_data.employee_name,
        base_salary=salary_data.base_salary,
        bonus=salary_data.bonus,
        data_security_level_id=salary_data.data_security_level_id,
        data_category_id=salary_data.data_category_id,
        lifecycle_status='ACTIVE'
    )
    db.add(new_salary)
    db.commit()
    db.refresh(new_salary)
    return {"message": "Salary record created successfully", "id": new_salary.data_id}

@app.post("/api/admin/notices")
async def create_admin_notice(notice_data: schemas.NoticeCreate, current_admin: models.User = Depends(get_current_admin), db: Session = Depends(get_db)):
    """
    发布新公告并定密。
    仅管理员可访问。
    """
    new_notice = models.Notice(
        title=notice_data.title,
        content=notice_data.content,
        data_security_level_id=notice_data.data_security_level_id,
        data_category_id=notice_data.data_category_id
    )
    db.add(new_notice)
    db.commit()
    db.refresh(new_notice)
    return {"message": "Notice created successfully", "id": new_notice.notice_id}

@app.get("/api/admin/security-levels", response_model=List[schemas.SecurityLevelBase])
async def get_admin_security_levels(current_admin: models.User = Depends(get_current_admin), db: Session = Depends(get_db)):
    """
    获取系统支持的所有密级（公开、内部、秘密、机密）。
    用于前端下拉框选择。仅管理员可访问。
    """
    levels = db.query(models.SecurityLevel).all()
    return levels

@app.get("/api/admin/audit-logs", response_model=List[schemas.AuditLogBase])
async def get_admin_audit_logs(
    current_admin: models.User = Depends(get_current_admin),
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1, description="页码，从1开始"),
    size: int = Query(50, ge=1, le=100, description="每页记录数，最大100")
):
    """
    分页查询系统内的访问记录。
    数据源: 联表查询 sys_access_policy 和 sys_access_decision。
    仅管理员可访问。
    """
    # 计算偏移量
    offset = (page - 1) * size

    # 查询访问决策结果，通过relationship获取关联的策略和用户信息
    query = (
        db.query(models.AccessDecision)
        .options(joinedload(models.AccessDecision.policy).joinedload(models.AccessPolicy.user))
        .order_by(desc(models.AccessDecision.decision_time))
        .offset(offset)
        .limit(size)
    )

    decisions = query.all()

    audit_logs = []
    for decision in decisions:
        policy = decision.policy
        if not policy:
            continue

        # 根据目标表和对象ID获取资源名称
        resource_name = _get_resource_name(policy.target_table, policy.object_data_id, db)

        # 构造审计日志记录
        audit_log = {
            "request_time": policy.request_time.isoformat() if policy.request_time else None,
            "username": policy.user.username if policy.user else "未知用户",
            "resource_name": resource_name,
            "operation": policy.operation_requested,
            "result": decision.result_code,
            "fail_reason": decision.result_message
        }
        audit_logs.append(audit_log)

    return audit_logs

def _get_resource_name(target_table: str, object_data_id: int, db: Session) -> str:
    """
    根据表名和对象ID获取资源名称
    """
    if target_table == "data_salary":
        salary = db.query(models.Salary).filter(models.Salary.data_id == object_data_id).first()
        if salary:
            return f"{salary.employee_name}薪资"
    elif target_table == "data_notice":
        notice = db.query(models.Notice).filter(models.Notice.notice_id == object_data_id).first()
        if notice:
            return f"公告：{notice.title}"

    # 如果找不到具体资源，返回通用描述
    return f"{target_table} ID:{object_data_id}"

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
