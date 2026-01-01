import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SecurityLevelBadge } from '@/components/SecurityLevelBadge';
import {
  Shield, LogOut, Users, FileText, Settings, Activity,
  Plus, Edit2, Trash2, Check, X, Loader2, Database
} from 'lucide-react';
import api, { salaryApi, noticeApi } from '@/lib/api';
import { AdminUser, AuditLog, SecurityLevelInfo, CreateUserRequest, UpdateUserLabelsRequest, CreateSalaryRequest, CreateNoticeRequest, SECURITY_LEVELS, SecurityLevel, SalaryManagementData, NoticeManagementData } from '@/types/security';
import { toast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SalaryEditDialog } from '@/components/admin/SalaryEditDialog';
import { NoticeEditDialog } from '@/components/admin/NoticeEditDialog';
import { DeleteConfirmDialog } from '@/components/admin/DeleteConfirmDialog';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // State for API data
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [securityLevels, setSecurityLevels] = useState<SecurityLevelInfo[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  // 数据管理相关状态
  const [salaries, setSalaries] = useState<any[]>([]);
  const [notices, setNotices] = useState<any[]>([]);
  const [editingSalary, setEditingSalary] = useState<any | null>(null);
  const [editingNotice, setEditingNotice] = useState<any | null>(null);
  const [deletingItem, setDeletingItem] = useState<{ type: 'salary' | 'notice'; id: number; name: string; level: SecurityLevel } | null>(null);
  const [dialogLoading, setDialogLoading] = useState(false);

  // Form states
  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    real_name: '',
    security_level_id: 1,
    category_id: 1,
  });

  const [newSalary, setNewSalary] = useState({
    employee_name: '',
    base_salary: 0,
    bonus: 0,
    data_security_level_id: 1,
    data_category_id: 1,
  });

  const [newNotice, setNewNotice] = useState({
    title: '',
    content: '',
    data_security_level_id: 1,
    data_category_id: 1,
  });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [usersRes, securityLevelsRes, auditLogsRes] = await Promise.all([
          api.get('/api/admin/users'),
          api.get('/api/admin/security-levels'),
          api.get('/api/admin/audit-logs')
        ]);
        setUsers(usersRes.data);
        setSecurityLevels(securityLevelsRes.data);
        setAuditLogs(auditLogsRes.data);
      } catch (error) {
        console.error('Failed to fetch admin data:', error);
        toast({
          title: "加载失败",
          description: "无法加载管理员数据，请检查网络连接",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/api/admin/users', newUser);
      toast({
        title: "用户创建成功",
        description: `用户 ${newUser.username} 已创建`,
      });
      setNewUser({
        username: '',
        password: '',
        real_name: '',
        security_level_id: 1,
        category_id: 1,
      });
      // Refresh users list
      const usersRes = await api.get('/api/admin/users');
      setUsers(usersRes.data);
    } catch (error) {
      toast({
        title: "创建失败",
        description: "无法创建用户，请检查输入信息",
        variant: "destructive",
      });
    }
  };

  const handleUpdateUserLabels = async (userId: number, securityLevelId: number, categoryId: number) => {
    try {
      await api.put(`/api/admin/users/${userId}/labels`, {
        security_level_id: securityLevelId,
        category_id: categoryId,
      });
      toast({
        title: "用户权限已更新",
        description: "安全标记等级已成功修改",
      });
      // Refresh users list
      const usersRes = await api.get('/api/admin/users');
      setUsers(usersRes.data);
    } catch (error) {
      toast({
        title: "更新失败",
        description: "无法更新用户权限",
        variant: "destructive",
      });
    }
  };

  const handleCreateSalary = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/api/admin/salaries', newSalary);
      toast({
        title: "薪资录入成功",
        description: `${newSalary.employee_name} 的薪资信息已录入`,
      });
      setNewSalary({
        employee_name: '',
        base_salary: 0,
        bonus: 0,
        data_security_level_id: 1,
        data_category_id: 1,
      });
    } catch (error) {
      toast({
        title: "录入失败",
        description: "无法录入薪资信息",
        variant: "destructive",
      });
    }
  };

  const handleCreateNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/api/admin/notices', newNotice);
      toast({
        title: "公告发布成功",
        description: `公告 "${newNotice.title}" 已发布`,
      });
      setNewNotice({
        title: '',
        content: '',
        data_security_level_id: 1,
        data_category_id: 1,
      });
    } catch (error) {
      toast({
        title: "发布失败",
        description: "无法发布公告",
        variant: "destructive",
      });
    }
  };

  // ==================== 数据管理相关函数 ====================

  // 获取薪资和公告列表
  const fetchManagementData = async () => {
    try {
      const [salariesRes, noticesRes] = await Promise.all([
        salaryApi.getAll(),
        noticeApi.getAll()
      ]);
      setSalaries(salariesRes);
      setNotices(noticesRes);
    } catch (error) {
      console.error('Failed to fetch management data:', error);
      toast({
        title: "加载失败",
        description: "无法加载数据列表",
        variant: "destructive",
      });
    }
  };

  // 处理薪资更新
  const handleUpdateSalary = async (id: number, data: { employee_name?: string; base_salary?: number; bonus?: number }) => {
    setDialogLoading(true);
    try {
      await salaryApi.update(id, data);
      toast({
        title: "更新成功",
        description: "薪资信息已更新",
      });
      setEditingSalary(null);
      await fetchManagementData();
    } catch (error) {
      toast({
        title: "更新失败",
        description: "无法更新薪资信息",
        variant: "destructive",
      });
    } finally {
      setDialogLoading(false);
    }
  };

  // 处理公告更新
  const handleUpdateNotice = async (id: number, data: { title?: string; content?: string }) => {
    setDialogLoading(true);
    try {
      await noticeApi.update(id, data);
      toast({
        title: "更新成功",
        description: "公告已更新",
      });
      setEditingNotice(null);
      await fetchManagementData();
    } catch (error) {
      toast({
        title: "更新失败",
        description: "无法更新公告",
        variant: "destructive",
      });
    } finally {
      setDialogLoading(false);
    }
  };

  // 处理删除确认
  const handleDeleteConfirm = async () => {
    if (!deletingItem) return;

    setDialogLoading(true);
    try {
      if (deletingItem.type === 'salary') {
        await salaryApi.delete(deletingItem.id);
        toast({
          title: "删除成功",
          description: "薪资记录已删除",
        });
      } else {
        await noticeApi.delete(deletingItem.id);
        toast({
          title: "删除成功",
          description: "公告已删除",
        });
      }
      setDeletingItem(null);
      await fetchManagementData();
    } catch (error) {
      toast({
        title: "删除失败",
        description: "无法删除数据",
        variant: "destructive",
      });
    } finally {
      setDialogLoading(false);
    }
  };

  // 辅助函数:将后端的level_name映射为SecurityLevel类型
  const mapToSecurityLevel = (levelName: string): SecurityLevel => {
    const mapping: Record<string, SecurityLevel> = {
      '公开 (Public)': '公开',
      '内部 (Internal)': '内部',
      '秘密 (Secret)': '秘密',
      '机密 (Confidential)': '机密',
    };
    return mapping[levelName] || '公开';
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="font-semibold text-foreground">管理员仪表盘</h1>
              <p className="text-xs text-muted-foreground">安全标记访问控制系统</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{user?.username}</span>
              <SecurityLevelBadge level={(user?.security_level?.level_name || '公开') as SecurityLevel} size="sm" />
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="ml-2">加载中...</span>
          </div>
        ) : (
          <Tabs defaultValue="users" className="space-y-6" onValueChange={(value) => { if (value === 'management') fetchManagementData(); }}>
            <TabsList className="bg-muted/50 p-1">
              <TabsTrigger value="users" className="gap-2">
                <Users className="w-4 h-4" />
                用户管理
              </TabsTrigger>
              <TabsTrigger value="data" className="gap-2">
                <FileText className="w-4 h-4" />
                数据录入
              </TabsTrigger>
              <TabsTrigger value="management" className="gap-2">
                <Database className="w-4 h-4" />
                数据管理
              </TabsTrigger>
              <TabsTrigger value="audit" className="gap-2">
                <Activity className="w-4 h-4" />
                审计日志
              </TabsTrigger>
            </TabsList>

            {/* User Management Tab */}
            <TabsContent value="users" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Create User Form */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Plus className="w-5 h-5" />
                      创建新用户
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleCreateUser} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="username">用户名</Label>
                        <Input
                          id="username"
                          value={newUser.username}
                          onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                          placeholder="输入用户名"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password">密码</Label>
                        <Input
                          id="password"
                          type="password"
                          value={newUser.password}
                          onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                          placeholder="输入密码"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="real_name">真实姓名</Label>
                        <Input
                          id="real_name"
                          value={newUser.real_name}
                          onChange={(e) => setNewUser({...newUser, real_name: e.target.value})}
                          placeholder="输入真实姓名"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>安全等级</Label>
                        <Select
                          value={newUser.security_level_id.toString()}
                          onValueChange={(value) => setNewUser({...newUser, security_level_id: parseInt(value)})}
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
                      <Button type="submit" className="w-full">
                        <Plus className="w-4 h-4 mr-2" />
                        创建用户
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                {/* Users List */}
                <Card>
                  <CardHeader>
                    <CardTitle>用户列表 ({users.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {users.map((u) => (
                        <div key={u.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                          <div>
                            <p className="font-medium">{u.username}</p>
                            <p className="text-sm text-muted-foreground">{u.real_name}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <SecurityLevelBadge level={u.security_level.level_name} size="sm" />
                            <Select
                              value={`${u.security_level.level_id}`}
                              onValueChange={(value) => handleUpdateUserLabels(u.id, parseInt(value), u.category.category_id)}
                            >
                              <SelectTrigger className="w-24 h-8">
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
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Data Entry Tab */}
            <TabsContent value="data" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Salary Entry Form */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Plus className="w-5 h-5" />
                      录入薪资数据
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleCreateSalary} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="employee_name">员工姓名</Label>
                        <Input
                          id="employee_name"
                          value={newSalary.employee_name}
                          onChange={(e) => setNewSalary({...newSalary, employee_name: e.target.value})}
                          placeholder="输入员工姓名"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="base_salary">基本薪资</Label>
                        <Input
                          id="base_salary"
                          value={newSalary.base_salary || ''}
                          onChange={(e) => setNewSalary({...newSalary, base_salary: parseFloat(e.target.value) || 0})}
                          placeholder="输入基本薪资"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bonus">奖金</Label>
                        <Input
                          id="bonus"
                          value={newSalary.bonus || ''}
                          onChange={(e) => setNewSalary({...newSalary, bonus: parseFloat(e.target.value) || 0})}
                          placeholder="输入奖金"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>安全等级</Label>
                        <Select
                          value={newSalary.data_security_level_id.toString()}
                          onValueChange={(value) => setNewSalary({...newSalary, data_security_level_id: parseInt(value)})}
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
                      <Button type="submit" className="w-full">
                        <Plus className="w-4 h-4 mr-2" />
                        录入薪资
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                {/* Notice Entry Form */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Plus className="w-5 h-5" />
                      发布公告
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleCreateNotice} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="title">公告标题</Label>
                        <Input
                          id="title"
                          value={newNotice.title}
                          onChange={(e) => setNewNotice({...newNotice, title: e.target.value})}
                          placeholder="输入公告标题"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="content">公告内容</Label>
                        <Input
                          id="content"
                          value={newNotice.content}
                          onChange={(e) => setNewNotice({...newNotice, content: e.target.value})}
                          placeholder="输入公告内容"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>安全等级</Label>
                        <Select
                          value={newNotice.data_security_level_id.toString()}
                          onValueChange={(value) => setNewNotice({...newNotice, data_security_level_id: parseInt(value)})}
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
                      <Button type="submit" className="w-full">
                        <Plus className="w-4 h-4 mr-2" />
                        发布公告
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Data Management Tab */}
            <TabsContent value="management" className="space-y-6">
              {/* Salary Management */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    薪资数据管理 ({salaries.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>员工姓名</TableHead>
                        <TableHead>基本工资</TableHead>
                        <TableHead>奖金</TableHead>
                        <TableHead>总计</TableHead>
                        <TableHead>安全等级</TableHead>
                        <TableHead>职能</TableHead>
                        <TableHead className="text-right">操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {salaries.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                            暂无薪资数据
                          </TableCell>
                        </TableRow>
                      ) : (
                        salaries.map((salary: any) => (
                          <TableRow key={salary.data_id || Math.random()}>
                            <TableCell className="font-medium">{salary.employee_name}</TableCell>
                            <TableCell>¥{salary.amount?.toFixed(2) || '---'}</TableCell>
                            <TableCell>¥{salary.bonus?.toFixed(2) || '0.00'}</TableCell>
                            <TableCell className="font-semibold">
                              ¥{(salary.amount || 0).toFixed(2)}
                            </TableCell>
                            <TableCell>
                              <SecurityLevelBadge
                                level={mapToSecurityLevel(salary.security_level)}
                                size="sm"
                              />
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {salary.category?.category_name || '---'}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => setEditingSalary(salary)}
                                  title="编辑"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => setDeletingItem({
                                    type: 'salary',
                                    id: salary.data_id,
                                    name: `${salary.employee_name}的薪资`,
                                    level: mapToSecurityLevel(salary.security_level)
                                  })}
                                  title="删除"
                                  className="text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Notice Management */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    公告管理 ({notices.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>标题</TableHead>
                        <TableHead>内容预览</TableHead>
                        <TableHead>安全等级</TableHead>
                        <TableHead>职能</TableHead>
                        <TableHead className="text-right">操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {notices.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                            暂无公告数据
                          </TableCell>
                        </TableRow>
                      ) : (
                        notices.map((notice: any) => (
                          <TableRow key={notice.notice_id || Math.random()}>
                            <TableCell className="font-medium">{notice.title}</TableCell>
                            <TableCell className="text-muted-foreground max-w-md truncate">
                              {notice.content || '---'}
                            </TableCell>
                            <TableCell>
                              <SecurityLevelBadge
                                level={mapToSecurityLevel(notice.security_level)}
                                size="sm"
                              />
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {notice.category?.category_name || '---'}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => setEditingNotice(notice)}
                                  title="编辑"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => setDeletingItem({
                                    type: 'notice',
                                    id: notice.notice_id,
                                    name: `公告:${notice.title}`,
                                    level: mapToSecurityLevel(notice.security_level)
                                  })}
                                  title="删除"
                                  className="text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Audit Logs Tab */}
            <TabsContent value="audit" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    安全审计日志 ({auditLogs.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>时间</TableHead>
                        <TableHead>用户</TableHead>
                        <TableHead>操作</TableHead>
                        <TableHead>资源</TableHead>
                        <TableHead>结果</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {auditLogs.map((log, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-mono text-xs">
                            {new Date(log.request_time).toLocaleString('zh-CN')}
                          </TableCell>
                          <TableCell className="font-medium">{log.username}</TableCell>
                          <TableCell>
                            <span className="px-2 py-1 rounded text-xs bg-primary/20 text-primary">
                              {log.operation}
                            </span>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{log.resource_name}</TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                              log.result === 'ALLOW'
                                ? 'bg-success/20 text-success'
                                : 'bg-destructive/20 text-destructive'
                            }`}>
                              {log.result === 'ALLOW' ? '✓ 允许' : '✗ 拒绝'}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </main>

      {/* Dialogs */}
      <SalaryEditDialog
        open={!!editingSalary}
        onOpenChange={(open) => !open && setEditingSalary(null)}
        salary={editingSalary}
        onSave={handleUpdateSalary}
        loading={dialogLoading}
      />

      <NoticeEditDialog
        open={!!editingNotice}
        onOpenChange={(open) => !open && setEditingNotice(null)}
        notice={editingNotice}
        onSave={handleUpdateNotice}
        loading={dialogLoading}
      />

      <DeleteConfirmDialog
        open={!!deletingItem}
        onOpenChange={(open) => !open && setDeletingItem(null)}
        onConfirm={handleDeleteConfirm}
        resourceName={deletingItem?.name || ''}
        securityLevel={deletingItem?.level || '公开'}
        loading={dialogLoading}
      />
    </div>
  );
}
