import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { SecurityLevelBadge } from '@/components/SecurityLevelBadge';
import { AccessDeniedModal } from '@/components/AccessDeniedModal';
import { 
  Shield, LogOut, FileText, AlertTriangle, Eye, Lock,
  Filter, Search
} from 'lucide-react';
import { mockDataRecords } from '@/data/mockData';
import { canAccess, getSecurityLevelInfo, SecurityLevel, SECURITY_LEVELS } from '@/types/security';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function UserWorkspace() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showDeniedModal, setShowDeniedModal] = useState(false);
  const [deniedResource, setDeniedResource] = useState({
    name: '',
    level: 'top-secret' as SecurityLevel,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState<string>('all');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Filter data based on user's security level
  const accessibleData = mockDataRecords.filter(record => 
    canAccess(user?.securityLevel || 'public', record.securityLevel)
  );

  // Apply search and filter
  const filteredData = accessibleData.filter(record => {
    const matchesSearch = record.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          record.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterLevel === 'all' || record.securityLevel === filterLevel;
    return matchesSearch && matchesFilter;
  });

  // Test unauthorized access
  const handleUnauthorizedTest = () => {
    setDeniedResource({
      name: '核心财务数据',
      level: 'top-secret',
    });
    setShowDeniedModal(true);
  };

  const userLevelInfo = getSecurityLevelInfo(user?.securityLevel || 'public');

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
              <h1 className="font-semibold text-foreground">用户工作台</h1>
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
      <main className="container mx-auto px-4 py-8 space-y-6">
        {/* User Status Card */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">当前用户: {user?.username}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-muted-foreground">安全标记等级:</span>
                  <SecurityLevelBadge level={user?.securityLevel || 'public'} />
                  <span className="text-sm text-muted-foreground ml-2">
                    (可访问等级 ≤ {userLevelInfo.priority} 的数据)
                  </span>
                </div>
              </div>
            </div>

            {/* Unauthorized Access Test Button */}
            <Button 
              variant="danger" 
              onClick={handleUnauthorizedTest}
              className="gap-2"
            >
              <AlertTriangle className="w-4 h-4" />
              越权访问测试
            </Button>
          </div>
        </div>

        {/* Data Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="glass-card p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-success/20 flex items-center justify-center">
              <Eye className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{accessibleData.length}</p>
              <p className="text-sm text-muted-foreground">可访问记录</p>
            </div>
          </div>
          <div className="glass-card p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-destructive/20 flex items-center justify-center">
              <Lock className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {mockDataRecords.length - accessibleData.length}
              </p>
              <p className="text-sm text-muted-foreground">受限记录</p>
            </div>
          </div>
          <div className="glass-card p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{mockDataRecords.length}</p>
              <p className="text-sm text-muted-foreground">总记录数</p>
            </div>
          </div>
        </div>

        {/* Data List */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              数据查询列表
            </h2>
            
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="搜索..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-48 bg-muted/50"
                />
              </div>
              <Select value={filterLevel} onValueChange={setFilterLevel}>
                <SelectTrigger className="w-32 bg-muted/50">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="筛选级别" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部</SelectItem>
                  {SECURITY_LEVELS.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {filteredData.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>标题</TableHead>
                  <TableHead>分类</TableHead>
                  <TableHead>安全级别</TableHead>
                  <TableHead>内容预览</TableHead>
                  <TableHead>创建时间</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((record, index) => (
                  <TableRow 
                    key={record.id}
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <TableCell className="font-medium">{record.title}</TableCell>
                    <TableCell>
                      <span className="px-2 py-1 bg-muted rounded text-xs text-muted-foreground">
                        {record.category}
                      </span>
                    </TableCell>
                    <TableCell>
                      <SecurityLevelBadge level={record.securityLevel} size="sm" />
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm max-w-xs truncate">
                      {record.content}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm font-mono">
                      {record.createdAt.toLocaleDateString('zh-CN')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>暂无可访问的数据记录</p>
            </div>
          )}
        </div>

        {/* Access Legend */}
        <div className="glass-card p-4">
          <h3 className="text-sm font-medium text-foreground mb-3">安全级别说明</h3>
          <div className="flex flex-wrap gap-4">
            {SECURITY_LEVELS.map((level) => (
              <div key={level.value} className="flex items-center gap-2">
                <SecurityLevelBadge level={level.value} size="sm" />
                <span className="text-xs text-muted-foreground">优先级 {level.priority}</span>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Access Denied Modal */}
      <AccessDeniedModal
        open={showDeniedModal}
        onClose={() => setShowDeniedModal(false)}
        subjectLevel={user?.securityLevel || 'public'}
        objectLevel={deniedResource.level}
        resourceName={deniedResource.name}
      />
    </div>
  );
}
