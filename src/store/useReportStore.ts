import { create } from 'zustand';
import type {
  Report,
  ReportTemplate,
  ReportComponent,
  Subscription,
  GenerationLog,
  DataFilter,
  FieldConfig,
  ComponentType,
  Position,
} from '../types';
import { allTemplates } from '../data/templates';
import { subscriptions as mockSubscriptions, generationLogs as mockLogs, defaultFields } from '../data/mockData';
import { createDefaultComponent, generateId } from '../utils/dragUtils';
import { getDateRange } from '../utils/dateUtils';

interface ReportStore {
  templates: ReportTemplate[];
  currentTemplate: ReportTemplate | null;
  currentReport: Report | null;
  selectedComponentId: string | null;
  subscriptions: Subscription[];
  generationLogs: GenerationLog[];
  notification: { type: 'success' | 'error' | 'info'; message: string } | null;

  setCurrentTemplate: (template: ReportTemplate | null) => void;
  createReportFromTemplate: (templateId: string) => Report;
  createBlankReport: () => Report;
  setCurrentReport: (report: Report | null) => void;
  updateReportName: (name: string) => void;
  addComponent: (type: ComponentType, position: Position) => void;
  updateComponent: (id: string, updates: Partial<ReportComponent>) => void;
  removeComponent: (id: string) => void;
  selectComponent: (id: string | null) => void;
  updateDataConfig: (config: Partial<Report['dataConfig']>) => void;
  addFilter: (filter: Omit<DataFilter, 'id'>) => void;
  removeFilter: (id: string) => void;
  updateField: (id: string, updates: Partial<FieldConfig>) => void;
  saveReport: () => void;
  saveAsTemplate: (name: string, description: string) => void;
  addSubscription: (subscription: Omit<Subscription, 'id' | 'createdAt' | 'successCount'>) => void;
  toggleSubscription: (id: string) => void;
  removeSubscription: (id: string) => void;
  triggerSubscription: (id: string) => void;
  setNotification: (notification: { type: 'success' | 'error' | 'info'; message: string } | null) => void;
}

