import { useState } from 'react';
import { Edit2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SecurityLevelInfo } from '@/types/security';

interface UserLabelsEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: number;
  username: string;
  realName: string;
  securityLevelId: number;
  categoryId: number;
  securityLevels: SecurityLevelInfo[];
  categories: any[];
  onSave: (userId: number, securityLevelId: number, categoryId: number) => Promise<void>;
  loading?: boolean;
}

export function UserLabelsEditDialog({
  open,
  onOpenChange,
  userId,
  username,
  realName,
  securityLevelId,
  categoryId,
  securityLevels,
  categories,
  onSave,
  loading = false
}: UserLabelsEditDialogProps) {
  const [selectedSecurityLevelId, setSelectedSecurityLevelId] = useState(securityLevelId);
  const [selectedCategoryId, setSelectedCategoryId] = useState(categoryId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(userId, selectedSecurityLevelId, selectedCategoryId);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit2 className="w-5 h-5" />
            修改用户安全标记
          </DialogTitle>
          <DialogDescription>
            修改用户 <strong>{username} ({realName})</strong> 的安全等级和职能类别
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="security-level">安全等级</Label>
            <Select
              value={selectedSecurityLevelId.toString()}
              onValueChange={(value) => setSelectedSecurityLevelId(parseInt(value))}
            >
              <SelectTrigger id="security-level">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {securityLevels.map((level) => (
                  <SelectItem key={level.level_id} value={level.level_id.toString()}>
                    {level.level_name} - {level.description}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">职能类别</Label>
            <Select
              value={selectedCategoryId.toString()}
              onValueChange={(value) => setSelectedCategoryId(parseInt(value))}
            >
              <SelectTrigger id="category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.category_id} value={cat.category_id.toString()}>
                    {cat.category_name} - {cat.description}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="bg-muted/50 p-3 rounded-lg text-sm text-muted-foreground">
            <p className="font-medium mb-1">注意:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>修改安全等级将影响用户的数据访问权限</li>
              <li>修改职能类别将影响用户可访问的数据范围</li>
              <li>此操作将被记录在审计日志中</li>
            </ul>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              取消
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? '保存中...' : '保存修改'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}