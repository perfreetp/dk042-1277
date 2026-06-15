import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  LayoutGrid,
  Users,
  TrendingUp,
  DollarSign,
  Megaphone,
  Eye,
  FileText,
  Clock,
} from 'lucide-react';
import { useReportStore } from '../store/useReportStore';
import { systemTemplates, teamTemplates } from '../data/templates';
import type { TemplateCategory } from '../types';

const categoryConfig: Record<TemplateCategory, { label: string; icon: any; color: string }> = {
  sales: { label: '销售', icon: TrendingUp, color: 'text-blue-400 bg-blue-500/10' },
  operation: { label: '运营', icon: LayoutGrid, color: 'text-green-400 bg-green-500/10' },
  finance: { label: '财务', icon: DollarSign, color: 'text-yellow-400 bg-yellow-500/10' },
  marketing: { label: '营销', icon: Megaphone, color: 'text-purple-400 bg-purple-500/10' },
};

type TabType = 'system' | 'team';

export function TemplateLibrary() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('system');
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | 'all'>('all');
  const { createReportFromTemplate, createBlankReport } = useReportStore();

  const templates = activeTab === 'system' ? systemTemplates : teamTemplates;

  const filteredTemplates = selectedCategory === 'all'
    ? templates
    : templates.filter(t => t.category === selectedCategory);

  const handleUseTemplate = (templateId: string) => {
    createReportFromTemplate(templateId);
    navigate('/editor');
  };

  const handleCreateBlank = () => {
    createBlankReport();
    navigate('/editor');
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-white mb-2">
              模板库
            </h1>
            <p className="text-dark-400">
              选择现成模板快速创建报表，或从零开始创建自定义报表
            </p>
          </div>
          <button
            onClick={handleCreateBlank}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-500 text-white rounded-lg font-medium transition-all duration-200 hover:shadow-lg hover:shadow-primary-500/25"
          >
            <Plus className="w-5 h-5" />
            新建空白报表
          </button>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <div className="flex bg-dark-800 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('system')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === 'system'
                  ? 'bg-primary-600 text-white'
                  : 'text-dark-400 hover:text-white'
              }`}
            >
              系统模板
            </button>
            <button
              onClick={() => setActiveTab('team')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === 'team'
                  ? 'bg-primary-600 text-white'
                  : 'text-dark-400 hover:text-white'
              }`}
            >
              团队模板
            </button>
          </div>

          <div className="flex items-center gap-2 ml-4">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                selectedCategory === 'all'
                  ? 'bg-dark-700 text-white'
                  : 'text-dark-400 hover:text-white hover:bg-dark-800'
              }`}
            >
              全部
            </button>
            {(Object.keys(categoryConfig) as TemplateCategory[]).map((cat) => {
              const config = categoryConfig[cat];
              const Icon = config.icon;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                    selectedCategory === cat
                      ? 'bg-dark-700 text-white'
                      : 'text-dark-400 hover:text-white hover:bg-dark-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {config.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          onClick={handleCreateBlank}
          className="group relative rounded-xl border-2 border-dashed border-dark-600 hover:border-primary-500 bg-dark-800/50 hover:bg-dark-800 p-8 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 min-h-[280px] animate-slide-up stagger-1"
        >
          <div className="w-16 h-16 rounded-full bg-dark-700 group-hover:bg-primary-500/20 flex items-center justify-center mb-4 transition-colors">
            <Plus className="w-8 h-8 text-dark-400 group-hover:text-primary-400 transition-colors" />
          </div>
          <h3 className="font-semibold text-white text-lg mb-2">创建空白报表</h3>
          <p className="text-dark-400 text-sm text-center">
            从零开始，自由拖拽组件设计报表布局
          </p>
        </div>

        {filteredTemplates.map((template, index) => {
          const catConfig = categoryConfig[template.category];
          const CatIcon = catConfig.icon;

          return (
            <div
              key={template.id}
              className="group relative rounded-xl overflow-hidden bg-dark-800 border border-dark-700 hover:border-primary-500/50 transition-all duration-300 component-hover animate-slide-up"
              style={{ animationDelay: `${(index + 2) * 50}ms` }}
            >
              <div className="relative h-40 overflow-hidden">
                <img
                  src={template.thumbnail}
                  alt={template.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-transparent to-transparent" />
                <div className={`absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${catConfig.color}`}>
                  <CatIcon className="w-3.5 h-3.5" />
                  {catConfig.label}
                </div>
                {template.isSystem && (
                  <div className="absolute top-3 right-3 px-2 py-1 bg-dark-900/80 rounded text-xs text-dark-300">
                    官方
                  </div>
                )}
              </div>

              <div className="p-5">
                <h3 className="font-semibold text-white text-lg mb-2 group-hover:text-primary-400 transition-colors">
                  {template.name}
                </h3>
                <p className="text-dark-400 text-sm mb-4 line-clamp-2">
                  {template.description}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-xs text-dark-500">
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      {template.useCount} 次使用
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {template.createdAt}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                      className="p-2 text-dark-400 hover:text-white hover:bg-dark-700 rounded-lg transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUseTemplate(template.id);
                      }}
                      className="flex items-center gap-1.5 px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      <FileText className="w-4 h-4" />
                      使用模板
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-full bg-dark-800 flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-dark-500" />
          </div>
          <h3 className="text-white font-semibold mb-2">暂无模板</h3>
          <p className="text-dark-400 text-sm">该分类下暂无模板，试试其他分类或创建空白报表</p>
        </div>
      )}
    </div>
  );
}
