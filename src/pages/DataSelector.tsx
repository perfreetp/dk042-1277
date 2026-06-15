import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Database,
  Plus,
  X,
  Filter,
  ArrowUpDown,
  Calculator,
  Eye,
  EyeOff,
  ChevronRight,
  Calendar,
} from 'lucide-react';
import { useReportStore } from '../store/useReportStore';
import { dataSources } from '../data/mockData';
import type { FilterOperator, AggregateType, SortOrder } from '../types';

import { getDateRange } from '../utils/dateUtils';

const operatorLabels: Record<FilterOperator, string> = {
  eq: '等于',
  ne: '不等于',
  gt: '大于',
  lt: '小于',
  between: '介于',
  in: '包含',
  contains: '包含文本',
};

const aggregateLabels: Record<AggregateType, string> = {
  sum: '求和',
  avg: '平均值',
  count: '计数',
  max: '最大值',
  min: '最小值',
  none: '不汇总',
};

const sortLabels: Record<SortOrder, string> = {
  asc: '升序',
  desc: '降序',
  none: '不排序',
};

export function DataSelector() {
  const navigate = useNavigate();
  const { currentReport, updateDataConfig, switchDataSource, addFilter, removeFilter, updateField } = useReportStore();
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [newFilter, setNewFilter] = useState({ field: '', operator: 'eq' as FilterOperator, value: '' });

  if (!currentReport) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] animate-fade-in">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-dark-800 flex items-center justify-center mx-auto mb-6">
            <Database className="w-10 h-10 text-dark-500" />
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

  const currentDataSource = dataSources.find(ds => ds.id === currentReport.dataConfig.dataSource);

  const handleAddFilter = () => {
    if (newFilter.field && newFilter.value) {
      addFilter(newFilter);
      setNewFilter({ field: '', operator: 'eq', value: '' });
      setShowFilterModal(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-white mb-2">
              数据配置
            </h1>
            <p className="text-dark-400">
              选择数据源、设置筛选条件和字段配置
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/editor')}
              className="px-5 py-2.5 bg-dark-700 hover:bg-dark-600 text-white rounded-lg font-medium transition-colors"
            >
              返回编辑
            </button>
            <button
              onClick={() => navigate('/preview')}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-500 text-white rounded-lg font-medium transition-colors"
            >
              下一步：预览发布
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-dark-800 rounded-xl border border-dark-700 p-5">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <Database className="w-5 h-5 text-primary-400" />
              选择数据源
            </h3>
            <div className="space-y-3">
              {dataSources.map((ds) => (
                <div
                  key={ds.id}
                  onClick={() => switchDataSource(ds.id)}
                  className={`p-4 rounded-lg cursor-pointer transition-all duration-200 border ${
                    currentReport.dataConfig.dataSource === ds.id
                      ? 'bg-primary-600/10 border-primary-500/30'
                      : 'bg-dark-700/30 border-transparent hover:bg-dark-700/50 hover:border-dark-600'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium text-white">{ds.name}</h4>
                    {currentReport.dataConfig.dataSource === ds.id && (
                      <div className="w-2 h-2 rounded-full bg-primary-500" />
                    )}
                  </div>
                  <p className="text-sm text-dark-400">{ds.description}</p>
                  <p className="text-xs text-dark-500 mt-2">
                    {ds.fields.length} 个字段可用
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-dark-800 rounded-xl border border-dark-700 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary-400" />
                时间范围
              </h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-dark-300 mb-2">开始日期</label>
                <input
                  type="date"
                  value={currentReport.dataConfig.dateRange.start}
                  onChange={(e) =>
                    updateDataConfig({
                      dateRange: { ...currentReport.dataConfig.dateRange, start: e.target.value }
                    })
                  }
                  className="w-full px-3 py-2.5 bg-dark-700 border border-dark-600 rounded-lg text-sm text-white focus:outline-none focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm text-dark-300 mb-2">结束日期</label>
                <input
                  type="date"
                  value={currentReport.dataConfig.dateRange.end}
                  onChange={(e) =>
                    updateDataConfig({
                      dateRange: { ...currentReport.dataConfig.dateRange, end: e.target.value }
                    })
                  }
                  className="w-full px-3 py-2.5 bg-dark-700 border border-dark-600 rounded-lg text-sm text-white focus:outline-none focus:border-primary-500"
                />
              </div>
              <div className="flex gap-2">
                {(['daily', 'weekly', 'monthly', 'quarterly'] as const).map((period) => {
                  const isActive = currentReport.dataConfig.dateRange.start === getDateRange(period).start &&
                    currentReport.dataConfig.dateRange.end === getDateRange(period).end;
                  return (
                    <button
                      key={period}
                      onClick={() => {
                        const range = getDateRange(period);
                        updateDataConfig({ dateRange: range });
                      }}
                      className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                        isActive
                          ? 'bg-primary-600 text-white'
                          : 'bg-dark-700 hover:bg-dark-600 text-dark-300 hover:text-white'
                      }`}
                    >
                      {period === 'daily' && '今日'}
                      {period === 'weekly' && '本周'}
                      {period === 'monthly' && '本月'}
                      {period === 'quarterly' && '本季度'}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-dark-800 rounded-xl border border-dark-700 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <Filter className="w-5 h-5 text-primary-400" />
                筛选条件
                <span className="ml-2 px-2 py-0.5 bg-primary-500/20 text-primary-400 rounded text-xs">
                  {currentReport.dataConfig.filters.length} 个
                </span>
              </h3>
              <button
                onClick={() => setShowFilterModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-600 hover:bg-primary-500 text-white rounded-lg text-sm font-medium transition-colors"
              >
                <Plus className="w-4 h-4" />
                添加筛选
              </button>
            </div>

            {currentReport.dataConfig.filters.length > 0 ? (
              <div className="space-y-3">
                {currentReport.dataConfig.filters.map((filter) => {
                  const field = currentDataSource?.fields.find(f => f.name === filter.field);
                  return (
                    <div
                      key={filter.id}
                      className="flex items-center gap-4 p-3 bg-dark-700/30 rounded-lg"
                    >
                      <span className="filter-tag">
                        {field?.label || filter.field}
                      </span>
                      <span className="text-dark-400 text-sm">{operatorLabels[filter.operator]}</span>
                      <span className="text-white text-sm font-medium">{filter.value}</span>
                      <button
                        onClick={() => removeFilter(filter.id)}
                        className="ml-auto p-1.5 text-dark-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-12 h-12 rounded-full bg-dark-700/50 flex items-center justify-center mx-auto mb-3">
                  <Filter className="w-6 h-6 text-dark-500" />
                </div>
                <p className="text-dark-400 text-sm">暂无筛选条件，点击上方按钮添加</p>
              </div>
            )}
          </div>

          <div className="bg-dark-800 rounded-xl border border-dark-700 p-5">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <ArrowUpDown className="w-5 h-5 text-primary-400" />
              字段配置
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-dark-700">
                    <th className="px-4 py-3 text-left font-medium text-dark-300">字段名</th>
                    <th className="px-4 py-3 text-left font-medium text-dark-300">显示名称</th>
                    <th className="px-4 py-3 text-left font-medium text-dark-300">
                      <Calculator className="w-4 h-4 inline mr-1" />
                      汇总方式
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-dark-300">
                      <ArrowUpDown className="w-4 h-4 inline mr-1" />
                      排序
                    </th>
                    <th className="px-4 py-3 text-center font-medium text-dark-300">
                      <Eye className="w-4 h-4 inline mr-1" />
                      显示
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentReport.dataConfig.fields.map((field, index) => (
                    <tr
                      key={field.id}
                      className="border-b border-dark-700/50 hover:bg-dark-700/30 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <span className="text-white font-medium">{field.fieldName}</span>
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={field.displayName}
                          onChange={(e) => updateField(field.id, { displayName: e.target.value })}
                          className="w-full px-2 py-1 bg-dark-700/50 border border-dark-600 rounded text-white text-sm focus:outline-none focus:border-primary-500"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={field.aggregate}
                          onChange={(e) => updateField(field.id, { aggregate: e.target.value as AggregateType })}
                          className="px-2 py-1 bg-dark-700/50 border border-dark-600 rounded text-white text-sm focus:outline-none focus:border-primary-500"
                        >
                          {(Object.keys(aggregateLabels) as AggregateType[]).map((agg) => (
                            <option key={agg} value={agg}>
                              {aggregateLabels[agg]}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={field.sortOrder}
                          onChange={(e) => updateField(field.id, { sortOrder: e.target.value as SortOrder })}
                          className="px-2 py-1 bg-dark-700/50 border border-dark-600 rounded text-white text-sm focus:outline-none focus:border-primary-500"
                        >
                          {(Object.keys(sortLabels) as SortOrder[]).map((sort) => (
                            <option key={sort} value={sort}>
                              {sortLabels[sort]}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => updateField(field.id, { visible: !field.visible })}
                          className={`p-1.5 rounded transition-colors ${
                            field.visible
                              ? 'text-green-400 bg-green-500/10 hover:bg-green-500/20'
                              : 'text-dark-500 bg-dark-700 hover:bg-dark-600'
                          }`}
                        >
                          {field.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {showFilterModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-dark-800 rounded-xl border border-dark-700 p-6 w-full max-w-md animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-white text-lg">添加筛选条件</h3>
              <button
                onClick={() => setShowFilterModal(false)}
                className="p-1.5 text-dark-400 hover:text-white hover:bg-dark-700 rounded transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-dark-300 mb-2">选择字段</label>
                <select
                  value={newFilter.field}
                  onChange={(e) => setNewFilter({ ...newFilter, field: e.target.value })}
                  className="w-full px-3 py-2.5 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-primary-500"
                >
                  <option value="">请选择字段</option>
                  {currentDataSource?.fields.map((field) => (
                    <option key={field.name} value={field.name}>
                      {field.label} ({field.name})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-dark-300 mb-2">操作符</label>
                <select
                  value={newFilter.operator}
                  onChange={(e) => setNewFilter({ ...newFilter, operator: e.target.value as FilterOperator })}
                  className="w-full px-3 py-2.5 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-primary-500"
                >
                  {(Object.keys(operatorLabels) as FilterOperator[]).map((op) => (
                    <option key={op} value={op}>
                      {operatorLabels[op]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-dark-300 mb-2">筛选值</label>
                <input
                  type="text"
                  value={newFilter.value}
                  onChange={(e) => setNewFilter({ ...newFilter, value: e.target.value })}
                  placeholder="输入筛选值"
                  className="w-full px-3 py-2.5 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-dark-500 focus:outline-none focus:border-primary-500"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowFilterModal(false)}
                className="flex-1 px-4 py-2.5 bg-dark-700 hover:bg-dark-600 text-white rounded-lg font-medium transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleAddFilter}
                className="flex-1 px-4 py-2.5 bg-primary-600 hover:bg-primary-500 text-white rounded-lg font-medium transition-colors"
              >
                添加
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
