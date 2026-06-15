import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table2,
  TrendingUp,
  BarChart3,
  Type,
  Trash2,
  Save,
  ArrowRight,
  Edit3,
  Move,
} from 'lucide-react';
import { useReportStore } from '../store/useReportStore';
import { ReportTable } from '../components/report/ReportTable';
import { LineChart } from '../components/report/LineChart';
import { BarChart } from '../components/report/BarChart';
import { TextBlock } from '../components/report/TextBlock';
import { getComponentTypeLabel } from '../utils/dragUtils';
import type { ComponentType, ReportComponent } from '../types';

const componentTypes: { type: ComponentType; label: string; icon: any; description: string }[] = [
  { type: 'table', label: '数据表格', icon: Table2, description: '展示明细数据' },
  { type: 'lineChart', label: '折线图', icon: TrendingUp, description: '趋势分析图表' },
  { type: 'barChart', label: '柱状图', icon: BarChart3, description: '对比分析图表' },
  { type: 'text', label: '说明文字', icon: Type, description: '添加文字说明' },
];

export function ReportEditor() {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLDivElement>(null);
  const {
    currentReport,
    selectedComponentId,
    addComponent,
    updateComponent,
    removeComponent,
    selectComponent,
    updateReportName,
    saveReport,
  } = useReportStore();

  const [draggedType, setDraggedType] = useState<ComponentType | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const [isEditingName, setIsEditingName] = useState(false);
  const [editingComponentId, setEditingComponentId] = useState<string | null>(null);

  if (!currentReport) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] animate-fade-in">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-dark-800 flex items-center justify-center mx-auto mb-6">
            <Edit3 className="w-10 h-10 text-dark-500" />
          </div>
          <h2 className="text-2xl font-semibold text-white mb-2">暂无报表</h2>
          <p className="text-dark-400 mb-6">请先从模板库选择模板或创建空白报表</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2.5 bg-primary-600 hover:bg-primary-500 text-white rounded-lg font-medium transition-colors"
          >
            前往模板库
          </button>
        </div>
      </div>
    );
  }

  const handleDragStart = (type: ComponentType) => {
    setDraggedType(type);
    setIsDragging(true);
  };

  const handleDragEnd = () => {
    setDraggedType(null);
    setIsDragging(false);
  };

  const handleCanvasDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    setDragPosition({
      x: e.clientX - rect.left - 150,
      y: e.clientY - rect.top - 50,
    });
  };

  const handleCanvasDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedType || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - 150;
    const y = e.clientY - rect.top - 50;

    addComponent(draggedType, {
      x: Math.max(0, x),
      y: Math.max(0, y),
      width: 400,
      height: 300,
    });

    handleDragEnd();
  };

  const handleComponentDragStart = (e: React.DragEvent, component: ReportComponent) => {
    e.stopPropagation();
    setEditingComponentId(component.id);
    selectComponent(component.id);
  };

  const handleComponentDrag = (e: React.DragEvent, component: ReportComponent) => {
    if (!canvasRef.current || !isDragging) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - 150;
    const y = e.clientY - rect.top - 50;

    updateComponent(component.id, {
      position: {
        ...component.position,
        x: Math.max(0, x),
        y: Math.max(0, y),
      },
    });
  };

  const renderComponent = (component: ReportComponent) => {
    const isSelected = selectedComponentId === component.id;
    const commonProps = {
      component,
      selected: isSelected,
      onSelect: () => selectComponent(component.id),
    };

    switch (component.type) {
      case 'table':
        return <ReportTable {...commonProps} />;
      case 'lineChart':
        return <LineChart {...commonProps} />;
      case 'barChart':
        return <BarChart {...commonProps} />;
      case 'text':
        return <TextBlock {...commonProps} />;
      default:
        return null;
    }
  };

  const selectedComponent = currentReport.components.find(c => c.id === selectedComponentId);

  return (
    <div className="flex h-[calc(100vh-10rem)] animate-fade-in">
      <div className="w-64 flex-shrink-0 bg-dark-800 rounded-xl border border-dark-700 p-4 mr-6">
        <h3 className="font-semibold text-white mb-4">组件库</h3>
        <div className="space-y-3">
          {componentTypes.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.type}
                draggable
                onDragStart={() => handleDragStart(item.type)}
                onDragEnd={handleDragEnd}
                className="group relative p-4 bg-dark-700/50 rounded-lg cursor-grab active:cursor-grabbing hover:bg-dark-700 transition-all duration-200 border border-transparent hover:border-primary-500/30"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-primary-400" />
                  </div>
                  <div>
                    <h4 className="font-medium text-white text-sm">{item.label}</h4>
                    <p className="text-xs text-dark-400 mt-0.5">{item.description}</p>
                  </div>
                </div>
                <Move className="absolute top-3 right-3 w-4 h-4 text-dark-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            );
          })}
        </div>

        <div className="mt-6 pt-6 border-t border-dark-700">
          <button
            onClick={saveReport}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-500 text-white rounded-lg font-medium transition-colors mb-3"
          >
            <Save className="w-4 h-4" />
            保存报表
          </button>
          <button
            onClick={() => navigate('/data')}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-dark-700 hover:bg-dark-600 text-white rounded-lg font-medium transition-colors"
          >
            下一步：配置数据
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {isEditingName ? (
              <input
                type="text"
                value={currentReport.name}
                onChange={(e) => updateReportName(e.target.value)}
                onBlur={() => setIsEditingName(false)}
                onKeyDown={(e) => e.key === 'Enter' && setIsEditingName(false)}
                autoFocus
                className="text-2xl font-bold text-white bg-transparent border-b-2 border-primary-500 outline-none px-1"
              />
            ) : (
              <h1
                onClick={() => setIsEditingName(true)}
                className="text-2xl font-bold text-white cursor-pointer hover:text-primary-400 transition-colors"
              >
                {currentReport.name}
              </h1>
            )}
            <span className="px-2 py-1 bg-dark-700/50 text-dark-400 rounded text-xs">
              {currentReport.components.length} 个组件
            </span>
          </div>
        </div>

        <div
          ref={canvasRef}
          onDragOver={handleCanvasDragOver}
          onDrop={handleCanvasDrop}
          onClick={() => selectComponent(null)}
          className={`flex-1 relative rounded-xl border-2 border-dashed overflow-auto grid-bg transition-colors ${
            isDragging ? 'border-primary-500 bg-primary-500/5' : 'border-dark-600'
          }`}
          style={{ minHeight: '600px' }}
        >
          {isDragging && draggedType && (
            <div
              className="absolute pointer-events-none opacity-50"
              style={{
                left: dragPosition.x,
                top: dragPosition.y,
                width: 400,
                height: 300,
              }}
            >
              <div className="w-full h-full bg-primary-500/20 border-2 border-dashed border-primary-500 rounded-lg flex items-center justify-center">
                <span className="text-primary-400 text-sm">
                  放置 {getComponentTypeLabel(draggedType)}
                </span>
              </div>
            </div>
          )}

          {currentReport.components.length === 0 && !isDragging && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-dark-800 flex items-center justify-center mx-auto mb-4">
                  <Move className="w-10 h-10 text-dark-500" />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">拖拽组件到此处</h3>
                <p className="text-dark-400 text-sm">从左侧组件库拖拽组件开始设计报表</p>
              </div>
            </div>
          )}

          {currentReport.components.map((component) => (
            <div
              key={component.id}
              draggable
              onDragStart={(e) => handleComponentDragStart(e, component)}
              onDrag={(e) => handleComponentDrag(e, component)}
              className="absolute animate-fade-in"
              style={{
                left: component.position.x,
                top: component.position.y,
                width: component.position.width,
                height: component.position.height,
              }}
            >
              {renderComponent(component)}
            </div>
          ))}
        </div>
      </div>

      <div className="w-72 flex-shrink-0 bg-dark-800 rounded-xl border border-dark-700 p-4 ml-6">
        <h3 className="font-semibold text-white mb-4">属性配置</h3>

        {selectedComponent ? (
          <div className="space-y-4">
            <div className="p-4 bg-dark-700/30 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-dark-300">组件类型</span>
                <span className="text-sm text-primary-400">
                  {getComponentTypeLabel(selectedComponent.type)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-dark-300">位置</span>
                <span className="text-sm text-dark-400">
                  {selectedComponent.position.x}, {selectedComponent.position.y}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm text-dark-300 mb-2">组件标题</label>
              <input
                type="text"
                value={selectedComponent.config.title || ''}
                onChange={(e) =>
                  updateComponent(selectedComponent.id, {
                    config: { ...selectedComponent.config, title: e.target.value }
                  })
                }
                className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-sm text-white focus:outline-none focus:border-primary-500"
                placeholder="输入组件标题"
              />
            </div>

            {selectedComponent.type === 'text' && (
              <>
                <div>
                  <label className="block text-sm text-dark-300 mb-2">字体大小</label>
                  <select
                    value={selectedComponent.config.fontSize || '16px'}
                    onChange={(e) =>
                      updateComponent(selectedComponent.id, {
                        config: { ...selectedComponent.config, fontSize: e.target.value }
                      })
                    }
                    className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-sm text-white focus:outline-none focus:border-primary-500"
                  >
                    <option value="12px">12px</option>
                    <option value="14px">14px</option>
                    <option value="16px">16px</option>
                    <option value="18px">18px</option>
                    <option value="20px">20px</option>
                    <option value="24px">24px</option>
                    <option value="28px">28px</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-dark-300 mb-2">字体粗细</label>
                  <select
                    value={selectedComponent.config.fontWeight || 'normal'}
                    onChange={(e) =>
                      updateComponent(selectedComponent.id, {
                        config: { ...selectedComponent.config, fontWeight: e.target.value }
                      })
                    }
                    className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-sm text-white focus:outline-none focus:border-primary-500"
                  >
                    <option value="normal">常规</option>
                    <option value="medium">中等</option>
                    <option value="semibold">半粗</option>
                    <option value="bold">粗体</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-dark-300 mb-2">对齐方式</label>
                  <select
                    value={selectedComponent.config.textAlign || 'left'}
                    onChange={(e) =>
                      updateComponent(selectedComponent.id, {
                        config: { ...selectedComponent.config, textAlign: e.target.value }
                      })
                    }
                    className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-sm text-white focus:outline-none focus:border-primary-500"
                  >
                    <option value="left">左对齐</option>
                    <option value="center">居中</option>
                    <option value="right">右对齐</option>
                  </select>
                </div>
              </>
            )}

            {(selectedComponent.type === 'lineChart' || selectedComponent.type === 'barChart') && (
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedComponent.config.legend || false}
                    onChange={(e) =>
                      updateComponent(selectedComponent.id, {
                        config: { ...selectedComponent.config, legend: e.target.checked }
                      })
                    }
                    className="w-4 h-4 rounded bg-dark-700 border-dark-600 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-dark-300">显示图例</span>
                </label>
              </div>
            )}

            {selectedComponent.type === 'table' && (
              <div>
                <label className="flex items-center gap-2 mb-3">
                  <input
                    type="checkbox"
                    checked={selectedComponent.config.showPagination !== false}
                    onChange={(e) =>
                      updateComponent(selectedComponent.id, {
                        config: { ...selectedComponent.config, showPagination: e.target.checked }
                      })
                    }
                    className="w-4 h-4 rounded bg-dark-700 border-dark-600 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-dark-300">显示分页</span>
                </label>
                <div>
                  <label className="block text-sm text-dark-300 mb-2">每页条数</label>
                  <input
                    type="number"
                    value={selectedComponent.config.pageSize || 10}
                    onChange={(e) =>
                      updateComponent(selectedComponent.id, {
                        config: { ...selectedComponent.config, pageSize: parseInt(e.target.value) }
                      })
                    }
                    className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-sm text-white focus:outline-none focus:border-primary-500"
                    min="5"
                    max="50"
                  />
                </div>
              </div>
            )}

            <div className="pt-4 mt-4 border-t border-dark-700">
              <button
                onClick={() => removeComponent(selectedComponent.id)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg font-medium transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                删除组件
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-dark-700/50 flex items-center justify-center mx-auto mb-3">
              <Edit3 className="w-8 h-8 text-dark-500" />
            </div>
            <p className="text-dark-400 text-sm">选择一个组件来编辑属性</p>
          </div>
        )}
      </div>
    </div>
  );
}
