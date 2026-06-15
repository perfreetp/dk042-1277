import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Settings, ArrowUp, ArrowDown } from 'lucide-react';
import { generateTableData, getFieldLabel, calculateSummary } from '../../data/mockData';
import type { ReportComponent, Report, FieldConfig } from '../../types';

interface ReportTableProps {
  component: ReportComponent;
  selected?: boolean;
  onSelect?: () => void;
  dataConfig?: Report['dataConfig'];
}

export function ReportTable({ component, selected, onSelect, dataConfig }: ReportTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = component.config.pageSize || 10;

  const dataSourceId = dataConfig?.dataSource || 'ds-sales';
  const filters = dataConfig?.filters || [];
  const fields = dataConfig?.fields;
  const dateRange = dataConfig?.dateRange;

  const data = useMemo(
    () => generateTableData(dataSourceId, 50, filters, fields, dateRange),
    [dataSourceId, filters, fields, dateRange]
  );

  const visibleFields = useMemo(() => {
    if (fields && fields.length > 0) {
      const vf = fields.filter(f => f.visible);
      if (vf.length > 0) return vf;
    }
    if (component.config.columns?.length) {
      return component.config.columns.map((col: string, i: number) => ({
        id: `col-${i}`,
        fieldName: col,
        displayName: getFieldLabel(col, dataSourceId),
        aggregate: 'none' as const,
        sortOrder: 'none' as const,
        visible: true,
      }));
    }
    const dsDefaults: Record<string, string[]> = {
      'ds-sales': ['orderNo', 'orderDate', 'customer', 'product', 'amount', 'status'],
      'ds-users': ['date', 'dau', 'newUsers', 'retention7', 'feature', 'usageCount'],
      'ds-finance': ['date', 'item', 'category', 'income', 'expense', 'profit'],
      'ds-marketing': ['campaign', 'channel', 'spend', 'leads', 'conversions', 'roi'],
    };
    return (dsDefaults[dataSourceId] || dsDefaults['ds-sales']).map((col, i) => ({
      id: `col-${i}`,
      fieldName: col,
      displayName: getFieldLabel(col, dataSourceId),
      aggregate: 'none' as const,
      sortOrder: 'none' as const,
      visible: true,
    }));
  }, [fields, component.config.columns, dataSourceId]);

  const summary = useMemo(
    () => calculateSummary(data, visibleFields as FieldConfig[]),
    [data, visibleFields]
  );

  const hasSummary = visibleFields.some((f: FieldConfig) => f.aggregate !== 'none');

  const columns = visibleFields.map((f: FieldConfig) => f.fieldName);
  const totalPages = Math.ceil(data.length / pageSize);
  const paginatedData = data.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const getStatusColor = (status: string) => {
    switch (status) {
      case '已完成': return 'text-green-400 bg-green-500/10';
      case '处理中': return 'text-yellow-400 bg-yellow-500/10';
      case '待付款': return 'text-blue-400 bg-blue-500/10';
      case '已取消': return 'text-red-400 bg-red-500/10';
      default: return 'text-dark-400 bg-dark-700/50';
    }
  };

  const formatValue = (key: string, value: any) => {
    if (['amount', 'unitPrice', 'income', 'expense', 'profit', 'balance', 'cashFlow', 'spend', 'cac'].includes(key)) {
      return `¥${Number(value).toLocaleString()}`;
    }
    if (['roi'].includes(key)) {
      return `${value}x`;
    }
    if (['margin', 'retention7', 'retention30'].includes(key)) {
      return `${value}%`;
    }
    if (['avgSession'].includes(key)) {
      return `${value}min`;
    }
    return value;
  };

  const getColumnLabel = (fieldName: string) => {
    const vf = visibleFields.find(f => f.fieldName === fieldName);
    if (vf && vf.displayName && vf.displayName !== vf.fieldName) return vf.displayName;
    return getFieldLabel(fieldName, dataSourceId);
  };

  return (
    <div
      onClick={onSelect}
      className={`w-full h-full rounded-lg overflow-hidden transition-all duration-200 ${
        selected ? 'component-selected' : ''
      }`}
      style={{ backgroundColor: component.style.backgroundColor || '#1e293b' }}
    >
      {component.config.title && (
        <div className="px-4 py-3 border-b border-dark-700 flex items-center justify-between">
          <h3 className="font-semibold text-white">{component.config.title}</h3>
          {selected && (
            <button
              onClick={(e) => e.stopPropagation()}
              className="p-1.5 text-dark-400 hover:text-white hover:bg-dark-700/50 rounded transition-colors"
            >
              <Settings className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      <div className="overflow-auto" style={{ height: component.config.title ? 'calc(100% - 52px)' : '100%' }}>
        <table className="w-full text-sm">
          <thead className="bg-dark-700/50 sticky top-0">
            <tr>
              {columns.map((col: string) => {
                const field = visibleFields.find((f: FieldConfig) => f.fieldName === col);
                const sortOrder = field?.sortOrder || 'none';
                const sortFields = visibleFields.filter((f: FieldConfig) => f.sortOrder !== 'none');
                const sortPriority = sortOrder !== 'none'
                  ? sortFields.findIndex((f: FieldConfig) => f.fieldName === col) + 1
                  : null;

                return (
                  <th
                    key={col}
                    className="px-4 py-3 text-left font-medium whitespace-nowrap"
                  >
                    <div className="flex items-center gap-1.5">
                      <span className={sortOrder !== 'none' ? 'text-primary-400' : 'text-dark-300'}>
                        {getColumnLabel(col)}
                      </span>
                      {sortOrder !== 'none' && (
                        <span className="flex items-center gap-0.5">
                          {sortPriority && sortPriority > 1 && (
                            <span className="text-[10px] px-1 py-0.5 rounded bg-primary-600/30 text-primary-300 font-medium">
                              {sortPriority}
                            </span>
                          )}
                          {sortOrder === 'asc' ? (
                            <ArrowUp className="w-3.5 h-3.5 text-primary-400" />
                          ) : (
                            <ArrowDown className="w-3.5 h-3.5 text-primary-400" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row, index) => (
              <tr
                key={index}
                className="border-t border-dark-700/50 hover:bg-dark-700/30 transition-colors"
              >
                {columns.map((col: string) => (
                  <td key={col} className="px-4 py-2.5 text-dark-200 whitespace-nowrap">
                    {col === 'status' ? (
                      <span className={`px-2 py-0.5 rounded text-xs ${getStatusColor(row[col])}`}>
                        {row[col]}
                      </span>
                    ) : (
                      formatValue(col, row[col])
                    )}
                  </td>
                ))}
              </tr>
            ))}
            {hasSummary && (
              <tr className="border-t-2 border-primary-600/30 bg-primary-600/5">
                {columns.map((col: string, idx: number) => {
                  const field = visibleFields.find((f: FieldConfig) => f.fieldName === col);
                  const isAgg = field && field.aggregate !== 'none';
                  const aggLabels: Record<string, string> = {
                    sum: '合计', avg: '平均', count: '计数', max: '最大', min: '最小',
                  };
                  return (
                    <td
                      key={col}
                      className={`px-4 py-3 whitespace-nowrap font-semibold ${
                        isAgg ? 'text-primary-400' : 'text-dark-400'
                      }`}
                    >
                      {idx === 0 && !isAgg ? (
                        <span className="text-primary-400">
                          {field?.aggregate && field.aggregate !== 'none'
                            ? aggLabels[field.aggregate]
                            : '汇总'}
                        </span>
                      ) : isAgg ? (
                        formatValue(col, summary[col])
                      ) : (
                        '-'
                      )}
                    </td>
                  );
                })}
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {component.config.showPagination !== false && totalPages > 1 && (
        <div className="px-4 py-3 border-t border-dark-700 flex items-center justify-between">
          <span className="text-sm text-dark-400">
            共 {data.length} 条记录
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setCurrentPage(Math.max(1, currentPage - 1));
              }}
              disabled={currentPage === 1}
              className="p-1.5 text-dark-400 hover:text-white hover:bg-dark-700/50 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm text-dark-300 min-w-[60px] text-center">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setCurrentPage(Math.min(totalPages, currentPage + 1));
              }}
              disabled={currentPage === totalPages}
              className="p-1.5 text-dark-400 hover:text-white hover:bg-dark-700/50 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
