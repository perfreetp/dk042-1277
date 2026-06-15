import { NavLink } from 'react-router-dom';
import {
  LayoutGrid,
  FileEdit,
  Database,
  Eye,
  Bell,
  BarChart3,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { path: '/', label: '模板库', icon: LayoutGrid },
  { path: '/editor', label: '报表编辑', icon: FileEdit },
  { path: '/data', label: '数据选择', icon: Database },
  { path: '/preview', label: '预览发布', icon: Eye },
  { path: '/subscription', label: '订阅管理', icon: Bell },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`fixed left-0 top-0 h-full bg-dark-800 border-r border-dark-700 transition-all duration-300 z-40 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div className="flex flex-col h-full">
        <div className="p-6 border-b border-dark-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center flex-shrink-0">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            {!collapsed && (
              <div className="overflow-hidden">
                <h1 className="font-display font-bold text-lg text-white truncate">
                  Data Report
                </h1>
                <p className="text-xs text-dark-400 truncate">数据报表生成器</p>
              </div>
            )}
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item, index) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                animate-slide-in stagger-${index + 1}
                ${isActive
                  ? 'bg-primary-600/20 text-primary-400 border border-primary-500/30'
                  : 'text-dark-300 hover:bg-dark-700/50 hover:text-white'
                }
              `}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && (
                <span className="font-medium text-sm">{item.label}</span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-dark-700">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-dark-400 hover:text-white hover:bg-dark-700/50 rounded-lg transition-colors"
          >
            {collapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <>
                <ChevronLeft className="w-5 h-5" />
                <span className="text-sm">收起菜单</span>
              </>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
}
