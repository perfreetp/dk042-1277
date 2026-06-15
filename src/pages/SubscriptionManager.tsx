import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mail,
  FileText,
  FileSpreadsheet,
  Image,
  CheckCircle2,
  XCircle,
  Clock,
  Play,
  Pause,
  X,
  Calendar,
  History,
  Download,
  User,
  Bell,
  Settings,
} from 'lucide-react';
import { useReportStore } from '../store/useReportStore';
import { formatDateTime, getRelativeTime } from '../utils/dateUtils';
import type { Subscription, GenerationLog, SubscriptionFrequency, SubscriptionFormat } from '../types';

const frequencyLabels: Record<SubscriptionFrequency, string> = {
  daily: '日报',
  weekly: '周报',
  monthly: '月报',
};

const formatIcons: Record<SubscriptionFormat, typeof FileText> = {
  pdf: FileText,
  excel: FileSpreadsheet,
  png: Image,
};

const formatColors: Record<SubscriptionFormat, string> = {
  pdf: 'text-red-400 bg-red-500/20',
  excel: 'text-green-400 bg-green-500/20',
  png: 'text-blue-400 bg-blue-500/20',
};

export function SubscriptionManager() {
  const navigate = useNavigate();
  const { subscriptions, generationLogs, toggleSubscription, removeSubscription, triggerSubscription } = useReportStore();
  const [activeTab, setActiveTab] = useState<'subscriptions' | 'logs'>('subscriptions');
  const [selectedLog, setSelectedLog] = useState<GenerationLog | null>(null);

  const getStatusBadge = (status: GenerationLog['status']) => {
    switch (status) {
      case 'success':
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 bg-green-500/20 text-green-400 rounded text-xs">
            <CheckCircle2 className="w-3 h-3" />
            成功
          </span>
        );
      case 'failed':
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 bg-red-500/20 text-red-400 rounded text-xs">
            <XCircle className="w-3 h-3" />
            失败
          </span>
        );
      case 'pending':
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded text-xs">
            <Clock className="w-3 h-3" />
            处理中
          </span>
        );
    }
  };

  const getFrequencyColor = (frequency: SubscriptionFrequency) => {
    switch (frequency) {
      case 'daily':
        return 'bg-blue-500/20 text-blue-400';
      case 'weekly':
        return 'bg-purple-500/20 text-purple-400';
      case 'monthly':
        return 'bg-orange-500/20 text-orange-400';
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-white mb-2">
              订阅管理
            </h1>
            <p className="text-dark-400">
              管理报表订阅和查看生成记录
            </p>
          </div>
          <button
            onClick={() => navigate('/preview')}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-500 text-white rounded-lg font-medium transition-colors"
          >
            <Bell className="w-4 h-4" />
            新建订阅
          </button>
        </div>
      </div>

      <div className="bg-dark-800 rounded-xl border border-dark-700 mb-6">
        <div className="flex p-1">
          <button
            onClick={() => setActiveTab('subscriptions')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'subscriptions'
                ? 'bg-primary-600 text-white'
                : 'text-dark-400 hover:text-white'
            }`}
          >
            <Settings className="w-4 h-4" />
            订阅列表
            <span className="px-2 py-0.5 bg-white/10 rounded text-xs">
              {subscriptions.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'logs'
                ? 'bg-primary-600 text-white'
                : 'text-dark-400 hover:text-white'
            }`}
          >
            <History className="w-4 h-4" />
            生成记录
            <span className="px-2 py-0.5 bg-white/10 rounded text-xs">
              {generationLogs.length}
            </span>
          </button>
        </div>
      </div>

      {activeTab === 'subscriptions' ? (
        <div className="space-y-4">
          {subscriptions.length > 0 ? (
            subscriptions.map((subscription) => (
              <SubscriptionCard
                key={subscription.id}
                subscription={subscription}
                onToggle={() => toggleSubscription(subscription.id)}
                onRemove={() => removeSubscription(subscription.id)}
                onTrigger={() => triggerSubscription(subscription.id)}
                getFrequencyColor={getFrequencyColor}
                formatColors={formatColors}
                formatIcons={formatIcons}
                frequencyLabels={frequencyLabels}
              />
            ))
          ) : (
            <div className="bg-dark-800 rounded-xl border border-dark-700 p-12 text-center">
              <div className="w-20 h-20 rounded-full bg-dark-700/50 flex items-center justify-center mx-auto mb-4">
                <Bell className="w-10 h-10 text-dark-500" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">暂无订阅</h3>
              <p className="text-dark-400 mb-6">创建订阅以定期自动生成并推送报表</p>
              <button
                onClick={() => navigate('/preview')}
                className="px-6 py-2.5 bg-primary-600 hover:bg-primary-500 text-white rounded-lg font-medium transition-colors"
              >
                创建第一个订阅
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-dark-800 rounded-xl border border-dark-700 overflow-hidden">
          {generationLogs.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-dark-700 bg-dark-800/50">
                    <th className="px-6 py-4 text-left font-medium text-dark-300">报表名称</th>
                    <th className="px-6 py-4 text-left font-medium text-dark-300">生成时间</th>
                    <th className="px-6 py-4 text-left font-medium text-dark-300">格式</th>
                    <th className="px-6 py-4 text-left font-medium text-dark-300">状态</th>
                    <th className="px-6 py-4 text-left font-medium text-dark-300">接收人</th>
                    <th className="px-6 py-4 text-right font-medium text-dark-300">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {generationLogs.map((log) => {
                    const FormatIcon = formatIcons[log.format];
                    return (
                      <tr
                        key={log.id}
                        className="border-b border-dark-700/50 hover:bg-dark-700/30 transition-colors cursor-pointer"
                        onClick={() => setSelectedLog(log)}
                      >
                        <td className="px-6 py-4">
                          <span className="text-white font-medium">{log.reportName}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-white">{formatDateTime(log.generatedAt)}</div>
                            <div className="text-xs text-dark-500">{getRelativeTime(log.generatedAt)}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${formatColors[log.format]}`}>
                            <FormatIcon className="w-3.5 h-3.5" />
                            <span className="text-xs font-medium uppercase">{log.format}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(log.status)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex -space-x-2">
                            {log.recipients.slice(0, 3).map((recipient, idx) => (
                              <div
                                key={idx}
                                className="w-7 h-7 rounded-full bg-dark-600 border-2 border-dark-800 flex items-center justify-center"
                                title={`${recipient.name} <${recipient.email}>`}
                              >
                                <User className="w-3.5 h-3.5 text-dark-400" />
                              </div>
                            ))}
                            {log.recipients.length > 3 && (
                              <div className="w-7 h-7 rounded-full bg-dark-600 border-2 border-dark-800 flex items-center justify-center text-xs text-dark-400">
                                +{log.recipients.length - 3}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {log.status === 'success' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                              }}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-dark-700 hover:bg-dark-600 text-dark-300 hover:text-white rounded-lg text-xs font-medium transition-colors"
                            >
                              <Download className="w-3.5 h-3.5" />
                              下载
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-dark-700/50 flex items-center justify-center mx-auto mb-4">
                <History className="w-8 h-8 text-dark-500" />
              </div>
              <p className="text-dark-400">暂无生成记录</p>
            </div>
          )}
        </div>
      )}

      {selectedLog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-dark-800 rounded-xl border border-dark-700 p-6 w-full max-w-lg animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-white text-lg">生成详情</h3>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-1.5 text-dark-400 hover:text-white hover:bg-dark-700 rounded transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between py-2 border-b border-dark-700">
                <span className="text-dark-400">报表名称</span>
                <span className="text-white font-medium">{selectedLog.reportName}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-dark-700">
                <span className="text-dark-400">生成时间</span>
                <span className="text-white">{formatDateTime(selectedLog.generatedAt)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-dark-700">
                <span className="text-dark-400">格式</span>
                <span className="text-white uppercase">{selectedLog.format}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-dark-700">
                <span className="text-dark-400">状态</span>
                {getStatusBadge(selectedLog.status)}
              </div>
              <div className="py-2 border-b border-dark-700">
                <span className="text-dark-400 block mb-2">接收人</span>
                <div className="space-y-2">
                  {selectedLog.recipients.map((recipient, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-2 bg-dark-700/30 rounded-lg">
                      <div className="w-8 h-8 rounded-full bg-dark-600 flex items-center justify-center">
                        <User className="w-4 h-4 text-dark-400" />
                      </div>
                      <div>
                        <div className="text-white text-sm">{recipient.name}</div>
                        <div className="text-dark-400 text-xs">{recipient.email}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {selectedLog.errorMessage && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <p className="text-red-400 text-sm">{selectedLog.errorMessage}</p>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setSelectedLog(null)}
                className="flex-1 px-4 py-2.5 bg-dark-700 hover:bg-dark-600 text-white rounded-lg font-medium transition-colors"
              >
                关闭
              </button>
              {selectedLog.status === 'success' && (
                <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-500 text-white rounded-lg font-medium transition-colors">
                  <Download className="w-4 h-4" />
                  下载文件
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface SubscriptionCardProps {
  subscription: Subscription;
  onToggle: () => void;
  onRemove: () => void;
  onTrigger: () => void;
  getFrequencyColor: (frequency: SubscriptionFrequency) => string;
  formatColors: Record<SubscriptionFormat, string>;
  formatIcons: Record<SubscriptionFormat, typeof FileText>;
  frequencyLabels: Record<SubscriptionFrequency, string>;
}

function SubscriptionCard({
  subscription,
  onToggle,
  onRemove,
  onTrigger,
  getFrequencyColor,
  formatColors,
  formatIcons,
  frequencyLabels,
}: SubscriptionCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const FormatIcon = formatIcons[subscription.format];

  return (
    <div className={`bg-dark-800 rounded-xl border transition-all duration-200 ${
      subscription.enabled ? 'border-dark-700' : 'border-dark-700/50 opacity-75'
    }`}>
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${formatColors[subscription.format]}`}>
              <FormatIcon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-lg">{subscription.reportName}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${getFrequencyColor(subscription.frequency)}`}>
                  {frequencyLabels[subscription.frequency]}
                </span>
                <span className="text-dark-500 text-xs">·</span>
                <span className="text-dark-400 text-xs flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  下次运行: {formatDateTime(subscription.nextRun)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onToggle}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                subscription.enabled ? 'bg-primary-600' : 'bg-dark-600'
              }`}
            >
              <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
                subscription.enabled ? 'translate-x-6' : 'translate-x-0.5'
              }`} />
            </button>

            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 text-dark-400 hover:text-white hover:bg-dark-700 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <circle cx="10" cy="5" r="1.5" />
                  <circle cx="10" cy="10" r="1.5" />
                  <circle cx="10" cy="15" r="1.5" />
                </svg>
              </button>

              {showMenu && (
                <div className="absolute right-0 top-full mt-1 w-40 bg-dark-700 rounded-lg border border-dark-600 shadow-xl z-10 animate-fade-in">
                  <button
                    onClick={() => { onTrigger(); setShowMenu(false); }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-left text-sm text-white hover:bg-dark-600 rounded-t-lg transition-colors"
                  >
                    <Play className="w-4 h-4" />
                    立即运行
                  </button>
                  <button
                    onClick={() => { onToggle(); setShowMenu(false); }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-left text-sm text-white hover:bg-dark-600 transition-colors"
                  >
                    {subscription.enabled ? (
                      <>
                        <Pause className="w-4 h-4" />
                        暂停订阅
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        启用订阅
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => { onRemove(); setShowMenu(false); }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-left text-sm text-red-400 hover:bg-red-500/10 rounded-b-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                    删除订阅
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-dark-700">
          <div className="flex items-center gap-1">
            <Mail className="w-4 h-4 text-dark-500 mr-2" />
            <span className="text-dark-400 text-sm">接收人:</span>
            <div className="flex -space-x-2 ml-2">
              {subscription.recipients.slice(0, 4).map((recipient, idx) => (
                <div
                  key={idx}
                  className="w-7 h-7 rounded-full bg-dark-600 border-2 border-dark-800 flex items-center justify-center"
                  title={`${recipient.name} <${recipient.email}>`}
                >
                  <User className="w-3.5 h-3.5 text-dark-400" />
                </div>
              ))}
              {subscription.recipients.length > 4 && (
                <div className="w-7 h-7 rounded-full bg-dark-600 border-2 border-dark-800 flex items-center justify-center text-xs text-dark-400">
                  +{subscription.recipients.length - 4}
                </div>
              )}
            </div>
          </div>

          <div className="text-right">
            <p className="text-dark-500 text-xs">已成功推送</p>
            <p className="text-white font-semibold">{subscription.successCount} 次</p>
          </div>
        </div>
      </div>
    </div>
  );
}
