import type { DataSource, ChartDataPoint, TableDataRow, GenerationLog, Subscription, FieldConfig, Report } from '../types';

export const dataSources: DataSource[] = [
  {
    id: 'ds-sales',
    name: '销售数据表',
    description: '包含所有销售订单、客户、产品等销售相关数据',
    fields: [
      { name: 'orderNo', type: 'string', label: '订单号' },
      { name: 'orderDate', type: 'date', label: '订单日期' },
      { name: 'customer', type: 'string', label: '客户名称' },
      { name: 'product', type: 'string', label: '产品名称' },
      { name: 'category', type: 'string', label: '产品分类' },
      { name: 'quantity', type: 'number', label: '数量' },
      { name: 'unitPrice', type: 'number', label: '单价' },
      { name: 'amount', type: 'number', label: '金额' },
      { name: 'region', type: 'string', label: '销售区域' },
      { name: 'salesperson', type: 'string', label: '销售人员' },
      { name: 'status', type: 'string', label: '订单状态' },
    ],
  },
  {
    id: 'ds-users',
    name: '用户行为表',
    description: '用户活跃度、留存、功能使用等行为数据',
    fields: [
      { name: 'date', type: 'date', label: '日期' },
      { name: 'dau', type: 'number', label: '日活用户' },
      { name: 'wau', type: 'number', label: '周活用户' },
      { name: 'mau', type: 'number', label: '月活用户' },
      { name: 'newUsers', type: 'number', label: '新增用户' },
      { name: 'retention7', type: 'number', label: '7日留存' },
      { name: 'retention30', type: 'number', label: '30日留存' },
      { name: 'avgSession', type: 'number', label: '平均会话时长' },
      { name: 'feature', type: 'string', label: '功能模块' },
      { name: 'usageCount', type: 'number', label: '使用次数' },
    ],
  },
  {
    id: 'ds-finance',
    name: '财务数据表',
    description: '收入、支出、利润、现金流等财务数据',
    fields: [
      { name: 'date', type: 'date', label: '日期' },
      { name: 'item', type: 'string', label: '项目名称' },
      { name: 'category', type: 'string', label: '分类' },
      { name: 'income', type: 'number', label: '收入' },
      { name: 'expense', type: 'number', label: '支出' },
      { name: 'profit', type: 'number', label: '利润' },
      { name: 'margin', type: 'number', label: '利润率' },
      { name: 'balance', type: 'number', label: '余额' },
      { name: 'cashFlow', type: 'number', label: '现金流' },
    ],
  },
  {
    id: 'ds-marketing',
    name: '营销数据表',
    description: '营销活动、渠道转化、获客成本等数据',
    fields: [
      { name: 'campaign', type: 'string', label: '活动名称' },
      { name: 'channel', type: 'string', label: '推广渠道' },
      { name: 'date', type: 'date', label: '日期' },
      { name: 'spend', type: 'number', label: '投放金额' },
      { name: 'impressions', type: 'number', label: '曝光量' },
      { name: 'clicks', type: 'number', label: '点击量' },
      { name: 'leads', type: 'number', label: '线索数' },
      { name: 'conversions', type: 'number', label: '转化数' },
      { name: 'cac', type: 'number', label: '获客成本' },
      { name: 'roi', type: 'number', label: 'ROI' },
    ],
  },
];

export const getFieldsForDataSource = (dsId: string): FieldConfig[] => {
  const ds = dataSources.find(d => d.id === dsId);
  if (!ds) return [];
  return ds.fields.map((f, i) => ({
    id: `f${i + 1}`,
    fieldName: f.name,
    displayName: f.label,
    aggregate: f.type === 'number' ? 'sum' : 'none',
    sortOrder: i === 0 ? 'desc' : 'none',
    visible: i < 8,
  }));
};

export const defaultFields: FieldConfig[] = getFieldsForDataSource('ds-sales');

const createSeededRandom = (seed: number) => {
  let current = seed;
  return () => {
    current = Math.sin(current) * 10000;
    return current - Math.floor(current);
  };
};

