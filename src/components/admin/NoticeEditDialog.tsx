import { useState, useEffect } from 'react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface NoticeData {
  notice_id: number;
  title: string;
  content: string;
  data_security_level_id: number;
  data_category_id: number;
  security_level?: {
    level_name: string;
  };
}

interface NoticeEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notice: NoticeData | null;
  onSave: (id: number, data: { title?: string; content?: string }) => Promise<void>;
  loading?: boolean;
}

export function NoticeEditDialog({
  open,
  onOpenChange,
  notice,
  onSave,
  loading = false
}: NoticeEditDialogProps) {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
  });

  // 当 notice 改变时更新表单数据
  useEffect(() => {
    if (notice) {
      setFormData({
        title: notice.title,
        content: notice.content,
      });
    }
  }, [notice]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notice) return;

    await onSave(notice.notice_id, formData);
  };

  if (!notice) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit2 className="w-5 h-5" />
            编辑公告信息
          </DialogTitle>
          <DialogDescription>
            修改公告 <strong>{notice.title}</strong> 的内容
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="edit-notice-title">公告标题</Label>
            <Input
              id="edit-notice-title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="输入公告标题"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-notice-content">公告内容</Label>
            <Textarea
              id="edit-notice-content"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="输入公告内容"
              rows={6}
              required
            />
          </div>

          <div className="bg-muted/50 p-3 rounded-lg text-sm text-muted-foreground">
            <p className="font-medium mb-1">注意:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>仅允许修改标题和内容</li>
              <li>安全等级和类别不可修改</li>
              <li>当前安全等级: <strong className="text-foreground">{notice.security_level?.level_name}</strong></li>
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
