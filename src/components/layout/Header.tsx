import {
  Search,
  Bell,
  HelpCircle,
  User,
  Settings,
  LogOut,
} from 'lucide-react';
import { useState } from 'react';
import { useReportStore } from '../../store/useReportStore';
import { formatDateTime } from '../../utils/dateUtils';

interface HeaderProps {
  title: string;
}

export function Header({ title }: HeaderProps) {
  const { currentReport, notification } = useReportStore();
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="h-16 bg-dark-800/80 backdrop-blur-sm border-b border-dark-700 flex items-center justify-between px-6 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <h2 className="font-display font-semibold text-xl text-white">{title}</h2>
        {currentReport && (
          <span className="text-sm text-dark-400">
            上次更新: {formatDateTime(currentReport.updatedAt)}
          </span>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
          <input
            type="text"
            placeholder="搜索报表、模板..."
            className="w-64 pl-10 pr-4 py-2 bg-dark-700/50 border border-dark-600 rounded-lg text-sm text-white placeholder-dark-400 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
          />
        </div>

        <button className="relative p-2 text-dark-400 hover:text-white hover:bg-dark-700/50 rounded-lg transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        <button className="p-2 text-dark-400 hover:text-white hover:bg-dark-700/50 rounded-lg transition-colors">
          <HelpCircle className="w-5 h-5" />
        </button>

        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-3 p-1 pr-3 hover:bg-dark-700/50 rounded-lg transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm text-white">管理员</span>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-dark-800 border border-dark-700 rounded-lg shadow-xl overflow-hidden animate-fade-in">
              <button className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-dark-200 hover:bg-dark-700/50 transition-colors">
                <Settings className="w-4 h-4" />
                个人设置
              </button>
              <button className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-dark-700/50 transition-colors">
                <LogOut className="w-4 h-4" />
                退出登录
              </button>
            </div>
          )}
        </div>
      </div>

      {notification && (
        <div
          className={`fixed top-20 right-6 px-4 py-3 rounded-lg shadow-lg animate-slide-up flex items-center gap-2 ${
            notification.type === 'success'
              ? 'bg-green-500/20 border border-green-500/30 text-green-400'
              : notification.type === 'error'
              ? 'bg-red-500/20 border border-red-500/30 text-red-400'
              : 'bg-primary-500/20 border border-primary-500/30 text-primary-400'
          }`}
        >
          <span className="text-sm">{notification.message}</span>
        </div>
      )}
    </header>
  );
}
