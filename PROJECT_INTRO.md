# 项目介绍：安全数据访问系统 (Secure Data Access System)

## 1. 项目概述

本项目是一个专注于**多级安全数据访问控制**的全栈应用程序。它旨在模拟和实现类似军事或高安全性环境中的数据访问策略（如 Bell-LaPadula 模型）。

核心功能围绕着**强制访问控制 (MAC)** 展开，确保用户只能访问其安全许可等级允许的数据资源。系统区分了普通用户和管理员，提供了不同的工作空间和管理面板。

### 核心特性
*   **多级安全策略**: 实现了“向下读取 (Read Down)”策略，即用户仅能读取安全等级等于或低于其自身许可等级的数据。
*   **角色访问控制 (RBAC)**: 区分管理员 (Admin) 和普通用户 (User) 角色。
    *   **管理员**: 拥有管理仪表板，可管理系统设置、用户和资源。
    *   **普通用户**: 拥有个人工作空间，用于浏览和访问授权范围内的数据。
*   **实时反馈**: 前端界面根据用户的安全等级实时展示或隐藏/锁定敏感内容。
*   **现代 UI/UX**: 使用 Shadcn/ui 和 Tailwind CSS 构建的现代化、响应式用户界面。

## 2. 技术栈

本项目采用现代化的前后端分离架构。

### 前端 (Frontend)
*   **框架**: [React](https://react.dev/) (v18)
*   **语言**: [TypeScript](https://www.typescriptlang.org/)
*   **构建工具**: [Vite](https://vitejs.dev/)
*   **样式方案**: [Tailwind CSS](https://tailwindcss.com/)
*   **UI 组件库**: [shadcn/ui](https://ui.shadcn.com/) (基于 Radix UI)
*   **路由**: React Router DOM
*   **状态/数据管理**: React Query (@tanstack/react-query), Context API (AuthContext)
*   **表单处理**: React Hook Form + Zod

### 后端 (Backend)
*   **框架**: [FastAPI](https://fastapi.tiangolo.com/) (Python)
*   **语言**: Python 3.11+
*   **ORM**: [SQLAlchemy](https://www.sqlalchemy.org/)
*   **服务器**: Uvicorn
*   **数据校验**: Pydantic

### 数据库 (Database)
*   使用 SQLAlchemy 作为 ORM，支持多种数据库后端（开发环境通常使用 SQLite，生产环境可配置为 PostgreSQL 或 MySQL）。

## 3. 目录结构说明

主要目录结构如下：

```
secure-data-access-main/
├── backend/                # 后端代码目录
│   ├── main.py             # FastAPI 应用入口
│   ├── models.py           # SQLAlchemy 数据库模型定义
│   ├── schemas.py          # Pydantic 数据验证模型
│   ├── database.py         # 数据库连接配置
│   ├── security_engine.py  # 核心安全访问逻辑实现 (BLP 模型)
│   └── ...
├── src/                    # 前端源代码目录
│   ├── components/         # React 组件
│   │   ├── ui/             # shadcn/ui 基础组件
│   │   ├── ...             # 业务组件 (如 SecurityLevelBadge)
│   ├── pages/              # 页面组件 (Login, AdminDashboard, UserWorkspace)
│   ├── contexts/           # React Context (如 AuthContext)
│   ├── lib/                # 工具函数
│   ├── hooks/              # 自定义 Hooks
│   ├── types/              # TypeScript 类型定义
│   ├── App.tsx             # 根组件及路由配置
│   └── main.tsx            # 应用入口
├── public/                 # 静态资源
├── package.json            # 前端依赖配置
├── vite.config.ts          # Vite 配置
└── README.md               # 原始项目说明
```

## 4. 核心逻辑片段

**安全引擎 (`backend/security_engine.py`)**:
核心的访问控制逻辑位于后端，确保只有满足安全条件（用户等级 >= 资源等级）的请求才会被允许。

```python
def verify_access(user: User, resource: DataResource, action: str = "read") -> bool:
    # ...
    if user_level >= resource_level:
        return True
    # ...
```

## 5. 启动与运行

通常的开发启动流程：

1.  **启动后端**:
    进入 `backend` 目录或根目录，激活虚拟环境并运行：
    ```bash
    uvicorn backend.main:app --reload --port 8001
    ```

2.  **启动前端**:
    在根目录运行：
    ```bash
    npm run dev
    ```

---
*生成日期: 2025-12-25*
