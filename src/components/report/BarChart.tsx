import { useMemo } from 'react';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Settings } from 'lucide-react';
import { generateRegionChartData } from '../../data/mockData';
import type { ReportComponent, Report } from '../../types';

interface BarChartProps {
  component: ReportComponent;
  selected?: boolean;
  onSelect?: () => void;
  dataConfig?: Report['dataConfig'];
}

export function BarChart({ component, selected, onSelect, dataConfig }: BarChartProps) {
  const dataSourceId = dataConfig?.dataSource || 'ds-sales';
  const filters = dataConfig?.filters || [];
  const dateRange = dataConfig?.dateRange;

  const data = useMemo(
    () => generateRegionChartData(dataSourceId, filters, dateRange),
    [dataSourceId, filters, dateRange]
  );
  const colors = ['#3b82f6', '#60a5fa', '#1d4ed8', '#10b981', '#34d399', '#059669', '#f59e0b'];

  const yAxisKey = useMemo(() => {
    if (component.config.yAxisKey) return component.config.yAxisKey;
    const dsKeys: Record<string, string> = {
      'ds-sales': 'sales',
      'ds-users': 'usage',
      'ds-finance': 'income',
      'ds-marketing': 'roi',
    };
    return dsKeys[dataSourceId] || 'value';
  }, [component.config.yAxisKey, dataSourceId]);

  const keyLabels: Record<string, string> = {
    sales: '销售额', value: '数值', usage: '使用量', income: '收入', roi: 'ROI',
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-dark-800 border border-dark-600 rounded-lg p-3 shadow-xl">
          <p className="text-sm text-dark-300 mb-1">{label}</p>
          {payload.map((entry: any, index: number) => {
            const val = entry.value;
            const formatted = typeof val === 'number'
              ? (dataSourceId === 'ds-marketing' ? `${val}x` : `¥${val.toLocaleString()}`)
              : val;
            return (
              <p key={index} className="text-sm" style={{ color: entry.color }}>
                {keyLabels[entry.dataKey] || entry.dataKey}: {formatted}
              </p>
            );
          })}
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
          <RechartsBarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
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
            <Bar
              dataKey={yAxisKey}
              radius={[6, 6, 0, 0]}
              maxBarSize={50}
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Bar>
          </RechartsBarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