export const generateChartData = (
  dataSourceId: string,
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly',
  filters?: Report['dataConfig']['filters'],
  dateRange?: { start: string; end: string },
): ChartDataPoint[] => {
  const rawData = generateTableData(dataSourceId, 200, filters, undefined, dateRange);

  if (rawData.length === 0) {
    return [];
  }

  const dateField = dataSourceId === 'ds-sales' ? 'orderDate' : 'date';

  const getPeriodKey = (dateStr: string): string => {
    const d = new Date(dateStr);
    if (period === 'daily') {
      const day = d.getDay();
      const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
      return days[day];
    }
    if (period === 'weekly') {
      const weekNum = Math.ceil(d.getDate() / 7);
      return `第${Math.min(weekNum, 4)}周`;
    }
    if (period === 'monthly') {
      return `${d.getMonth() + 1}月`;
    }
    const q = Math.ceil((d.getMonth() + 1) / 3);
    return `Q${q}`;
  };

  const periodOrder: Record<string, string[]> = {
    daily: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
    weekly: ['第1周', '第2周', '第3周', '第4周'],
    monthly: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
    quarterly: ['Q1', 'Q2', 'Q3', 'Q4'],
  };

  const order = periodOrder[period] || periodOrder.weekly;

  const aggregated: Record<string, Record<string, number>> = {};

  for (const row of rawData) {
    const key = getPeriodKey(String(row[dateField]));
    if (!aggregated[key]) {
      aggregated[key] = {};
    }
    for (const [k, v] of Object.entries(row)) {
      if (typeof v === 'number') {
        if (aggregated[key][k] === undefined) {
          aggregated[key][k] = 0;
        }
        aggregated[key][k] += v;
      }
    }
  }

  const keys = order.filter(k => aggregated[k] !== undefined);
  const finalKeys = keys.length > 0 ? keys : Object.keys(aggregated);

  return finalKeys.map(key => {
    const agg = aggregated[key] || {};
    const result: Record<string, any> = {
      name: key,
      value: 0,
      ...agg,
    };
    if (dataSourceId === 'ds-sales') {
      result.sales = result.amount || result.sales || 0;
      result.orders = result.quantity || result.orders || 0;
      result.value = result.sales;
    }
    if (dataSourceId === 'ds-users') {
      result.usage = result.usageCount || result.usage || 0;
      result.activeUsers = result.dau || result.activeUsers || 0;
      result.value = result.dau;
    }
    if (dataSourceId === 'ds-finance') {
      result.revenue = result.income || result.revenue || 0;
      result.value = result.income;
    }
    if (dataSourceId === 'ds-marketing') {
      result.conversionRate = result.roi || result.conversionRate || 0;
      result.value = result.conversions;
    }
    return result as ChartDataPoint;
  });
};

export const generateRegionChartData = (
  dataSourceId: string = 'ds-sales',
  filters?: Report['dataConfig']['filters'],
  dateRange?: { start: string; end: string },
): ChartDataPoint[] => {
  const rawData = generateTableData(dataSourceId, 100, filters, undefined, dateRange);

  if (rawData.length === 0) {
    return [];
  }

  let categoryField: string;
  let valueField: string;

  switch (dataSourceId) {
    case 'ds-users':
      categoryField = 'feature';
      valueField = 'usageCount';
      break;
    case 'ds-finance':
      categoryField = 'category';
      valueField = 'income';
      break;
    case 'ds-marketing':
      categoryField = 'channel';
      valueField = 'spend';
      break;
    default:
      categoryField = 'region';
      valueField = 'amount';
  }

  const aggregated: Record<string, Record<string, number>> = {};

  for (const row of rawData) {
    const cat = String(row[categoryField] || '未知');
    if (!aggregated[cat]) {
      aggregated[cat] = { [valueField]: 0 };
    }
    for (const [k, v] of Object.entries(row)) {
      if (typeof v === 'number') {
        if (aggregated[cat][k] === undefined) {
          aggregated[cat][k] = 0;
        }
        aggregated[cat][k] += v;
      }
    }
  }

  const results = Object.entries(aggregated)
    .map(([name, vals]) => ({
      name,
      value: vals[valueField] || 0,
      [valueField]: vals[valueField] || 0,
      sales: vals.amount || vals.sales || 0,
      usage: vals.usageCount || vals.usage || 0,
      income: vals.income || 0,
      roi: vals.roi || 0,
      ...vals,
    }))
    .sort((a, b) => (b.value as number) - (a.value as number));

  return results.slice(0, 10);
};

