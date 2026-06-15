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

const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

export const generateChartData = (
  dataSourceId: string,
  period: 'daily' | 'weekly' | 'monthly'
): ChartDataPoint[] => {
  const labels = period === 'daily'
    ? ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
    : period === 'weekly'
    ? ['第1周', '第2周', '第3周', '第4周']
    : ['1月', '2月', '3月', '4月', '5月', '6月'];

  const seed = dataSourceId.charCodeAt(3) + (period === 'daily' ? 1 : period === 'weekly' ? 2 : 3);

  switch (dataSourceId) {
    case 'ds-sales': {
      return labels.map((label, i) => {
        const sales = Math.floor(seededRandom(seed + i * 7) * 50000) + 30000;
        return {
          name: label,
          value: sales,
          sales,
          orders: Math.floor(seededRandom(seed + i * 13) * 500) + 200,
          customers: Math.floor(seededRandom(seed + i * 17) * 200) + 100,
        };
      });
    }
    case 'ds-users': {
      return labels.map((label, i) => ({
        name: label,
        value: Math.floor(seededRandom(seed + i * 7) * 8000) + 5000,
        dau: Math.floor(seededRandom(seed + i * 7) * 8000) + 5000,
        wau: Math.floor(seededRandom(seed + i * 11) * 20000) + 15000,
        mau: Math.floor(seededRandom(seed + i * 13) * 50000) + 40000,
        newUsers: Math.floor(seededRandom(seed + i * 17) * 1500) + 500,
      }));
    }
    case 'ds-finance': {
      return labels.map((label, i) => ({
        name: label,
        value: Math.floor(seededRandom(seed + i * 7) * 800000) + 500000,
        income: Math.floor(seededRandom(seed + i * 7) * 800000) + 500000,
        expense: Math.floor(seededRandom(seed + i * 11) * 400000) + 200000,
        profit: Math.floor(seededRandom(seed + i * 13) * 400000) + 100000,
      }));
    }
    case 'ds-marketing': {
      return labels.map((label, i) => ({
        name: label,
        value: Math.floor(seededRandom(seed + i * 7) * 300) + 100,
        spend: Math.floor(seededRandom(seed + i * 7) * 50000) + 20000,
        conversions: Math.floor(seededRandom(seed + i * 11) * 300) + 100,
        roi: Math.round((seededRandom(seed + i * 13) * 3 + 0.5) * 100) / 100,
      }));
    }
    default:
      return labels.map((label, i) => ({
        name: label,
        value: Math.floor(seededRandom(seed + i * 7) * 1000) + 100,
      }));
  }
};

export const generateRegionChartData = (dataSourceId?: string): ChartDataPoint[] => {
  if (dataSourceId === 'ds-users') {
    return [
      { name: '首页', value: 45600, usage: 45600 },
      { name: '搜索', value: 32100, usage: 32100 },
      { name: '推荐', value: 28700, usage: 28700 },
      { name: '社区', value: 19500, usage: 19500 },
      { name: '商城', value: 15800, usage: 15800 },
      { name: '消息', value: 12300, usage: 12300 },
      { name: '设置', value: 8900, usage: 8900 },
    ];
  }
  if (dataSourceId === 'ds-finance') {
    return [
      { name: 'SaaS订阅', value: 568000, income: 568000 },
      { name: '技术服务', value: 324500, income: 324500 },
      { name: '咨询服务', value: 198200, income: 198200 },
      { name: '数据服务', value: 156300, income: 156300 },
      { name: '培训收入', value: 87400, income: 87400 },
      { name: '许可费', value: 65200, income: 65200 },
    ];
  }
  if (dataSourceId === 'ds-marketing') {
    return [
      { name: '搜索广告', value: 285, roi: 2.8 },
      { name: '信息流', value: 198, roi: 1.9 },
      { name: '社交媒体', value: 156, roi: 2.3 },
      { name: '内容营销', value: 134, roi: 3.5 },
      { name: '邮件营销', value: 89, roi: 4.2 },
      { name: 'KOL合作', value: 67, roi: 1.6 },
    ];
  }
  return [
    { name: '华东', value: 156800, sales: 156800 },
    { name: '华南', value: 124500, sales: 124500 },
    { name: '华北', value: 98200, sales: 98200 },
    { name: '西南', value: 76300, sales: 76300 },
    { name: '华中', value: 65400, sales: 65400 },
    { name: '西北', value: 45600, sales: 45600 },
    { name: '东北', value: 38900, sales: 38900 },
  ];
};

