import { useState } from 'react';
import { ChevronLeft, ChevronRight, Settings } from 'lucide-react';
import { generateTableData } from '../../data/mockData';
import type { ReportComponent } from '../../types';

interface ReportTableProps {
  component: ReportComponent;
  selected?: boolean;
  onSelect?: () => void;
}

export function ReportTable({ component, selected, onSelect }: ReportTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = component.config.pageSize || 10;
  const data = generateTableData(50);
  const columns = component.config.columns?.length
    ? component.config.columns
    : ['orderNo', 'orderDate', 'customer', 'product', 'amount', 'status'];

  const totalPages = Math.ceil(data.length / pageSize);
  const paginatedData = data.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const getStatusColor = (status: string) => {
    switch (status) {
      case '已完成':
        return 'text-green-400 bg-green-500/10';
      case '处理中':
        return 'text-yellow-400 bg-yellow-500/10';
      case '待付款':
        return 'text-blue-400 bg-blue-500/10';
      case '已取消':
        return 'text-red-400 bg-red-500/10';
      default:
        return 'text-dark-400 bg-dark-700/50';
    }
  };

  const formatValue = (key: string, value: any) => {
    if (key === 'amount') {
      return `¥${Number(value).toLocaleString()}`;
    }
    if (key === 'unitPrice') {
      return `¥${Number(value).toLocaleString()}`;
    }
    return value;
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
          <button
            onClick={(e) => e.stopPropagation()}
            className="p-1.5 text-dark-400 hover:text-white hover:bg-dark-700/50 rounded transition-colors"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="overflow-auto" style={{ height: component.config.title ? 'calc(100% - 52px)' : '100%' }}>
        <table className="w-full text-sm">
          {component.config.showHeader !== false && (
            <thead className="bg-dark-700/50 sticky top-0">
              <tr>
                {columns.map((col: string) => (
                  <th
                    key={col}
                    className="px-4 py-3 text-left font-medium text-dark-300 whitespace-nowrap"
                  >
                    {col === 'orderNo' && '订单号'}
                    {col === 'orderDate' && '日期'}
                    {col === 'customer' && '客户'}
                    {col === 'product' && '产品'}
                    {col === 'category' && '分类'}
                    {col === 'quantity' && '数量'}
                    {col === 'amount' && '金额'}
                    {col === 'region' && '区域'}
                    {col === 'status' && '状态'}
                    {col === 'salesperson' && '销售'}
                    {col === 'unitPrice' && '单价'}
                  </th>
                ))}
              </tr>
            </thead>
          )}
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
