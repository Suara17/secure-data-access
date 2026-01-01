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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SecurityLevelInfo } from '@/types/security';

interface SalaryCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  securityLevels: SecurityLevelInfo[];
  categories: any[];
  onSave: (data: { employee_name: string; base_salary: number; bonus: number; data_security_level_id: number; data_category_id: number }) => Promise<void>;
  loading?: boolean;
}

export function SalaryCreateDialog({
  open,
  onOpenChange,
  securityLevels,
  categories,
  onSave,
  loading = false
}: SalaryCreateDialogProps) {
  const [formData, setFormData] = useState({
    employee_name: '',
    base_salary: 0,
    bonus: 0,
    data_security_level_id: 1,
    data_category_id: 1,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData);
    // 重置表单
    setFormData({
      employee_name: '',
      base_salary: 0,
      bonus: 0,
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
            录入薪资数据
          </DialogTitle>
          <DialogDescription>
            填写员工薪资信息并设置安全标记
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="employee_name">员工姓名</Label>
            <Input
              id="employee_name"
              value={formData.employee_name}
              onChange={(e) => setFormData({ ...formData, employee_name: e.target.value })}
              placeholder="输入员工姓名"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="base_salary">基本薪资</Label>
              <Input
                id="base_salary"
                type="number"
                step="0.01"
                value={formData.base_salary || ''}
                onChange={(e) => setFormData({ ...formData, base_salary: parseFloat(e.target.value) || 0 })}
                placeholder="基本薪资"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bonus">奖金</Label>
              <Input
                id="bonus"
                type="number"
                step="0.01"
                value={formData.bonus || ''}
                onChange={(e) => setFormData({ ...formData, bonus: parseFloat(e.target.value) || 0 })}
                placeholder="奖金"
              />
            </div>
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