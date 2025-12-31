export type SecurityLevel = '公开' | '内部' | '秘密' | '机密';

// API响应类型 - 与后端匹配
export interface SecurityLevelInfo {
  level_id: number;
  level_name: string;
  level_weight: number;
  description?: string;
}

export interface CategoryInfo {
  category_id: number;
  category_code: string;
  category_name: string;
  description?: string;
}

// 用户认证相关
export interface User {
  id: number;
  username: string;
  email?: string;
  role: 'admin' | 'user';
  security_level: SecurityLevelInfo & { level_name: SecurityLevel };
  created_at: string;
}

// 管理员用户响应
export interface AdminUser {
  id: number;
  username: string;
  real_name: string;
  security_level: SecurityLevelInfo;
  category: CategoryInfo;
  trust_level: string;
  created_at: string;
}

// 薪资记录
export interface SalaryRecord {
  employee_name: string;
  amount: number | null;
  security_level: string;
  access_result: 'ALLOW' | 'DENY';
}

// 公告记录
export interface NoticeRecord {
  title: string;
  content: string | null;
  security_level: string;
  access_result: 'ALLOW' | 'DENY';
}

// 审计日志
export interface AuditLog {
  request_time: string;
  username: string;
  resource_name: string;
  operation: string;
  result: 'ALLOW' | 'DENY';
  fail_reason?: string;
}

// 用户创建请求
export interface CreateUserRequest {
  username: string;
  password: string;
  real_name: string;
  security_level_id: number;
  category_id: number;
}

// 用户标签更新请求
export interface UpdateUserLabelsRequest {
  security_level_id: number;
  category_id: number;
}

// 薪资录入请求
export interface CreateSalaryRequest {
  employee_name: string;
  base_salary: number;
  bonus?: number;
  data_security_level_id: number;
  data_category_id: number;
}

// 公告录入请求
export interface CreateNoticeRequest {
  title: string;
  content: string;
  data_security_level_id: number;
  data_category_id: number;
}

// 兼容原有代码的接口（用于mock数据）
export interface LegacySecurityRule {
  id: string;
  name: string;
  level: SecurityLevel;
  description: string;
  priority: number;
  isActive: boolean;
}

export interface LegacyDataRecord {
  id: string;
  title: string;
  content: string;
  category: string;
  securityLevel: SecurityLevel;
  createdBy: string;
  createdAt: Date;
}

export interface LegacyAuditLog {
  id: string;
  userId: string;
  username: string;
  action: 'access' | 'modify' | 'delete' | 'denied';
  resourceId: string;
  resourceName: string;
  subjectLevel: SecurityLevel;
  objectLevel: SecurityLevel;
  success: boolean;
  timestamp: Date;
  ipAddress: string;
}

export const SECURITY_LEVELS: { value: SecurityLevel; label: string; priority: number }[] = [
  { value: '公开', label: '公开', priority: 1 },
  { value: '内部', label: '内部', priority: 2 },
  { value: '秘密', label: '秘密', priority: 3 },
  { value: '机密', label: '机密', priority: 4 },
];

export const getSecurityLevelInfo = (level: SecurityLevel) => {
  return SECURITY_LEVELS.find(l => l.value === level) || SECURITY_LEVELS[0];
};

export const canAccess = (subjectLevel: SecurityLevel, objectLevel: SecurityLevel): boolean => {
  const subject = getSecurityLevelInfo(subjectLevel);
  const object = getSecurityLevelInfo(objectLevel);
  return subject.priority >= object.priority;
};
