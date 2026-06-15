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
import { subscriptions as mockSubscriptions, generationLogs as mockLogs, defaultFields, getFieldsForDataSource } from '../data/mockData';
import { createDefaultComponent, generateId } from '../utils/dragUtils';
import { getDateRange } from '../utils/dateUtils';

const STORAGE_KEYS = {
  TEMPLATES: 'report_gen_team_templates',
  REPORT: 'report_gen_current_report',
  SUBSCRIPTIONS: 'report_gen_subscriptions',
};

const loadTeamTemplates = (): ReportTemplate[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.TEMPLATES);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveTeamTemplates = (templates: ReportTemplate[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(templates));
  } catch { }
};

const loadCurrentReport = (): Report | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.REPORT);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

const saveCurrentReport = (report: Report | null) => {
  try {
    if (report) {
      localStorage.setItem(STORAGE_KEYS.REPORT, JSON.stringify(report));
    } else {
      localStorage.removeItem(STORAGE_KEYS.REPORT);
    }
  } catch { }
};

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
  switchDataSource: (dataSourceId: string) => void;
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

const systemTemplates = allTemplates.filter(t => t.isSystem);
const staticTeamTemplates = allTemplates.filter(t => !t.isSystem);
const savedTeamTemplates = loadTeamTemplates();

const existingIds = new Set(savedTeamTemplates.map(t => t.id));
const initialTeamTemplates = [
  ...savedTeamTemplates,
  ...staticTeamTemplates.filter(t => !existingIds.has(t.id)),
];

