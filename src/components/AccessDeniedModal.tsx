import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ShieldX, AlertTriangle } from 'lucide-react';
import { SecurityLevel, getSecurityLevelInfo } from '@/types/security';
import { SecurityLevelBadge } from './SecurityLevelBadge';

interface AccessDeniedModalProps {
  open: boolean;
  onClose: () => void;
  subjectLevel: SecurityLevel;
  objectLevel: SecurityLevel;
  resourceName?: string;
}

export function AccessDeniedModal({
  open,
  onClose,
  subjectLevel,
  objectLevel,
  resourceName = '受保护资源',
}: AccessDeniedModalProps) {
  const subjectInfo = getSecurityLevelInfo(subjectLevel);
  const objectInfo = getSecurityLevelInfo(objectLevel);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-card border-destructive/50 glow-danger">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center animate-pulse">
            <ShieldX className="w-8 h-8 text-destructive" />
          </div>
          <DialogTitle className="text-xl text-destructive flex items-center justify-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            访问被拒绝
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            安全策略拦截：权限不足
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="glass-card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">请求资源</span>
              <span className="text-sm font-medium text-foreground">{resourceName}</span>
            </div>
            
            <div className="h-px bg-border" />
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">主体安全标记</span>
              <SecurityLevelBadge level={subjectLevel} size="sm" />
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">客体安全标记</span>
              <SecurityLevelBadge level={objectLevel} size="sm" />
            </div>
          </div>

          <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4">
            <p className="text-sm text-center">
              <span className="text-destructive font-semibold">拒绝原因：</span>
              <span className="text-muted-foreground ml-2">
                主体标记（{subjectInfo.label}，等级 {subjectInfo.priority}）
                <span className="text-destructive font-bold mx-2">&lt;</span>
                客体标记（{objectInfo.label}，等级 {objectInfo.priority}）
              </span>
            </p>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            此次越权访问已被记录到审计日志
          </p>
        </div>

        <Button
          onClick={onClose}
          variant="destructive"
          className="w-full"
        >
          确认
        </Button>
      </DialogContent>
    </Dialog>
  );
}
