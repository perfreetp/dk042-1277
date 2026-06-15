import { useState } from 'react';
import { Settings, Type } from 'lucide-react';
import type { ReportComponent } from '../../types';

interface TextBlockProps {
  component: ReportComponent;
  selected?: boolean;
  onSelect?: () => void;
  editable?: boolean;
}

export function TextBlock({ component, selected, onSelect, editable = true }: TextBlockProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(component.config.content || '请输入说明文字');

  const handleBlur = () => {
    setIsEditing(false);
  };

  return (
    <div
      onClick={onSelect}
      className={`w-full h-full rounded-lg overflow-hidden transition-all duration-200 flex flex-col ${
        selected ? 'component-selected' : ''
      }`}
      style={{ backgroundColor: component.style.backgroundColor || 'transparent' }}
    >
      {selected && editable && (
        <div className="px-3 py-2 border-b border-dark-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Type className="w-4 h-4 text-primary-400" />
            <span className="text-xs text-dark-400">文本块</span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(!isEditing);
            }}
            className="p-1.5 text-dark-400 hover:text-white hover:bg-dark-700/50 rounded transition-colors"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="flex-1 p-4 flex items-center">
        {isEditing && editable ? (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onBlur={handleBlur}
            autoFocus
            onClick={(e) => e.stopPropagation()}
            className="w-full h-full bg-transparent border-none outline-none resize-none text-white"
            style={{
              fontSize: component.config.fontSize || '16px',
              fontWeight: component.config.fontWeight || 'normal',
              textAlign: component.config.textAlign || 'left',
              color: component.style.color || '#f1f5f9',
            }}
          />
        ) : (
          <p
            style={{
              fontSize: component.config.fontSize || '16px',
              fontWeight: component.config.fontWeight || 'normal',
              textAlign: component.config.textAlign || 'left',
              color: component.style.color || '#f1f5f9',
            }}
            className="w-full"
          >
            {content}
          </p>
        )}
      </div>
    </div>
  );
}
