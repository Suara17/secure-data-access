[根目录](../CLAUDE.md) > [src](.) > **types**

# Security Types 模块文档

## 模块职责

Security Types 模块定义了整个安全数据访问系统的核心数据类型和安全逻辑，包括安全等级、用户模型、数据记录模型、审计日志模型以及安全访问控制函数。这是整个系统的类型基础和业务逻辑核心。

## 入口与启动

- 主要入口: `src/types/security.ts`
- 被多个组件和模块引用以确保类型安全
- 包含静态数据定义和安全逻辑函数

## 对外接口

### 类型定义

- `SecurityLevel`: 定义安全等级的联合类型 ('public' | 'internal' | 'confidential' | 'secret' | 'top-secret')
- `User`: 用户信息接口，包含安全等级标记
- `SecurityRule`: 安全规则定义
- `DataRecord`: 数据记录模型，包含安全等级标记
- `AuditLog`: 审计日志模型，记录访问事件

### 工具函数

- `getSecurityLevelInfo(level: SecurityLevel)`: 获取安全等级信息
- `canAccess(subjectLevel: SecurityLevel, objectLevel: SecurityLevel): boolean`: 核心访问控制逻辑

### 静态数据

- `SECURITY_LEVELS`: 安全等级优先级数组
- 定义了各安全等级的优先级数值

## 关键依赖与配置

- 使用 TypeScript 严格的类型定义
- 包含完整的安全等级优先级系统
- 实现了强制访问控制（MAC）的核心逻辑

## 数据模型

### 安全等级模型

安全等级按照以下优先级排列（数值越高权限越高）：
1. public (优先级 1) - 公开
2. internal (优先级 2) - 内部
3. confidential (优先级 3) - 机密
4. secret (优先级 4) - 秘密
5. top-secret (优先级 5) - 绝密

### 访问控制逻辑

- 使用 `canAccess()` 函数实现强制访问控制
- 原则：主体安全等级 ≥ 客体安全等级 时允许访问
- 这是整个系统权限控制的核心算法

### 数据实体模型

- `User`: 包含基本用户信息、角色和安全等级标记
- `DataRecord`: 包含数据内容和其安全等级标记
- `AuditLog`: 记录访问事件的详细信息，包括主体和客体安全等级

## 测试与质量

- 类型安全：所有安全等级相关操作都有类型保障
- 逻辑安全：访问控制逻辑集中实现，减少错误
- 可扩展性：安全等级定义易于扩展

## 常见问题 (FAQ)

1. **如何添加新的安全等级？**
   - 在 `SecurityLevel` 联合类型中添加新值
   - 在 `SECURITY_LEVELS` 数组中添加相应的条目
   - 为新等级分配合适的优先级数值

2. **访问控制逻辑是如何工作的？**
   - `canAccess()` 函数比较主体和客体的优先级数值
   - 仅当主体优先级 ≥ 客体优先级时返回 true

3. **为什么使用优先级数值？**
   - 简化安全等级比较逻辑
   - 便于扩展新的安全等级
   - 与安全标记模型（Security Label Model）一致

## 相关文件清单

- `src/types/security.ts`: 核心类型定义和安全逻辑
- `src/contexts/AuthContext.tsx`: 使用 User 类型
- `src/components/SecurityLevelBadge.tsx`: 使用安全等级类型显示标记
- `src/pages/AdminDashboard.tsx`: 使用数据模型和安全逻辑
- `src/pages/UserWorkspace.tsx`: 使用访问控制逻辑
- `src/data/mockData.ts`: 使用所有数据模型定义示例数据

## 变更记录 (Changelog)

### 2025-12-30
- 识别并文档化安全类型系统
- 详细描述安全标记访问控制机制
- 记录核心访问控制算法