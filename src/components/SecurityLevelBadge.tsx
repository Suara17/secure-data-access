import { SecurityLevel, getSecurityLevelInfo } from '@/types/security';
import { Shield, ShieldAlert, ShieldCheck, ShieldOff, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SecurityLevelBadgeProps {
  level: SecurityLevel;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

const levelIcons = {
  'public': ShieldOff,
  'internal': Shield,
  'confidential': ShieldCheck,
  'secret': ShieldAlert,
  'top-secret': Lock,
};

export function SecurityLevelBadge({ level, size = 'md', showIcon = true }: SecurityLevelBadgeProps) {
  const info = getSecurityLevelInfo(level);
  const Icon = levelIcons[level];
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-sm px-3 py-1 gap-1.5',
    lg: 'text-base px-4 py-1.5 gap-2',
  };

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16,
  };

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full border transition-all',
        sizeClasses[size],
        `security-level-${level}`
      )}
    >
      {showIcon && <Icon size={iconSizes[size]} />}
      {info.label}
    </span>
  );
}