export const generateTableData = (
  dataSourceId: string = 'ds-sales',
  count: number = 20,
  filters?: Report['dataConfig']['filters'],
  fields?: FieldConfig[],
): TableDataRow[] => {
  let data: TableDataRow[];

  switch (dataSourceId) {
    case 'ds-users': {
      const features = ['首页', '搜索', '推荐', '社区', '商城', '消息', '设置'];
      data = Array.from({ length: count }, (_, i) => ({
        date: new Date(Date.now() - i * 86400000).toISOString().split('T')[0],
        dau: Math.floor(Math.random() * 8000) + 5000,
        wau: Math.floor(Math.random() * 20000) + 15000,
        mau: Math.floor(Math.random() * 50000) + 40000,
        newUsers: Math.floor(Math.random() * 1500) + 500,
        retention7: Math.round((Math.random() * 30 + 30) * 10) / 10,
        retention30: Math.round((Math.random() * 20 + 15) * 10) / 10,
        avgSession: Math.round((Math.random() * 15 + 5) * 10) / 10,
        feature: features[Math.floor(Math.random() * features.length)],
        usageCount: Math.floor(Math.random() * 5000) + 1000,
      }));
      break;
    }
    case 'ds-finance': {
      const items = ['SaaS订阅收入', '技术服务费', '咨询服务费', '数据服务费', '人力成本', '办公费用', '营销支出', '研发投入', '培训收入'];
      const categories = ['主营收入', '其他收入', '运营成本', '人力成本', '营销费用', '研发费用'];
      data = Array.from({ length: count }, (_, i) => ({
        date: new Date(Date.now() - i * 86400000).toISOString().split('T')[0],
        item: items[Math.floor(Math.random() * items.length)],
        category: categories[Math.floor(Math.random() * categories.length)],
        income: Math.floor(Math.random() * 500000) + 100000,
        expense: Math.floor(Math.random() * 200000) + 50000,
        profit: Math.floor(Math.random() * 300000) + 50000,
        margin: Math.round((Math.random() * 30 + 10) * 10) / 10,
        balance: Math.floor(Math.random() * 2000000) + 500000,
        cashFlow: Math.floor(Math.random() * 500000) - 100000,
      }));
      break;
    }
    case 'ds-marketing': {
      const campaigns = ['春季大促', '新品发布', '会员日', '周年庆', '暑期活动', '双十一预热', '年末清仓'];
      const channels = ['搜索广告', '信息流', '社交媒体', '内容营销', '邮件营销', 'KOL合作'];
      data = Array.from({ length: count }, (_, i) => ({
        campaign: campaigns[Math.floor(Math.random() * campaigns.length)],
        channel: channels[Math.floor(Math.random() * channels.length)],
        date: new Date(Date.now() - i * 86400000).toISOString().split('T')[0],
        spend: Math.floor(Math.random() * 50000) + 5000,
        impressions: Math.floor(Math.random() * 100000) + 10000,
        clicks: Math.floor(Math.random() * 10000) + 1000,
        leads: Math.floor(Math.random() * 500) + 50,
        conversions: Math.floor(Math.random() * 100) + 10,
        cac: Math.round((Math.random() * 200 + 50) * 10) / 10,
        roi: Math.round((Math.random() * 3 + 0.5) * 100) / 100,
      }));
      break;
    }
    default: {
      const customers = ['阿里巴巴', '腾讯科技', '字节跳动', '美团', '京东', '小米', '华为', '网易', '百度', '快手'];
      const products = ['企业版套餐', '专业版套餐', '基础版套餐', '增值服务', '定制开发'];
      const categories = ['SaaS服务', '技术服务', '咨询服务', '数据服务'];
      const regions = ['华东', '华南', '华北', '西南', '华中', '西北', '东北'];
      const statuses = ['已完成', '处理中', '待付款', '已取消'];
      const salespersons = ['张三', '李四', '王五', '赵六', '钱七', '孙八'];
      data = Array.from({ length: count }, (_, i) => ({
        orderNo: `ORD${String(20260001 + i).padStart(8, '0')}`,
        orderDate: new Date(Date.now() - i * 86400000).toISOString().split('T')[0],
        customer: customers[Math.floor(Math.random() * customers.length)],
        product: products[Math.floor(Math.random() * products.length)],
        category: categories[Math.floor(Math.random() * categories.length)],
        quantity: Math.floor(Math.random() * 100) + 1,
        unitPrice: Math.floor(Math.random() * 5000) + 1000,
        amount: Math.floor(Math.random() * 100000) + 5000,
        region: regions[Math.floor(Math.random() * regions.length)],
        salesperson: salespersons[Math.floor(Math.random() * salespersons.length)],
        status: statuses[Math.floor(Math.random() * statuses.length)],
      }));
      break;
    }
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

  return data;
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
