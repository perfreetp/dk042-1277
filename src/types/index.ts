export type ComponentType = 'table' | 'lineChart' | 'barChart' | 'text';

export type TemplateCategory = 'sales' | 'operation' | 'finance' | 'marketing';

export type ReportStatus = 'draft' | 'published';

export type FilterOperator = 'eq' | 'ne' | 'gt' | 'lt' | 'between' | 'in' | 'contains';

export type AggregateType = 'sum' | 'avg' | 'count' | 'max' | 'min' | 'none';

export type SortOrder = 'asc' | 'desc' | 'none';

export type SubscriptionFrequency = 'daily' | 'weekly' | 'monthly';

export type SubscriptionFormat = 'pdf' | 'excel' | 'png';

export type GenerationStatus = 'success' | 'failed' | 'pending';

export interface Position {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ReportComponent {
  id: string;
  type: ComponentType;
  position: Position;
  config: Record<string, any>;
  style: Record<string, any>;
}

export interface DataFilter {
  id: string;
  field: string;
  operator: FilterOperator;
  value: any;
}

export interface FieldConfig {
  id: string;
  fieldName: string;
  displayName: string;
  aggregate: AggregateType;
  sortOrder: SortOrder;
  visible: boolean;
}

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  thumbnail: string;
  components: ReportComponent[];
  dataConfig?: Report['dataConfig'];
  isSystem: boolean;
  useCount: number;
  createdAt: string;
}

export interface Report {
  id: string;
  name: string;
  templateId?: string;
  components: ReportComponent[];
  dataConfig: {
    dataSource: string;
    filters: DataFilter[];
    fields: FieldConfig[];
    dateRange: { start: string; end: string };
  };
  status: ReportStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Recipient {
  name: string;
  email: string;
}

export interface Subscription {
  id: string;
  reportId: string;
  reportName: string;
  frequency: SubscriptionFrequency;
  recipients: Recipient[];
  format: SubscriptionFormat;
  enabled: boolean;
  nextRun: string;
  createdAt: string;
  successCount: number;
}

export interface GenerationLog {
  id: string;
  subscriptionId: string;
  reportName: string;
  generatedAt: string;
  status: GenerationStatus;
  format: SubscriptionFormat;
  fileUrl: string;
  recipients: Recipient[];
  errorMessage?: string;
}

export interface DataSource {
  id: string;
  name: string;
  description: string;
  fields: {
    name: string;
    type: 'string' | 'number' | 'date' | 'boolean';
    label: string;
  }[];
}

export interface ChartDataPoint {
  name: string;
  value: number;
  [key: string]: any;
}

export interface TableDataRow {
  [key: string]: any;
}
