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

interface SalaryData {
  data_id: number;
  employee_name: string;
  base_salary: number;
  bonus: number;
  data_security_level_id: number;
  data_category_id: number;
  security_level?: {
    level_name: string;
  };
}

interface SalaryEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  salary: SalaryData | null;
  onSave: (id: number, data: { employee_name?: string; base_salary?: number; bonus?: number }) => Promise<void>;
  loading?: boolean;
}

export function SalaryEditDialog({
  open,
  onOpenChange,
  salary,
  onSave,
  loading = false
}: SalaryEditDialogProps) {
  const [formData, setFormData] = useState({
    employee_name: '',
    base_salary: 0,
    bonus: 0,
  });

  // 当 salary 改变时更新表单数据
  useEffect(() => {
    if (salary) {
      setFormData({
        employee_name: salary.employee_name,
        base_salary: salary.base_salary,
        bonus: salary.bonus,
      });
    }
  }, [salary]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!salary) return;

    await onSave(salary.data_id, formData);
  };

  if (!salary) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit2 className="w-5 h-5" />
            编辑薪资信息
          </DialogTitle>
          <DialogDescription>
            修改员工 <strong>{salary.employee_name}</strong> 的薪资信息
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="edit-employee-name">员工姓名</Label>
            <Input
              id="edit-employee-name"
              value={formData.employee_name}
              onChange={(e) => setFormData({ ...formData, employee_name: e.target.value })}
              placeholder="输入员工姓名"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-base-salary">基本工资</Label>
              <Input
                id="edit-base-salary"
                type="number"
                step="0.01"
                value={formData.base_salary || ''}
                onChange={(e) => setFormData({ ...formData, base_salary: parseFloat(e.target.value) || 0 })}
                placeholder="基本工资"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-bonus">奖金</Label>
              <Input
                id="edit-bonus"
                type="number"
                step="0.01"
                value={formData.bonus || ''}
                onChange={(e) => setFormData({ ...formData, bonus: parseFloat(e.target.value) || 0 })}
                placeholder="奖金"
              />
            </div>
          </div>

          <div className="bg-muted/50 p-3 rounded-lg text-sm text-muted-foreground">
            <p className="font-medium mb-1">注意:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>仅允许修改薪资字段</li>
              <li>安全等级和类别不可修改</li>
              <li>当前安全等级: <strong className="text-foreground">{salary.security_level?.level_name}</strong></li>
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
