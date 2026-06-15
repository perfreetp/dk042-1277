import type { DataSource, ChartDataPoint, TableDataRow, GenerationLog, Subscription, FieldConfig } from '../types';

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

export const defaultFields: FieldConfig[] = [
  { id: 'f1', fieldName: 'orderNo', displayName: '订单号', aggregate: 'none', sortOrder: 'none', visible: true },
  { id: 'f2', fieldName: 'orderDate', displayName: '订单日期', aggregate: 'none', sortOrder: 'desc', visible: true },
  { id: 'f3', fieldName: 'customer', displayName: '客户名称', aggregate: 'none', sortOrder: 'none', visible: true },
  { id: 'f4', fieldName: 'product', displayName: '产品名称', aggregate: 'none', sortOrder: 'none', visible: true },
  { id: 'f5', fieldName: 'category', displayName: '产品分类', aggregate: 'none', sortOrder: 'none', visible: true },
  { id: 'f6', fieldName: 'quantity', displayName: '数量', aggregate: 'sum', sortOrder: 'none', visible: true },
  { id: 'f7', fieldName: 'amount', displayName: '金额', aggregate: 'sum', sortOrder: 'desc', visible: true },
  { id: 'f8', fieldName: 'region', displayName: '销售区域', aggregate: 'none', sortOrder: 'none', visible: true },
  { id: 'f9', fieldName: 'salesperson', displayName: '销售人员', aggregate: 'count', sortOrder: 'none', visible: false },
];

export const generateSalesChartData = (period: 'daily' | 'weekly' | 'monthly'): ChartDataPoint[] => {
  const data: ChartDataPoint[] = [];
  const labels = period === 'daily'
    ? ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
    : period === 'weekly'
    ? ['第1周', '第2周', '第3周', '第4周']
    : ['1月', '2月', '3月', '4月', '5月', '6月'];

  labels.forEach((label) => {
    const sales = Math.floor(Math.random() * 50000) + 30000;
    data.push({
      name: label,
      value: sales,
      sales,
      orders: Math.floor(Math.random() * 500) + 200,
      customers: Math.floor(Math.random() * 200) + 100,
    });
  });

  return data;
};

export const generateRegionChartData = (): ChartDataPoint[] => {
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

export const generateTableData = (count: number = 10): TableDataRow[] => {
  const customers = ['阿里巴巴', '腾讯科技', '字节跳动', '美团', '京东', '小米', '华为', '网易', '百度', '快手'];
  const products = ['企业版套餐', '专业版套餐', '基础版套餐', '增值服务', '定制开发'];
  const categories = ['SaaS服务', '技术服务', '咨询服务', '数据服务'];
  const regions = ['华东', '华南', '华北', '西南', '华中', '西北', '东北'];
  const statuses = ['已完成', '处理中', '待付款', '已取消'];
  const salespersons = ['张三', '李四', '王五', '赵六', '钱七', '孙八'];

  return Array.from({ length: count }, (_, i) => ({
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
