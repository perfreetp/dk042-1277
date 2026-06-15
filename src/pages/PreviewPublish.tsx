import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Eye,
  Download,
  FileText,
  FileSpreadsheet,
  Image,
  Save,
  Plus,
  X,
  Calendar,
  CheckCircle2,
  ArrowRight,
  ChevronLeft,
  Loader2,
} from 'lucide-react';
import { useReportStore } from '../store/useReportStore';
import { ReportTable } from '../components/report/ReportTable';
import { LineChart } from '../components/report/LineChart';
import { BarChart } from '../components/report/BarChart';
import { TextBlock } from '../components/report/TextBlock';
import { exportReport } from '../utils/export';
import { getDateRange } from '../utils/dateUtils';
import type { SubscriptionFrequency, SubscriptionFormat, ReportComponent } from '../types';

type PeriodType = 'daily' | 'weekly' | 'monthly' | 'quarterly';

const periodLabels: Record<PeriodType, string> = {
  daily: '日报',
  weekly: '周报',
  monthly: '月报',
  quarterly: '季报',
};

const frequencyLabels: Record<SubscriptionFrequency, string> = {
  daily: '日报',
  weekly: '周报',
  monthly: '月报',
};

const formatLabels: Record<SubscriptionFormat, string> = {
  pdf: 'PDF',
  excel: 'Excel',
  png: 'PNG',
};

const GRID_COLS = 12;
const ROW_HEIGHT = 80;

const getComponentMinHeight = (type: ReportComponent['type'], gridHeight: number): number => {
  const base = gridHeight * ROW_HEIGHT;
  switch (type) {
    case 'table': return Math.max(base, 300);
    case 'lineChart': return Math.max(base, 280);
    case 'barChart': return Math.max(base, 280);
    case 'text': return Math.max(base, 60);
    default: return base;
  }
};