export const generateTableData = (
  dataSourceId: string = 'ds-sales',
  count: number = 50,
  filters?: Report['dataConfig']['filters'],
  fields?: FieldConfig[],
  dateRange?: { start: string; end: string },
): TableDataRow[] => {
  let data: TableDataRow[];
  const startDate = dateRange?.start ? new Date(dateRange.start) : null;
  const endDate = dateRange?.end ? new Date(dateRange.end) : null;

  const seedBase = dataSourceId.charCodeAt(3) + (dateRange?.start?.length || 0);
  const seededRandom = createSeededRandom(seedBase);

  switch (dataSourceId) {
    case 'ds-users': {
      const features = ['首页', '搜索', '推荐', '社区', '商城', '消息', '设置'];
      data = Array.from({ length: count }, (_, i) => {
        const date = endDate
          ? new Date(endDate.getTime() - i * 86400000)
          : new Date(Date.now() - i * 86400000);
        return {
          date: date.toISOString().split('T')[0],
          dau: Math.floor(seededRandom() * 8000) + 5000,
          wau: Math.floor(seededRandom() * 20000) + 15000,
          mau: Math.floor(seededRandom() * 50000) + 40000,
          newUsers: Math.floor(seededRandom() * 1500) + 500,
          retention7: Math.round(seededRandom() * 300) / 10 + 30,
          retention30: Math.round(seededRandom() * 200) / 10 + 15,
          avgSession: Math.round(seededRandom() * 150) / 10 + 5,
          feature: features[Math.floor(seededRandom() * features.length)],
          usageCount: Math.floor(seededRandom() * 5000) + 1000,
        };
      });
      break;
    }
    case 'ds-finance': {
      const items = ['SaaS订阅收入', '技术服务费', '咨询服务费', '数据服务费', '人力成本', '办公费用', '营销支出', '研发投入', '培训收入'];
      const categories = ['主营收入', '其他收入', '运营成本', '人力成本', '营销费用', '研发费用'];
      data = Array.from({ length: count }, (_, i) => {
        const date = endDate
          ? new Date(endDate.getTime() - i * 86400000)
          : new Date(Date.now() - i * 86400000);
        return {
          date: date.toISOString().split('T')[0],
          item: items[Math.floor(seededRandom() * items.length)],
          category: categories[Math.floor(seededRandom() * categories.length)],
          income: Math.floor(seededRandom() * 500000) + 100000,
          expense: Math.floor(seededRandom() * 200000) + 50000,
          profit: Math.floor(seededRandom() * 300000) + 50000,
          margin: Math.round(seededRandom() * 300) / 10 + 10,
          balance: Math.floor(seededRandom() * 2000000) + 500000,
          cashFlow: Math.floor(seededRandom() * 500000) - 100000,
        };
      });
      break;
    }
    case 'ds-marketing': {
      const campaigns = ['春季大促', '新品发布', '会员日', '周年庆', '暑期活动', '双十一预热', '年末清仓'];
      const channels = ['搜索广告', '信息流', '社交媒体', '内容营销', '邮件营销', 'KOL合作'];
      data = Array.from({ length: count }, (_, i) => {
        const date = endDate
          ? new Date(endDate.getTime() - i * 86400000)
          : new Date(Date.now() - i * 86400000);
        return {
          campaign: campaigns[Math.floor(seededRandom() * campaigns.length)],
          channel: channels[Math.floor(seededRandom() * channels.length)],
          date: date.toISOString().split('T')[0],
          spend: Math.floor(seededRandom() * 50000) + 5000,
          impressions: Math.floor(seededRandom() * 100000) + 10000,
          clicks: Math.floor(seededRandom() * 10000) + 1000,
          leads: Math.floor(seededRandom() * 500) + 50,
          conversions: Math.floor(seededRandom() * 100) + 10,
          cac: Math.round(seededRandom() * 2000) / 10 + 50,
          roi: Math.round(seededRandom() * 300) / 100 + 0.5,
        };
      });
      break;
    }
    default: {
      const customers = ['阿里巴巴', '腾讯科技', '字节跳动', '美团', '京东', '小米', '华为', '网易', '百度', '快手'];
      const products = ['企业版套餐', '专业版套餐', '基础版套餐', '增值服务', '定制开发'];
      const categories = ['SaaS服务', '技术服务', '咨询服务', '数据服务'];
      const regions = ['华东', '华南', '华北', '西南', '华中', '西北', '东北'];
      const statuses = ['已完成', '处理中', '待付款', '已取消'];
      const salespersons = ['张三', '李四', '王五', '赵六', '钱七', '孙八'];
      data = Array.from({ length: count }, (_, i) => {
        const date = endDate
          ? new Date(endDate.getTime() - i * 86400000)
          : new Date(Date.now() - i * 86400000);
        return {
          orderNo: `ORD${String(20260001 + i).padStart(8, '0')}`,
          orderDate: date.toISOString().split('T')[0],
          customer: customers[Math.floor(seededRandom() * customers.length)],
          product: products[Math.floor(seededRandom() * products.length)],
          category: categories[Math.floor(seededRandom() * categories.length)],
          quantity: Math.floor(seededRandom() * 100) + 1,
          unitPrice: Math.floor(seededRandom() * 5000) + 1000,
          amount: Math.floor(seededRandom() * 100000) + 5000,
          region: regions[Math.floor(seededRandom() * regions.length)],
          salesperson: salespersons[Math.floor(seededRandom() * salespersons.length)],
          status: statuses[Math.floor(seededRandom() * statuses.length)],
        };
      });
      break;
    }
  }

  if (startDate && endDate) {
    const dateField = dataSourceId === 'ds-sales' ? 'orderDate' : 'date';
    data = data.filter(row => {
      const rowDate = new Date(String(row[dateField]));
      return rowDate >= startDate && rowDate <= new Date(endDate.getTime() + 86400000);
    });
  }

  if (filters && filters.length > 0) {
    data = data.filter(row => {
      return filters.every(filter => {
        const cellValue = row[filter.field];
        if (cellValue === undefined) return true;
        switch (filter.operator) {
          case 'eq': return String(cellValue) === String(filter.value);
          case 'ne': return String(cellValue) !== String(filter.value);
          case 'gt': return Number(cellValue) > Number(filter.value);
          case 'lt': return Number(cellValue) < Number(filter.value);
          case 'contains': return String(cellValue).includes(String(filter.value));
          case 'in': return String(filter.value).split(',').some(v => String(cellValue).includes(v.trim()));
          default: return true;
        }
      });
    });
  }

  if (fields && fields.length > 0) {
    const sortFields = fields.filter(f => f.sortOrder !== 'none');
    if (sortFields.length > 0) {
      data = [...data].sort((a, b) => {
        for (const sf of sortFields) {
          const av = a[sf.fieldName];
          const bv = b[sf.fieldName];
          if (av === undefined || bv === undefined) continue;
          const aNum = Number(av);
          const bNum = Number(bv);
          let cmp: number;
          if (!isNaN(aNum) && !isNaN(bNum)) {
            cmp = aNum - bNum;
          } else {
            cmp = String(av).localeCompare(String(bv));
          }
          if (cmp !== 0) {
            return sf.sortOrder === 'desc' ? -cmp : cmp;
          }
        }
        return 0;
      });
    }
  }

  return data;
};