const createInitialReport = (): Report => {
  const dateRange = getDateRange('weekly');
  return {
    id: generateId(),
    name: '未命名报表',
    components: [],
    dataConfig: {
      dataSource: 'ds-sales',
      filters: [],
      fields: [...defaultFields],
      dateRange,
    },
    status: 'draft',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};

export const useReportStore = create<ReportStore>((set, get) => ({
  templates: allTemplates,
  currentTemplate: null,
  currentReport: null,
  selectedComponentId: null,
  subscriptions: mockSubscriptions,
  generationLogs: mockLogs,
  notification: null,

  setCurrentTemplate: (template) => set({ currentTemplate: template }),

  createReportFromTemplate: (templateId) => {
    const template = get().templates.find(t => t.id === templateId);
    if (!template) {
      throw new Error('Template not found');
    }

    const dateRange = getDateRange('weekly');
    const report: Report = {
      id: generateId(),
      name: template.name,
      templateId: template.id,
      components: template.components.map(c => ({ ...c, id: generateId() })),
      dataConfig: {
        dataSource: 'ds-sales',
        filters: [],
        fields: [...defaultFields],
        dateRange,
      },
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    set({ currentReport: report, currentTemplate: template });
    return report;
  },

  createBlankReport: () => {
    const report = createInitialReport();
    set({ currentReport: report, currentTemplate: null });
    return report;
  },

  setCurrentReport: (report) => set({ currentReport: report }),

  updateReportName: (name) => set((state) => ({
    currentReport: state.currentReport
      ? { ...state.currentReport, name, updatedAt: new Date().toISOString() }
      : null,
  })),

  addComponent: (type, position) => set((state) => {
    if (!state.currentReport) return {};

    const newComponent = createDefaultComponent(type, position);
    return {
      currentReport: {
        ...state.currentReport,
        components: [...state.currentReport.components, newComponent],
        updatedAt: new Date().toISOString(),
      },
      selectedComponentId: newComponent.id,
    };
  }),

  updateComponent: (id, updates) => set((state) => {
    if (!state.currentReport) return {};

    return {
      currentReport: {
        ...state.currentReport,
        components: state.currentReport.components.map(c =>
          c.id === id ? { ...c, ...updates } : c
        ),
        updatedAt: new Date().toISOString(),
      },
    };
  }),

  removeComponent: (id) => set((state) => {
    if (!state.currentReport) return {};

    return {
      currentReport: {
        ...state.currentReport,
        components: state.currentReport.components.filter(c => c.id !== id),
        updatedAt: new Date().toISOString(),
      },
      selectedComponentId: state.selectedComponentId === id ? null : state.selectedComponentId,
    };
  }),

  selectComponent: (id) => set({ selectedComponentId: id }),

  updateDataConfig: (config) => set((state) => {
    if (!state.currentReport) return {};

    return {
      currentReport: {
        ...state.currentReport,
        dataConfig: { ...state.currentReport.dataConfig, ...config },
        updatedAt: new Date().toISOString(),
      },
    };
  }),

  addFilter: (filter) => set((state) => {
    if (!state.currentReport) return {};

    const newFilter: DataFilter = { ...filter, id: generateId() };
    return {
      currentReport: {
        ...state.currentReport,
        dataConfig: {
          ...state.currentReport.dataConfig,
          filters: [...state.currentReport.dataConfig.filters, newFilter],
        },
        updatedAt: new Date().toISOString(),
      },
    };
  }),

  removeFilter: (id) => set((state) => {
    if (!state.currentReport) return {};

    return {
      currentReport: {
        ...state.currentReport,
        dataConfig: {
          ...state.currentReport.dataConfig,
          filters: state.currentReport.dataConfig.filters.filter(f => f.id !== id),
        },
        updatedAt: new Date().toISOString(),
      },
    };
  }),

  updateField: (id, updates) => set((state) => {
    if (!state.currentReport) return {};

    return {
      currentReport: {
        ...state.currentReport,
        dataConfig: {
          ...state.currentReport.dataConfig,
          fields: state.currentReport.dataConfig.fields.map(f =>
            f.id === id ? { ...f, ...updates } : f
          ),
        },
        updatedAt: new Date().toISOString(),
      },
    };
  }),

  saveReport: () => {
    const { currentReport } = get();
    if (!currentReport) return;

    try {
      localStorage.setItem(`report_${currentReport.id}`, JSON.stringify(currentReport));
      set({
        notification: { type: 'success', message: '报表保存成功' },
      });
    } catch (error) {
      set({
        notification: { type: 'error', message: '保存失败，请重试' },
      });
    }

    setTimeout(() => set({ notification: null }), 3000);
  },

  saveAsTemplate: (name, description) => {
    const { currentReport } = get();
    if (!currentReport) return;

    const newTemplate: ReportTemplate = {
      id: generateId(),
      name,
      description,
      category: 'sales',
      thumbnail: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=data%20report%20template%20preview%20dark%20theme&image_size=square',
      components: currentReport.components,
      isSystem: false,
      useCount: 0,
      createdAt: new Date().toISOString(),
    };

    set((state) => ({
      templates: [...state.templates, newTemplate],
      notification: { type: 'success', message: '模板保存成功' },
    }));

    setTimeout(() => set({ notification: null }), 3000);
  },

  addSubscription: (subscription) => set((state) => {
    const newSub: Subscription = {
      ...subscription,
      id: generateId(),
      createdAt: new Date().toISOString(),
      successCount: 0,
    };
    return {
      subscriptions: [...state.subscriptions, newSub],
      notification: { type: 'success', message: '订阅创建成功' },
    };
  }),

  toggleSubscription: (id) => set((state) => ({
    subscriptions: state.subscriptions.map(s =>
      s.id === id ? { ...s, enabled: !s.enabled } : s
    ),
  })),

  removeSubscription: (id) => set((state) => ({
    subscriptions: state.subscriptions.filter(s => s.id !== id),
    notification: { type: 'success', message: '订阅已删除' },
  })),

  triggerSubscription: (id) => set((state) => {
    const subscription = state.subscriptions.find(s => s.id === id);
    if (!subscription) return {};

    const newLog: GenerationLog = {
      id: generateId(),
      subscriptionId: subscription.id,
      reportName: subscription.reportName,
      generatedAt: new Date().toISOString(),
      status: 'success',
      format: subscription.format,
      fileUrl: '',
      recipients: subscription.recipients,
    };

    return {
      subscriptions: state.subscriptions.map(s =>
        s.id === id ? { ...s, successCount: s.successCount + 1 } : s
      ),
      generationLogs: [newLog, ...state.generationLogs],
      notification: { type: 'success', message: '报表生成成功' },
    };
  }),

  setNotification: (notification) => set({ notification }),
}));
