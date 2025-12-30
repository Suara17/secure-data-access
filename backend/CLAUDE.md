# Backend 模块文档

> 🏠 [返回根目录](../CLAUDE.md)

## 模块概述

Backend 模块是基于 FastAPI 框架的后端服务，负责提供安全数据访问系统的 RESTful API 接口。该模块实现了基于 BLP（Bell-LaPadula）模型的强制访问控制机制，通过安全等级标记来控制用户对数据资源的访问权限。

## 技术栈

- **框架**: FastAPI
- **数据库**: MySQL + SQLAlchemy ORM
- **数据验证**: Pydantic
- **ASGI 服务器**: Uvicorn
- **Python 版本**: 3.11+

## 文件结构

```
backend/
├── main.py              # FastAPI 应用入口和路由定义
├── models.py            # SQLAlchemy 数据模型
├── schemas.py           # Pydantic 数据验证模式
├── database.py          # 数据库连接配置
├── security_engine.py   # 安全访问控制引擎
├── __init__.py          # 包初始化文件
└── test_import.py       # 测试导入文件
```

## 核心功能

### 1. 安全等级管理
- 管理系统的安全等级定义
- 提供安全等级查询接口
- 支持等级权重比较

### 2. 访问控制
- 基于 BLP 模型的访问控制验证
- 实现下读（Read Down）策略
- 支持扩展上写（Write Up）策略

### 3. 数据持久化
- 使用 SQLAlchemy ORM 进行数据映射
- 支持 MySQL 数据库
- 自动表结构创建

## API 接口

### GET /security-levels
获取所有安全等级列表

**响应示例**:
```json
[
  {
    "level_id": 1,
    "level_name": "public",
    "level_weight": 1,
    "description": "公开等级"
  },
  {
    "level_id": 2,
    "level_name": "internal",
    "level_weight": 2,
    "description": "内部等级"
  }
]
```

## 数据模型

### SecurityLevel
安全等级数据模型，对应数据库表 `sys_security_level`。

**字段**:
- `level_id`: 等级 ID（主键）
- `level_name`: 等级名称
- `level_weight`: 权重值（用于比较等级高低）
- `description`: 等级描述

## 安全引擎

### verify_access()
基于 BLP 模型的访问控制验证函数。

**参数**:
- `user`: 用户对象
- `resource`: 数据资源对象
- `action`: 操作类型（默认为 "read"）

**逻辑**:
1. 检查用户和资源的安全标签
2. 比较用户等级与资源等级
3. 根据操作类型决定是否允许访问

**返回**: `bool` - 是否允许访问

## 数据库配置

数据库连接配置在 `database.py` 中：

```python
SQLALCHEMY_DATABASE_URL = "mysql+pymysql://root:123456@localhost:3306/secure_access_db"
```

**注意**: 请根据实际环境修改数据库连接参数。

## 启动方式

```bash
# 进入后端目录
cd backend

# 启动服务
python main.py
```

服务启动后可通过以下地址访问：
- API 服务: http://127.0.0.1:8001
- API 文档: http://127.0.0.1:8001/docs

## 开发规范

### 代码风格
- 遵循 PEP 8 Python 编码规范
- 使用类型注解
- 函数和类需要添加文档字符串

### 数据库操作
- 使用 SQLAlchemy 进行 ORM 操作
- 通过依赖注入获取数据库会话
- 确保数据库连接正确关闭

### 安全考虑
- 所有 API 接口应进行权限验证
- 敏感数据不得在日志中输出
- 遵循最小权限原则

## 扩展计划

1. **用户认证**: 实现用户登录和认证机制
2. **数据资源管理**: 添加数据资源 CRUD 操作
3. **审计日志**: 记录所有访问操作的详细日志
4. **权限管理**: 实现更细粒度的权限控制
5. **数据加密**: 对敏感数据进行加密存储

## 依赖项

```
fastapi>=0.104.0
uvicorn>=0.24.0
sqlalchemy>=2.0.0
pymysql>=1.1.0
pydantic>=2.5.0
```

## 故障排除

### 常见问题

1. **数据库连接失败**
   - 检查 MySQL 服务是否启动
   - 验证数据库连接参数
   - 确认数据库用户权限

2. **端口占用**
   - 修改 `main.py` 中的端口号
   - 检查其他服务是否占用端口

3. **依赖包缺失**
   - 使用 `pip install` 安装所需依赖
   - 检查 Python 版本兼容性

---

*最后更新: 2025-12-30*