export const useReportStore = create<ReportStore>((set, get) => ({
  templates: [...systemTemplates, ...initialTeamTemplates],
  currentTemplate: null,
  currentReport: loadCurrentReport(),
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

    const dataSource = template.dataConfig?.dataSource || 'ds-sales';
    const fields = template.dataConfig?.fields
      ? template.dataConfig.fields.map(f => ({ ...f, id: generateId() }))
      : getFieldsForDataSource(dataSource);
    const filters = template.dataConfig?.filters
      ? template.dataConfig.filters.map(f => ({ ...f, id: generateId() }))
      : [];
    const dateRange = template.dataConfig?.dateRange || getDateRange('weekly');

    const report: Report = {
      id: generateId(),
      name: template.name,
      templateId: template.id,
      components: template.components.map(c => ({
        ...c,
        id: generateId(),
        config: { ...c.config },
        style: { ...c.style },
        position: { ...c.position },
      })),
      dataConfig: {
        dataSource,
        filters,
        fields,
        dateRange,
      },
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveCurrentReport(report);
    set({ currentReport: report, currentTemplate: template });
    return report;
  },

  createBlankReport: () => {
    const dateRange = getDateRange('weekly');
    const report: Report = {
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

    saveCurrentReport(report);
    set({ currentReport: report, currentTemplate: null });
    return report;
  },

  setCurrentReport: (report) => {
    saveCurrentReport(report);
    set({ currentReport: report });
  },

  updateReportName: (name) => set((state) => {
    if (!state.currentReport) return {};
    const updated = { ...state.currentReport, name, updatedAt: new Date().toISOString() };
    saveCurrentReport(updated);
    return { currentReport: updated };
  }),

  addComponent: (type, position) => set((state) => {
    if (!state.currentReport) return {};

    const newComponent = createDefaultComponent(type, position);
    const updated = {
      ...state.currentReport,
      components: [...state.currentReport.components, newComponent],
      updatedAt: new Date().toISOString(),
    };
    saveCurrentReport(updated);
    return {
      currentReport: updated,
      selectedComponentId: newComponent.id,
    };
  }),

  updateComponent: (id, updates) => set((state) => {
    if (!state.currentReport) return {};

    const updated = {
      ...state.currentReport,
      components: state.currentReport.components.map(c =>
        c.id === id ? { ...c, ...updates } : c
      ),
      updatedAt: new Date().toISOString(),
    };
    saveCurrentReport(updated);
    return { currentReport: updated };
  }),

  removeComponent: (id) => set((state) => {
    if (!state.currentReport) return {};

    const updated = {
      ...state.currentReport,
      components: state.currentReport.components.filter(c => c.id !== id),
      updatedAt: new Date().toISOString(),
    };
    saveCurrentReport(updated);
    return {
      currentReport: updated,
      selectedComponentId: state.selectedComponentId === id ? null : state.selectedComponentId,
    };
  }),

  selectComponent: (id) => set({ selectedComponentId: id }),

  updateDataConfig: (config) => set((state) => {
    if (!state.currentReport) return {};

    const updated = {
      ...state.currentReport,
      dataConfig: { ...state.currentReport.dataConfig, ...config },
      updatedAt: new Date().toISOString(),
    };
    saveCurrentReport(updated);
    return { currentReport: updated };
  }),

  switchDataSource: (dataSourceId) => set((state) => {
    if (!state.currentReport) return {};

    const newFields = getFieldsForDataSource(dataSourceId);
    const updated = {
      ...state.currentReport,
      dataConfig: {
        ...state.currentReport.dataConfig,
        dataSource: dataSourceId,
        filters: [],
        fields: newFields,
      },
      updatedAt: new Date().toISOString(),
    };
    saveCurrentReport(updated);
    return { currentReport: updated };
  }),

  addFilter: (filter) => set((state) => {
    if (!state.currentReport) return {};

    const newFilter: DataFilter = { ...filter, id: generateId() };
    const updated = {
      ...state.currentReport,
      dataConfig: {
        ...state.currentReport.dataConfig,
        filters: [...state.currentReport.dataConfig.filters, newFilter],
      },
      updatedAt: new Date().toISOString(),
    };
    saveCurrentReport(updated);
    return { currentReport: updated };
  }),

  removeFilter: (id) => set((state) => {
    if (!state.currentReport) return {};

    const updated = {
      ...state.currentReport,
      dataConfig: {
        ...state.currentReport.dataConfig,
        filters: state.currentReport.dataConfig.filters.filter(f => f.id !== id),
      },
      updatedAt: new Date().toISOString(),
    };
    saveCurrentReport(updated);
    return { currentReport: updated };
  }),

  updateField: (id, updates) => set((state) => {
    if (!state.currentReport) return {};

    const updated = {
      ...state.currentReport,
      dataConfig: {
        ...state.currentReport.dataConfig,
        fields: state.currentReport.dataConfig.fields.map(f =>
          f.id === id ? { ...f, ...updates } : f
        ),
      },
      updatedAt: new Date().toISOString(),
    };
    saveCurrentReport(updated);
    return { currentReport: updated };
  }),

  saveReport: () => {
    const { currentReport } = get();
    if (!currentReport) return;

    saveCurrentReport(currentReport);
    set({ notification: { type: 'success', message: '报表保存成功' } });
    setTimeout(() => set({ notification: null }), 3000);
  },

  saveAsTemplate: (name, description) => {
    const { currentReport, templates } = get();
    if (!currentReport) return;

    const newTemplate: ReportTemplate = {
      id: generateId(),
      name,
      description,
      category: 'sales',
      thumbnail: '',
      components: currentReport.components.map(c => ({
        ...c,
        id: generateId(),
        config: { ...c.config },
        style: { ...c.style },
        position: { ...c.position },
      })),
      dataConfig: { ...currentReport.dataConfig },
      isSystem: false,
      useCount: 0,
      createdAt: new Date().toISOString(),
    };

    const teamTemplates = templates.filter(t => !t.isSystem);
    saveTeamTemplates([...teamTemplates, newTemplate]);

    set((state) => ({
      templates: [...state.templates, newTemplate],
      notification: { type: 'success', message: '模板保存成功，刷新后仍可查看' },
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