export const calculateSummary = (
  data: TableDataRow[],
  fields: FieldConfig[],
): Record<string, number | string> => {
  const summary: Record<string, number | string> = {};
  const numericFields = fields.filter(f => f.aggregate !== 'none' && f.visible);

  for (const field of numericFields) {
    const values = data
      .map(row => Number(row[field.fieldName]))
      .filter(v => !isNaN(v));

    if (values.length === 0) {
      summary[field.fieldName] = '-';
      continue;
    }

    switch (field.aggregate) {
      case 'sum':
        summary[field.fieldName] = values.reduce((a, b) => a + b, 0);
        break;
      case 'avg':
        summary[field.fieldName] = Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 100) / 100;
        break;
      case 'count':
        summary[field.fieldName] = values.length;
        break;
      case 'max':
        summary[field.fieldName] = Math.max(...values);
        break;
      case 'min':
        summary[field.fieldName] = Math.min(...values);
        break;
      default:
        summary[field.fieldName] = '-';
    }
  }

  return summary;
};

export const getFieldLabel = (fieldName: string, dataSourceId: string): string => {
  const ds = dataSources.find(d => d.id === dataSourceId);
  const field = ds?.fields.find(f => f.name === fieldName);
  return field?.label || fieldName;
};

export const subscriptions: Subscription[] = [
  {
    id: 'sub-1',
    reportId: 'report-1',
    reportName: '销售业绩日报',
    frequency: 'daily',
    recipients: [
      { name: '张经理', email: 'zhang.manager@company.com' },
      { name: '李总监', email: 'li.director@company.com' },
    ],
    format: 'pdf',
    enabled: true,
    nextRun: new Date(Date.now() + 86400000).toISOString(),
    createdAt: '2026-05-01',
    successCount: 15,
  },
  {
    id: 'sub-2',
    reportId: 'report-2',
    reportName: '运营数据周报',
    frequency: 'weekly',
    recipients: [
      { name: '王运营', email: 'wang.operation@company.com' },
      { name: '陈产品', email: 'chen.product@company.com' },
      { name: '刘总', email: 'liu.ceo@company.com' },
    ],
    format: 'excel',
    enabled: true,
    nextRun: new Date(Date.now() + 7 * 86400000).toISOString(),
    createdAt: '2026-05-10',
    successCount: 8,
  },
  {
    id: 'sub-3',
    reportId: 'report-3',
    reportName: '财务月度报表',
    frequency: 'monthly',
    recipients: [
      { name: '赵财务', email: 'zhao.finance@company.com' },
      { name: '孙总', email: 'sun.cfo@company.com' },
    ],
    format: 'pdf',
    enabled: false,
    nextRun: new Date(Date.now() + 30 * 86400000).toISOString(),
    createdAt: '2026-04-15',
    successCount: 3,
  },
];