export function PreviewPublish() {
  const navigate = useNavigate();
  const {
    currentReport,
    saveReport,
    saveAsTemplate,
    addSubscription,
    updateComponent,
    updateDataConfig,
  } = useReportStore();

  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('weekly');
  const [isExporting, setIsExporting] = useState<string | null>(null);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templateDesc, setTemplateDesc] = useState('');
  const [subscriptionConfig, setSubscriptionConfig] = useState({
    frequency: 'weekly' as SubscriptionFrequency,
    format: 'pdf' as SubscriptionFormat,
    recipients: [{ name: '', email: '' }],
  });

  const handlePeriodChange = (period: PeriodType) => {
    setSelectedPeriod(period);
    const range = getDateRange(period);
    updateDataConfig({ dateRange: range });
  };

  if (!currentReport) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] animate-fade-in">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-dark-800 flex items-center justify-center mx-auto mb-6">
            <Eye className="w-10 h-10 text-dark-500" />
          </div>
          <h2 className="text-2xl font-semibold text-white mb-2">暂无报表</h2>
          <p className="text-dark-400 mb-6">请先从模板库选择模板或创建空白报表</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2.5 bg-primary-600 hover:bg-primary-500 text-white rounded-lg font-medium transition-colors"
          >
            前往模板库
          </button>
        </div>
      </div>
    );
  }

  const dataConfig = currentReport.dataConfig;

  const renderComponent = (component: ReportComponent) => {
    const commonProps = {
      component,
      selected: false,
      onSelect: () => {},
      dataConfig,
    };

    switch (component.type) {
      case 'table':
        return <ReportTable {...commonProps} />;
      case 'lineChart':
        return <LineChart {...commonProps} period={selectedPeriod} />;
      case 'barChart':
        return <BarChart {...commonProps} />;
      case 'text':
        return <TextBlock {...commonProps} editable={false} />;
      default:
        return null;
    }
  };

  const handleExport = async (format: SubscriptionFormat) => {
    setIsExporting(format);
    try {
      await exportReport(format, currentReport.name);
    } finally {
      setIsExporting(null);
    }
  };

  const handleSaveAsTemplate = () => {
    if (templateName) {
      saveAsTemplate(templateName, templateDesc);
      setShowTemplateModal(false);
      setTemplateName('');
      setTemplateDesc('');
    }
  };

  const handleAddSubscription = () => {
    const validRecipients = subscriptionConfig.recipients.filter(r => r.name && r.email);
    if (validRecipients.length > 0) {
      addSubscription({
        reportId: currentReport.id,
        reportName: currentReport.name,
        frequency: subscriptionConfig.frequency,
        format: subscriptionConfig.format,
        recipients: validRecipients,
        enabled: true,
        nextRun: new Date().toISOString(),
      });
      setShowSubscriptionModal(false);
      setSubscriptionConfig({
        frequency: 'weekly',
        format: 'pdf',
        recipients: [{ name: '', email: '' }],
      });
      navigate('/subscription');
    }
  };

  const addRecipient = () => {
    setSubscriptionConfig({
      ...subscriptionConfig,
      recipients: [...subscriptionConfig.recipients, { name: '', email: '' }],
    });
  };

  const removeRecipient = (index: number) => {
    setSubscriptionConfig({
      ...subscriptionConfig,
      recipients: subscriptionConfig.recipients.filter((_, i) => i !== index),
    });
  };

  const updateRecipient = (index: number, field: 'name' | 'email', value: string) => {
    const newRecipients = [...subscriptionConfig.recipients];
    newRecipients[index][field] = value;
    setSubscriptionConfig({ ...subscriptionConfig, recipients: newRecipients });
  };

  const sortedComponents = [...currentReport.components].sort((a, b) => a.position.y - b.position.y || a.position.x - b.position.x);

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-white mb-2">
              预览与发布
            </h1>
            <p className="text-dark-400">
              预览不同周期的报表效果，导出或配置订阅
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/data')}
              className="flex items-center gap-2 px-5 py-2.5 bg-dark-700 hover:bg-dark-600 text-white rounded-lg font-medium transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              返回配置
            </button>
            <button
              onClick={saveReport}
              className="flex items-center gap-2 px-5 py-2.5 bg-dark-700 hover:bg-dark-600 text-white rounded-lg font-medium transition-colors"
            >
              <Save className="w-4 h-4" />
              保存
            </button>
          </div>
        </div>
      </div>

      <div className="flex gap-6">
        <div className="flex-1">
          <div className="bg-dark-800 rounded-xl border border-dark-700 p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary-400" />
                <span className="text-white font-medium">选择预览周期</span>
              </div>
              <div className="flex bg-dark-700 rounded-lg p-1">
                {(Object.keys(periodLabels) as PeriodType[]).map((period) => (
                  <button
                    key={period}
                    onClick={() => handlePeriodChange(period)}
                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                      selectedPeriod === period
                        ? 'bg-primary-600 text-white'
                        : 'text-dark-400 hover:text-white'
                    }`}
                  >
                    {periodLabels[period]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-dark-800 rounded-xl border border-dark-700 p-6">
            <div className="mb-6 pb-4 border-b border-dark-700">
              <h2 className="font-display text-2xl font-bold text-white">
                {currentReport.name}
              </h2>
              <p className="text-dark-400 text-sm mt-1">
                {periodLabels[selectedPeriod]} · {dataConfig.dateRange.start} 至 {dataConfig.dateRange.end}
              </p>
            </div>

            {currentReport.components.length === 0 ? (
              <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-dark-700/50 flex items-center justify-center mx-auto mb-3">
                    <Eye className="w-8 h-8 text-dark-500" />
                  </div>
                  <p className="text-dark-400 text-sm">报表暂无组件，请先在编辑器中添加</p>
                </div>
              </div>
            ) : (
              <div
                className="grid gap-4"
                style={{
                  gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)`,
                }}
              >
                {sortedComponents.map((component) => {
                  const colSpan = Math.min(component.position.width, GRID_COLS);
                  const minHeight = getComponentMinHeight(component.type, component.position.height);

                  return (
                    <div
                      key={component.id}
                      className="animate-fade-in rounded-lg"
                      style={{
                        gridColumn: `span ${colSpan} / span ${colSpan}`,
                        minHeight,
                      }}
                    >
                      {renderComponent(component)}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="w-72 flex-shrink-0 space-y-4">
          <div className="bg-dark-800 rounded-xl border border-dark-700 p-5">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <Download className="w-5 h-5 text-primary-400" />
              导出文件
            </h3>
            <div className="space-y-3">
              <button
                onClick={() => handleExport('pdf')}
                disabled={isExporting !== null}
                className="w-full flex items-center gap-3 p-4 bg-dark-700/50 hover:bg-dark-700 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                  {isExporting === 'pdf' ? (
                    <Loader2 className="w-5 h-5 text-red-400 animate-spin" />
                  ) : (
                    <FileText className="w-5 h-5 text-red-400" />
                  )}
                </div>
                <div className="text-left">
                  <p className="text-white font-medium">PDF 文档</p>
                  <p className="text-xs text-dark-400">适合打印和分享</p>
                </div>
              </button>

              <button
                onClick={() => handleExport('excel')}
                disabled={isExporting !== null}
                className="w-full flex items-center gap-3 p-4 bg-dark-700/50 hover:bg-dark-700 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                  {isExporting === 'excel' ? (
                    <Loader2 className="w-5 h-5 text-green-400 animate-spin" />
                  ) : (
                    <FileSpreadsheet className="w-5 h-5 text-green-400" />
                  )}
                </div>
                <div className="text-left">
                  <p className="text-white font-medium">Excel 表格</p>
                  <p className="text-xs text-dark-400">可编辑的数据源</p>
                </div>
              </button>

              <button
                onClick={() => handleExport('png')}
                disabled={isExporting !== null}
                className="w-full flex items-center gap-3 p-4 bg-dark-700/50 hover:bg-dark-700 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  {isExporting === 'png' ? (
                    <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
                  ) : (
                    <Image className="w-5 h-5 text-blue-400" />
                  )}
                </div>
                <div className="text-left">
                  <p className="text-white font-medium">PNG 图片</p>
                  <p className="text-xs text-dark-400">适合嵌入演示</p>
                </div>
              </button>
            </div>
          </div>

          <div className="bg-dark-800 rounded-xl border border-dark-700 p-5">
            <h3 className="font-semibold text-white mb-4">发布操作</h3>
            <div className="space-y-3">
              <button
                onClick={() => setShowTemplateModal(true)}
                className="w-full flex items-center gap-3 p-4 bg-dark-700/50 hover:bg-dark-700 rounded-lg transition-all"
              >
                <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <Save className="w-5 h-5 text-purple-400" />
                </div>
                <div className="text-left">
                  <p className="text-white font-medium">保存为模板</p>
                  <p className="text-xs text-dark-400">团队成员可复用</p>
                </div>
              </button>

              <button
                onClick={() => setShowSubscriptionModal(true)}
                className="w-full flex items-center gap-3 p-4 bg-primary-600/10 hover:bg-primary-600/20 border border-primary-500/30 rounded-lg transition-all"
              >
                <div className="w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center">
                  <ArrowRight className="w-5 h-5 text-primary-400" />
                </div>
                <div className="text-left">
                  <p className="text-white font-medium">配置订阅</p>
                  <p className="text-xs text-dark-400">定期自动生成推送</p>
                </div>
              </button>
            </div>
          </div>

          <div className="bg-dark-800 rounded-xl border border-dark-700 p-5">
            <h3 className="font-semibold text-white mb-4">报表信息</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-dark-400">报表名称</span>
                <span className="text-white">{currentReport.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-dark-400">组件数量</span>
                <span className="text-white">{currentReport.components.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-dark-400">数据源</span>
                <span className="text-white">{dataConfig.dataSource.replace('ds-', '')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-dark-400">筛选条件</span>
                <span className="text-white">{dataConfig.filters.length} 个</span>
              </div>
              <div className="flex justify-between">
                <span className="text-dark-400">数据字段</span>
                <span className="text-white">{dataConfig.fields.filter(f => f.visible).length} 个可见</span>
              </div>
              <div className="flex justify-between">
                <span className="text-dark-400">状态</span>
                <span className="flex items-center gap-1 text-green-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {currentReport.status === 'published' ? '已发布' : '草稿'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showTemplateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-dark-800 rounded-xl border border-dark-700 p-6 w-full max-w-md animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-white text-lg">保存为模板</h3>
              <button
                onClick={() => setShowTemplateModal(false)}
                className="p-1.5 text-dark-400 hover:text-white hover:bg-dark-700 rounded transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-dark-300 mb-2">模板名称</label>
                <input
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="输入模板名称"
                  className="w-full px-3 py-2.5 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-dark-500 focus:outline-none focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm text-dark-300 mb-2">模板描述</label>
                <textarea
                  value={templateDesc}
                  onChange={(e) => setTemplateDesc(e.target.value)}
                  placeholder="描述模板用途和特点"
                  rows={3}
                  className="w-full px-3 py-2.5 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-dark-500 focus:outline-none focus:border-primary-500 resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowTemplateModal(false)}
                className="flex-1 px-4 py-2.5 bg-dark-700 hover:bg-dark-600 text-white rounded-lg font-medium transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSaveAsTemplate}
                disabled={!templateName}
                className="flex-1 px-4 py-2.5 bg-primary-600 hover:bg-primary-500 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {showSubscriptionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-dark-800 rounded-xl border border-dark-700 p-6 w-full max-w-lg animate-slide-up max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-white text-lg">配置订阅</h3>
              <button
                onClick={() => setShowSubscriptionModal(false)}
                className="p-1.5 text-dark-400 hover:text-white hover:bg-dark-700 rounded transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm text-dark-300 mb-2">订阅频率</label>
                <div className="grid grid-cols-3 gap-2">
                  {(Object.keys(frequencyLabels) as SubscriptionFrequency[]).map((freq) => (
                    <button
                      key={freq}
                      onClick={() => setSubscriptionConfig({ ...subscriptionConfig, frequency: freq })}
                      className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                        subscriptionConfig.frequency === freq
                          ? 'bg-primary-600 text-white'
                          : 'bg-dark-700 text-dark-300 hover:bg-dark-600 hover:text-white'
                      }`}
                    >
                      {frequencyLabels[freq]}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm text-dark-300 mb-2">导出格式</label>
                <div className="grid grid-cols-3 gap-2">
                  {(Object.keys(formatLabels) as SubscriptionFormat[]).map((fmt) => (
                    <button
                      key={fmt}
                      onClick={() => setSubscriptionConfig({ ...subscriptionConfig, format: fmt })}
                      className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                        subscriptionConfig.format === fmt
                          ? 'bg-primary-600 text-white'
                          : 'bg-dark-700 text-dark-300 hover:bg-dark-600 hover:text-white'
                      }`}
                    >
                      {formatLabels[fmt]}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm text-dark-300">接收人</label>
                  <button
                    onClick={addRecipient}
                    className="flex items-center gap-1 text-xs text-primary-400 hover:text-primary-300"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    添加接收人
                  </button>
                </div>
                <div className="space-y-3">
                  {subscriptionConfig.recipients.map((recipient, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={recipient.name}
                        onChange={(e) => updateRecipient(index, 'name', e.target.value)}
                        placeholder="姓名"
                        className="flex-1 px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-sm text-white placeholder-dark-500 focus:outline-none focus:border-primary-500"
                      />
                      <input
                        type="email"
                        value={recipient.email}
                        onChange={(e) => updateRecipient(index, 'email', e.target.value)}
                        placeholder="邮箱地址"
                        className="flex-1 px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-sm text-white placeholder-dark-500 focus:outline-none focus:border-primary-500"
                      />
                      {subscriptionConfig.recipients.length > 1 && (
                        <button
                          onClick={() => removeRecipient(index)}
                          className="p-2 text-dark-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowSubscriptionModal(false)}
                className="flex-1 px-4 py-2.5 bg-dark-700 hover:bg-dark-600 text-white rounded-lg font-medium transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleAddSubscription}
                className="flex-1 px-4 py-2.5 bg-primary-600 hover:bg-primary-500 text-white rounded-lg font-medium transition-colors"
              >
                创建订阅
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
