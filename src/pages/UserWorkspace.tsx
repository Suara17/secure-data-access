import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { SecurityLevelBadge } from '@/components/SecurityLevelBadge';
import { AccessDeniedModal } from '@/components/AccessDeniedModal';
import {
  Shield, LogOut, FileText, AlertTriangle, Eye, Lock,
  Filter, Search, Loader2
} from 'lucide-react';
import api from '@/lib/api';
import { SalaryRecord, NoticeRecord, canAccess, getSecurityLevelInfo, SecurityLevel, SECURITY_LEVELS } from '@/types/security';
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
    level: '秘密' as SecurityLevel,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [salaries, setSalaries] = useState<SalaryRecord[]>([]);
  const [notices, setNotices] = useState<NoticeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'salaries' | 'notices'>('salaries');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [salariesRes, noticesRes] = await Promise.all([
          api.get('/api/salaries'),
          api.get('/api/notices')
        ]);
        setSalaries(salariesRes.data);
        setNotices(noticesRes.data);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  // Filter salaries data
  const accessibleSalaries = salaries.filter(record => record.access_result === 'ALLOW');
  const filteredSalaries = accessibleSalaries.filter(record => {
    const searchableText = `${record.employee_name} ${record.security_level}`;
    const matchesSearch = searchableText.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterLevel === 'all' || record.security_level === filterLevel;
    return matchesSearch && matchesFilter;
  });

  // Filter notices data
  const accessibleNotices = notices.filter(record => record.access_result === 'ALLOW');
  const filteredNotices = accessibleNotices.filter(record => {
    const searchableText = `${record.title} ${record.content || ''} ${record.security_level}`;
    const matchesSearch = searchableText.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterLevel === 'all' || record.security_level === filterLevel;
    return matchesSearch && matchesFilter;
  });

  const currentFilteredData = activeTab === 'salaries' ? filteredSalaries : filteredNotices;
  const currentAccessibleData = activeTab === 'salaries' ? accessibleSalaries : accessibleNotices;
  const totalData = activeTab === 'salaries' ? salaries : notices;

  // Test unauthorized access
  const handleUnauthorizedTest = () => {
    setDeniedResource({
      name: '核心技术架构文档',
      level: '机密',
    });
    setShowDeniedModal(true);
  };

  const userLevelInfo = getSecurityLevelInfo(user?.security_level?.level_name || '公开');

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
              <SecurityLevelBadge level={user?.security_level?.level_name || '公开'} size="sm" />
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
                  <SecurityLevelBadge level={user?.security_level?.level_name || '公开'} />
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

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-4">
          <Button
            variant={activeTab === 'salaries' ? 'default' : 'outline'}
            onClick={() => setActiveTab('salaries')}
            className="gap-2"
          >
            薪资数据 ({salaries.length})
          </Button>
          <Button
            variant={activeTab === 'notices' ? 'default' : 'outline'}
            onClick={() => setActiveTab('notices')}
            className="gap-2"
          >
            公告通知 ({notices.length})
          </Button>
        </div>

        {/* Data Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="glass-card p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-success/20 flex items-center justify-center">
              <Eye className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{currentAccessibleData.length}</p>
              <p className="text-sm text-muted-foreground">可访问记录</p>
            </div>
          </div>
          <div className="glass-card p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-destructive/20 flex items-center justify-center">
              <Lock className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {totalData.length - currentAccessibleData.length}
              </p>
              <p className="text-sm text-muted-foreground">受限记录</p>
            </div>
          </div>
          <div className="glass-card p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{totalData.length}</p>
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

          {currentFilteredData.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{activeTab === 'salaries' ? '员工姓名' : '标题'}</TableHead>
                  <TableHead>安全级别</TableHead>
                  <TableHead>{activeTab === 'salaries' ? '薪资金额' : '内容预览'}</TableHead>
                  <TableHead>访问状态</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentFilteredData.map((record, index) => (
                  <TableRow
                    key={`${activeTab}-${index}`}
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <TableCell className="font-medium">
                      {'employee_name' in record ? record.employee_name : record.title}
                    </TableCell>
                    <TableCell>
                      <SecurityLevelBadge level={record.security_level} size="sm" />
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm max-w-xs truncate">
                      {'amount' in record
                        ? (record.amount ? `¥${record.amount.toLocaleString()}` : '*** 权限不足 ***')
                        : (record.content || '暂无内容')
                      }
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                        record.access_result === 'ALLOW'
                          ? 'bg-success/20 text-success'
                          : 'bg-destructive/20 text-destructive'
                      }`}>
                        {record.access_result === 'ALLOW' ? '✓ 允许访问' : '✗ 权限不足'}
                      </span>
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
        subjectLevel={(user?.security_level?.level_name || '公开') as SecurityLevel}
        objectLevel={deniedResource.level}
        resourceName={deniedResource.name}
      />
    </div>
  );
}
