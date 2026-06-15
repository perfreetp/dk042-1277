import { useMemo } from 'react';
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Settings } from 'lucide-react';
import { generateChartData } from '../../data/mockData';
import type { ReportComponent, Report } from '../../types';

interface LineChartProps {
  component: ReportComponent;
  selected?: boolean;
  onSelect?: () => void;
  period?: 'daily' | 'weekly' | 'monthly';
  dataConfig?: Report['dataConfig'];
}

export function LineChart({ component, selected, onSelect, period = 'weekly', dataConfig }: LineChartProps) {
  const dataSourceId = dataConfig?.dataSource || 'ds-sales';
  const filters = dataConfig?.filters || [];
  const dateRange = dataConfig?.dateRange;

  const data = useMemo(
    () => generateChartData(dataSourceId, period, filters, dateRange),
    [dataSourceId, period, filters, dateRange]
  );
  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  const yAxisKeys = useMemo(() => {
    if (component.config.yAxisKeys?.length) return component.config.yAxisKeys;
    const dsKeys: Record<string, string[]> = {
      'ds-sales': ['sales'],
      'ds-users': ['dau', 'newUsers'],
      'ds-finance': ['income', 'expense'],
      'ds-marketing': ['spend', 'conversions'],
    };
    return dsKeys[dataSourceId] || ['value'];
  }, [component.config.yAxisKeys, dataSourceId]);

  const keyLabels: Record<string, string> = {
    sales: '销售额', orders: '订单数', customers: '客户数', value: '数值',
    dau: '日活用户', wau: '周活用户', mau: '月活用户', newUsers: '新增用户',
    income: '收入', expense: '支出', profit: '利润',
    spend: '投放金额', conversions: '转化数', roi: 'ROI',
    usage: '使用量',
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-dark-800 border border-dark-600 rounded-lg p-3 shadow-xl">
          <p className="text-sm text-dark-300 mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {keyLabels[entry.dataKey] || entry.dataKey}: {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
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

      <div className="chart-container" style={{ height: component.config.title ? 'calc(100% - 52px)' : '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <RechartsLineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis
              dataKey={component.config.xAxisKey || 'name'}
              stroke="#94a3b8"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#94a3b8"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}
            />
            <Tooltip content={<CustomTooltip />} />
            {component.config.legend && (
              <Legend
                wrapperStyle={{ paddingTop: '10px' }}
                formatter={(value) => (
                  <span className="text-dark-300 text-sm">{keyLabels[value] || value}</span>
                )}
              />
            )}
            {yAxisKeys.map((key: string, index: number) => (
              <Line
                key={key}
                type={component.config.smooth !== false ? 'monotone' : 'linear'}
                dataKey={key}
                stroke={colors[index % colors.length]}
                strokeWidth={2.5}
                dot={{ fill: colors[index % colors.length], strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, strokeWidth: 2 }}
              />
            ))}
          </RechartsLineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
