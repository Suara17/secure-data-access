import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SecurityLevelBadge } from '@/components/SecurityLevelBadge';
import { 
  Shield, LogOut, Users, FileText, Settings, Activity,
  Plus, Edit2, Trash2, Check, X
} from 'lucide-react';
import { mockUsers, mockDataRecords, mockSecurityRules, mockAuditLogs } from '@/data/mockData';
import { SECURITY_LEVELS, SecurityLevel } from '@/types/security';
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
import { toast } from '@/hooks/use-toast';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState(mockUsers);
  const [dataRecords, setDataRecords] = useState(mockDataRecords);
  const [rules, setRules] = useState(mockSecurityRules);
  const [auditLogs] = useState(mockAuditLogs);

  // New data entry form
  const [newData, setNewData] = useState({
    title: '',
    content: '',
    category: '',
    securityLevel: 'public' as SecurityLevel,
  });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleUserLevelChange = (userId: string, newLevel: SecurityLevel) => {
    setUsers(users.map(u => 
      u.id === userId ? { ...u, securityLevel: newLevel } : u
    ));
    toast({
      title: "用户权限已更新",
      description: `安全等级已变更为: ${SECURITY_LEVELS.find(l => l.value === newLevel)?.label}`,
    });
  };

  const handleAddData = (e: React.FormEvent) => {
    e.preventDefault();
    const record = {
      id: String(dataRecords.length + 1),
      ...newData,
      createdBy: user?.username || 'admin',
      createdAt: new Date(),
    };
    setDataRecords([...dataRecords, record]);
    setNewData({ title: '', content: '', category: '', securityLevel: 'public' });
    toast({
      title: "数据录入成功",
      description: `"${record.title}" 已添加，安全级别: ${SECURITY_LEVELS.find(l => l.value === record.securityLevel)?.label}`,
    });
  };

  const handleToggleRule = (ruleId: string) => {
    setRules(rules.map(r => 
      r.id === ruleId ? { ...r, isActive: !r.isActive } : r
    ));
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
              <SecurityLevelBadge level={user?.securityLevel || 'public'} size="sm" />
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="rules" className="space-y-6">
          <TabsList className="bg-muted/50 p-1">
            <TabsTrigger value="rules" className="gap-2">
              <Settings className="w-4 h-4" />
              标记规则配置
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-2">
              <Users className="w-4 h-4" />
              用户赋权
            </TabsTrigger>
            <TabsTrigger value="data" className="gap-2">
              <FileText className="w-4 h-4" />
              数据录入
            </TabsTrigger>
            <TabsTrigger value="audit" className="gap-2">
              <Activity className="w-4 h-4" />
              审计日志
            </TabsTrigger>
          </TabsList>

          {/* Security Rules Tab */}
          <TabsContent value="rules" className="space-y-4">
            <div className="glass-card p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5 text-primary" />
                安全级别规则配置
              </h2>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>级别名称</TableHead>
                    <TableHead>标识</TableHead>
                    <TableHead>优先级</TableHead>
                    <TableHead>描述</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rules.map((rule) => (
                    <TableRow key={rule.id}>
                      <TableCell className="font-medium">{rule.name}</TableCell>
                      <TableCell>
                        <SecurityLevelBadge level={rule.level} size="sm" />
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-primary">{rule.priority}</span>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {rule.description}
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                          rule.isActive 
                            ? 'bg-success/20 text-success' 
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {rule.isActive ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                          {rule.isActive ? '启用' : '禁用'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Edit2 className="w-3 h-3" />
                          </Button>
                          <Button 
                            variant={rule.isActive ? "ghost" : "outline"} 
                            size="sm"
                            onClick={() => handleToggleRule(rule.id)}
                          >
                            {rule.isActive ? '禁用' : '启用'}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* User Authorization Tab */}
          <TabsContent value="users" className="space-y-4">
            <div className="glass-card p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                用户安全等级管理
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                管理员可以修改用户的安全标记等级，实现"分配主体安全标记"功能
              </p>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>用户名</TableHead>
                    <TableHead>邮箱</TableHead>
                    <TableHead>角色</TableHead>
                    <TableHead>当前安全等级</TableHead>
                    <TableHead>修改等级</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">{u.username}</TableCell>
                      <TableCell className="text-muted-foreground">{u.email}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          u.role === 'admin' 
                            ? 'bg-primary/20 text-primary' 
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {u.role === 'admin' ? '管理员' : '普通用户'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <SecurityLevelBadge level={u.securityLevel} />
                      </TableCell>
                      <TableCell>
                        <Select
                          value={u.securityLevel}
                          onValueChange={(value) => handleUserLevelChange(u.id, value as SecurityLevel)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {SECURITY_LEVELS.map((level) => (
                              <SelectItem key={level.value} value={level.value}>
                                {level.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Data Entry Tab */}
          <TabsContent value="data" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Entry Form */}
              <div className="glass-card p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Plus className="w-5 h-5 text-primary" />
                  新增数据记录
                </h2>
                <form onSubmit={handleAddData} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">标题</label>
                    <Input
                      value={newData.title}
                      onChange={(e) => setNewData({...newData, title: e.target.value})}
                      placeholder="输入数据标题"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">内容</label>
                    <Input
                      value={newData.content}
                      onChange={(e) => setNewData({...newData, content: e.target.value})}
                      placeholder="输入数据内容"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">分类</label>
                    <Input
                      value={newData.category}
                      onChange={(e) => setNewData({...newData, category: e.target.value})}
                      placeholder="如：财务、技术、公告"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">安全级别</label>
                    <Select
                      value={newData.securityLevel}
                      onValueChange={(value) => setNewData({...newData, securityLevel: value as SecurityLevel})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SECURITY_LEVELS.map((level) => (
                          <SelectItem key={level.value} value={level.value}>
                            {level.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" className="w-full">
                    <Plus className="w-4 h-4" />
                    添加记录
                  </Button>
                </form>
              </div>

              {/* Existing Records */}
              <div className="glass-card p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  现有数据 ({dataRecords.length})
                </h2>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {dataRecords.map((record) => (
                    <div key={record.id} className="bg-muted/30 rounded-lg p-3 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium text-foreground">{record.title}</h3>
                          <p className="text-xs text-muted-foreground">{record.category}</p>
                        </div>
                        <SecurityLevelBadge level={record.securityLevel} size="sm" />
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{record.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Audit Logs Tab */}
          <TabsContent value="audit" className="space-y-4">
            <div className="glass-card p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                安全审计日志
              </h2>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>时间</TableHead>
                    <TableHead>用户</TableHead>
                    <TableHead>操作</TableHead>
                    <TableHead>资源</TableHead>
                    <TableHead>主体标记</TableHead>
                    <TableHead>客体标记</TableHead>
                    <TableHead>结果</TableHead>
                    <TableHead>IP地址</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-mono text-xs">
                        {log.timestamp.toLocaleString('zh-CN')}
                      </TableCell>
                      <TableCell className="font-medium">{log.username}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded text-xs ${
                          log.action === 'denied' 
                            ? 'bg-destructive/20 text-destructive' 
                            : log.action === 'access'
                            ? 'bg-success/20 text-success'
                            : 'bg-primary/20 text-primary'
                        }`}>
                          {log.action === 'access' ? '访问' : 
                           log.action === 'modify' ? '修改' :
                           log.action === 'delete' ? '删除' : '拒绝'}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{log.resourceName}</TableCell>
                      <TableCell>
                        <SecurityLevelBadge level={log.subjectLevel} size="sm" showIcon={false} />
                      </TableCell>
                      <TableCell>
                        <SecurityLevelBadge level={log.objectLevel} size="sm" showIcon={false} />
                      </TableCell>
                      <TableCell>
                        {log.success ? (
                          <span className="text-success flex items-center gap-1">
                            <Check className="w-3 h-3" /> 成功
                          </span>
                        ) : (
                          <span className="text-destructive flex items-center gap-1">
                            <X className="w-3 h-3" /> 拒绝
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {log.ipAddress}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
