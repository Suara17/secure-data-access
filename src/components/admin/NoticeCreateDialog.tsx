import { useState } from 'react';
import { Plus } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SecurityLevelInfo } from '@/types/security';

interface NoticeCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  securityLevels: SecurityLevelInfo[];
  categories: any[];
  onSave: (data: { title: string; content: string; data_security_level_id: number; data_category_id: number }) => Promise<void>;
  loading?: boolean;
}

export function NoticeCreateDialog({
  open,
  onOpenChange,
  securityLevels,
  categories,
  onSave,
  loading = false
}: NoticeCreateDialogProps) {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    data_security_level_id: 1,
    data_category_id: 1,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData);
    // 重置表单
    setFormData({
      title: '',
      content: '',
      data_security_level_id: 1,
      data_category_id: 1,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            录入公告数据
          </DialogTitle>
          <DialogDescription>
            填写公告信息并设置安全标记
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="title">公告标题</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="输入公告标题"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">公告内容</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="输入公告内容"
              rows={5}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>安全等级</Label>
            <Select
              value={formData.data_security_level_id.toString()}
              onValueChange={(value) => setFormData({ ...formData, data_security_level_id: parseInt(value) })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {securityLevels.map((level) => (
                  <SelectItem key={level.level_id} value={level.level_id.toString()}>
                    {level.level_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>职能类别</Label>
            <Select
              value={formData.data_category_id.toString()}
              onValueChange={(value) => setFormData({ ...formData, data_category_id: parseInt(value) })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.category_id} value={cat.category_id.toString()}>
                    {cat.category_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              取消
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? '保存中...' : '保存'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}