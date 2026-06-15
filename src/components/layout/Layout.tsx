import { useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

const pageTitles: Record<string, string> = {
  '/': '模板库',
  '/editor': '报表编辑器',
  '/data': '数据选择',
  '/preview': '预览发布',
  '/subscription': '订阅管理',
};

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const title = pageTitles[location.pathname] || '数据报表生成器';

  return (
    <div className="min-h-screen bg-dark-900">
      <Sidebar />
      <div className="ml-64 transition-all duration-300">
        <Header title={title} />
        <main className="p-6 min-h-[calc(100vh-4rem)]">
          {children}
        </main>
      </div>
    </div>
  );
}