export const generationLogs: GenerationLog[] = [
  {
    id: 'log-1',
    subscriptionId: 'sub-1',
    reportName: '销售业绩日报',
    generatedAt: new Date(Date.now() - 3600000).toISOString(),
    status: 'success',
    format: 'pdf',
    fileUrl: '/reports/sales-daily-20260615.pdf',
    recipients: [
      { name: '张经理', email: 'zhang.manager@company.com' },
      { name: '李总监', email: 'li.director@company.com' },
    ],
  },
  {
    id: 'log-2',
    subscriptionId: 'sub-1',
    reportName: '销售业绩日报',
    generatedAt: new Date(Date.now() - 86400000 - 3600000).toISOString(),
    status: 'success',
    format: 'pdf',
    fileUrl: '/reports/sales-daily-20260614.pdf',
    recipients: [
      { name: '张经理', email: 'zhang.manager@company.com' },
      { name: '李总监', email: 'li.director@company.com' },
    ],
  },
  {
    id: 'log-3',
    subscriptionId: 'sub-1',
    reportName: '销售业绩日报',
    generatedAt: new Date(Date.now() - 2 * 86400000 - 3600000).toISOString(),
    status: 'failed',
    format: 'pdf',
    fileUrl: '',
    recipients: [
      { name: '张经理', email: 'zhang.manager@company.com' },
      { name: '李总监', email: 'li.director@company.com' },
    ],
    errorMessage: '数据源连接超时，请检查网络连接',
  },
  {
    id: 'log-4',
    subscriptionId: 'sub-2',
    reportName: '运营数据周报',
    generatedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    status: 'success',
    format: 'excel',
    fileUrl: '/reports/operation-weekly-2026w24.xlsx',
    recipients: [
      { name: '王运营', email: 'wang.operation@company.com' },
      { name: '陈产品', email: 'chen.product@company.com' },
      { name: '刘总', email: 'liu.ceo@company.com' },
    ],
  },
  {
    id: 'log-5',
    subscriptionId: 'sub-3',
    reportName: '财务月度报表',
    generatedAt: new Date(Date.now() - 15 * 86400000).toISOString(),
    status: 'success',
    format: 'pdf',
    fileUrl: '/reports/finance-may-2026.pdf',
    recipients: [
      { name: '赵财务', email: 'zhao.finance@company.com' },
      { name: '孙总', email: 'sun.cfo@company.com' },
    ],
  },
  {
    id: 'log-6',
    subscriptionId: 'sub-2',
    reportName: '运营数据周报',
    generatedAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    status: 'success',
    format: 'excel',
    fileUrl: '/reports/operation-weekly-2026w23.xlsx',
    recipients: [
      { name: '王运营', email: 'wang.operation@company.com' },
      { name: '陈产品', email: 'chen.product@company.com' },
      { name: '刘总', email: 'liu.ceo@company.com' },
    ],
  },
];
