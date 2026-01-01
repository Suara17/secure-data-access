import { AlertTriangle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { SecurityLevelBadge } from '@/components/SecurityLevelBadge';
import { SecurityLevel } from '@/types/security';

interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  resourceName: string;
  securityLevel: SecurityLevel;
  loading?: boolean;
}

export function DeleteConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  resourceName,
  securityLevel,
  loading = false
}: DeleteConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            确认删除操作
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-3 pt-2">
            <div>
              您即将删除以下资源:
            </div>
            <div className="bg-muted p-3 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">资源名称:</span>
                <span className="text-sm text-foreground">{resourceName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">安全等级:</span>
                <SecurityLevelBadge level={securityLevel} size="sm" />
              </div>
            </div>
            <div className="text-destructive font-medium">
              ⚠️ 警告: 此操作将物理删除数据,不可恢复!
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>取消</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={loading}
            className="bg-destructive hover:bg-destructive/90"
          >
            {loading ? '删除中...' : '确认删除'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
