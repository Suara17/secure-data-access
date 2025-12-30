[根目录](../CLAUDE.md) > [src](.) > **contexts**

# AuthContext 模块文档

## 模块职责

AuthContext 模块是整个应用的认证和授权核心，负责管理用户会话状态、处理登录/登出逻辑，以及提供用户权限信息（如是否认证、是否为管理员）给其他组件使用。

## 入口与启动

- 主要入口: `src/contexts/AuthContext.tsx`
- 被 `App.tsx` 中的 `AuthProvider` 组件包装整个应用
- 提供 `useAuth()` 自定义 Hook 供组件消费认证状态

## 对外接口

### Context API

- `user`: 当前登录用户信息 (User | null)
- `isAuthenticated`: 用户是否已认证 (boolean)
- `isAdmin`: 用户是否为管理员 (boolean)
- `login(username: string, password: string)`: 用户登录方法
- `logout()`: 用户登出方法

### 导出的常量/类型

- `MOCK_USERS`: 预定义的演示用户数据
- `AuthProvider`: 认证上下文提供者组件
- `useAuth()`: 认证状态消费 Hook

## 关键依赖与配置

- `@/types/security`: 导入 User 类型和 SecurityLevel 类型
- React Context API: 实现状态管理
- 模拟延迟: 登录过程模拟了 800ms 的 API 延迟

## 数据模型

### 认证用户数据
- 从 `MOCK_USERS` 中验证凭据
- 存储用户基本信息（不含密码）
- 维护认证状态的响应性

### 安全等级验证
- 基于用户角色判断是否为管理员
- 提供简单易用的权限检查接口

## 测试与质量

- 完整的错误处理（无效凭据）
- 类型安全（TypeScript）
- Context 错误防护（在没有 Provider 时抛出错误）

## 常见问题 (FAQ)

1. **如何扩展用户认证方式？**
   - 目前使用硬编码的演示用户，可通过修改 `MOCK_USERS` 添加新用户
   - 可扩展为真实 API 调用接口

2. **安全等级是如何在认证过程中处理的？**
   - 用户凭据验证时只处理用户名/密码匹配
   - 安全等级作为用户属性在认证后提供

## 相关文件清单

- `src/contexts/AuthContext.tsx`: 主要逻辑实现
- `src/types/security.ts`: 用户类型定义
- `src/App.tsx`: AuthProvider 包装应用
- `src/pages/Login.tsx`: 登录功能使用
- `src/pages/AdminDashboard.tsx`: 管理员权限验证
- `src/pages/UserWorkspace.tsx`: 用户权限验证

## 变更记录 (Changelog)

### 2025-12-30
- 识别并文档化认证上下文模块功能
- 详细描述认证状态管理机制