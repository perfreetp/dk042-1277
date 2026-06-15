import type { ComponentType, ReportComponent, Position } from '../types';

export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 11);
};

export const getComponentTypeLabel = (type: ComponentType): string => {
  const labels: Record<ComponentType, string> = {
    table: '数据表格',
    lineChart: '折线图',
    barChart: '柱状图',
    text: '说明文字',
  };
  return labels[type];
};

export const createDefaultComponent = (type: ComponentType, position: Position): ReportComponent => {
  const baseConfig: Record<ComponentType, Record<string, any>> = {
    table: {
      title: '数据表格',
      columns: [],
      pageSize: 10,
      showHeader: true,
      showPagination: true,
    },
    lineChart: {
      title: '折线图',
      xAxisKey: 'name',
      yAxisKeys: ['value'],
      legend: true,
      smooth: true,
    },
    barChart: {
      title: '柱状图',
      xAxisKey: 'name',
      yAxisKey: 'value',
      legend: false,
    },
    text: {
      content: '请输入说明文字',
      fontSize: '16px',
      fontWeight: 'normal',
      textAlign: 'left',
    },
  };

  return {
    id: generateId(),
    type,
    position,
    config: baseConfig[type],
    style: {
      backgroundColor: '#1e293b',
      color: '#f1f5f9',
    },
  };
};

export const snapToGrid = (value: number, gridSize: number = 20): number => {
  return Math.round(value / gridSize) * gridSize;
};

export const snapPosition = (position: Position, gridSize: number = 20): Position => {
  return {
    x: snapToGrid(position.x, gridSize),
    y: snapToGrid(position.y, gridSize),
    width: Math.max(snapToGrid(position.width, gridSize), 100),
    height: Math.max(snapToGrid(position.height, gridSize), 60),
  };
};

export const checkOverlap = (comp1: ReportComponent, comp2: ReportComponent): boolean => {
  const p1 = comp1.position;
  const p2 = comp2.position;

  return !(
    p1.x + p1.width <= p2.x ||
    p2.x + p2.width <= p1.x ||
    p1.y + p1.height <= p2.y ||
    p2.y + p2.height <= p1.y
  );
};
