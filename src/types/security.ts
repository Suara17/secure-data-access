export type SecurityLevel = '公开' | '内部' | '秘密' | '机密';

export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'user';
  securityLevel: SecurityLevel;
  createdAt: Date;
}

export interface SecurityRule {
  id: string;
  name: string;
  level: SecurityLevel;
  description: string;
  priority: number;
  isActive: boolean;
}

export interface DataRecord {
  id: string;
  title: string;
  content: string;
  category: string;
  securityLevel: SecurityLevel;
  createdBy: string;
  createdAt: Date;
}

export interface AuditLog {
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
