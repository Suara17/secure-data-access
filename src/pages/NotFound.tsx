import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, AlertTriangle } from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center security-grid">
      <div className="text-center space-y-6 animate-fade-in">
        <div className="mx-auto w-20 h-20 rounded-2xl bg-destructive/20 flex items-center justify-center">
          <AlertTriangle className="w-10 h-10 text-destructive" />
        </div>
        <div className="space-y-2">
          <h1 className="text-6xl font-bold text-foreground">404</h1>
          <p className="text-xl text-muted-foreground">页面未找到</p>
          <p className="text-sm text-muted-foreground">请求的资源不存在或已被移除</p>
        </div>
        <Button onClick={() => navigate('/login')} className="gap-2">
          <Home className="w-4 h-4" />
          返回首页
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
