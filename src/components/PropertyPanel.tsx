import { useState, useRef, useCallback, useEffect } from 'react';
import { useEditorStore } from '@/stores/editorStore';
import { ElementNode } from '@/types';
import {
  Settings2,
  PaintBucket,
  Ruler,
} from 'lucide-react';

type RightTab = 'properties' | 'styles' | 'layout';

const COMMON_STYLE_PROPERTIES = [
  { label: '宽度', prop: 'width', type: 'text' },
  { label: '高度', prop: 'height', type: 'text' },
  { label: '背景色', prop: 'backgroundColor', type: 'color' },
  { label: '文字颜色', prop: 'color', type: 'color' },
  { label: '字号', prop: 'fontSize', type: 'text' },
  { label: '内边距', prop: 'padding', type: 'text' },
  { label: '外边距', prop: 'margin', type: 'text' },
  { label: '边框', prop: 'border', type: 'text' },
  { label: '圆角', prop: 'borderRadius', type: 'text' },
  { label: '不透明度', prop: 'opacity', type: 'text' },
];

const LAYOUT_PROPERTIES = [
  { label: 'Display', prop: 'display', type: 'select', options: ['', 'block', 'inline', 'inline-block', 'flex', 'grid', 'none'] },
  { label: 'Flex 方向', prop: 'flexDirection', type: 'select', options: ['', 'row', 'column', 'row-reverse', 'column-reverse'] },
  { label: '主轴对齐', prop: 'justifyContent', type: 'select', options: ['', 'flex-start', 'center', 'flex-end', 'space-between', 'space-around', 'space-evenly'] },
  { label: '交叉轴对齐', prop: 'alignItems', type: 'select', options: ['', 'flex-start', 'center', 'flex-end', 'stretch', 'baseline'] },
  { label: 'Flex 换行', prop: 'flexWrap', type: 'select', options: ['', 'nowrap', 'wrap', 'wrap-reverse'] },
  { label: '间距', prop: 'gap', type: 'text' },
  { label: '最小高度', prop: 'minHeight', type: 'text' },
];

function findElement(node: ElementNode, id: string): ElementNode | null {
  if (node.id === id) return node;
  for (const child of node.children) {
    const found = findElement(child, id);
    if (found) return found;
  }
  return null;
}

export default function PropertyPanel() {
  const [activeTab, setActiveTab] = useState<RightTab>('properties');
  const undoPushedRef = useRef(false);

  const element = useEditorStore((s) => {
    if (!s.selectedElementId) return null;
    return findElement(s.domTree, s.selectedElementId);
  });

  const selectedElementId = useEditorStore((s) => s.selectedElementId);
  const updateElement = useEditorStore((s) => s.updateElement);
  const updateElementStyle = useEditorStore((s) => s.updateElementStyle);
  const cssContent = useEditorStore((s) => s.cssContent);
  const updateCssContent = useEditorStore((s) => s.updateCssContent);
  const updatePreview = useEditorStore((s) => s.updatePreview);
  const pushUndo = useEditorStore((s) => s.pushUndo);

  const pushUndoOnce = useCallback(() => {
    if (!undoPushedRef.current) {
      undoPushedRef.current = true;
      pushUndo();
    }
  }, [pushUndo]);

  useEffect(() => {
    undoPushedRef.current = false;
  }, [selectedElementId]);

  const handleAttributeChange = (key: string, value: string) => {
    if (!selectedElementId) return;
    pushUndoOnce();
    updateElement(selectedElementId, {
      attributes: { ...element?.attributes, [key]: value },
    });
  };

  const handleStyleChange = (prop: string, value: string) => {
    if (!selectedElementId) return;
    pushUndoOnce();
    updateElementStyle(selectedElementId, prop, value);
  };

  const handleTextChange = (v: string) => {
    if (!selectedElementId) return;
    pushUndoOnce();
    updateElement(selectedElementId, { textContent: v });
  };

  const handleCssChange = (value: string) => {
    updateCssContent(value);
    updatePreview();
  };

  const tabs = [
    { id: 'properties' as RightTab, label: '属性', icon: <Settings2 size={13} /> },
    { id: 'styles' as RightTab, label: '样式', icon: <PaintBucket size={13} /> },
    { id: 'layout' as RightTab, label: '布局', icon: <Ruler size={13} /> },
  ];

  return (
    <div className="flex flex-col h-full text-[13px] bg-[#252526]">
      <div className="flex items-center bg-[#2d2d2d] border-b border-[#474747]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1 px-3 py-1.5 text-[12px] transition-colors ${
              activeTab === tab.id
                ? 'text-white border-b-2 border-[#007acc] -mb-[1px]'
                : 'text-[#858585] hover:text-[#cccccc] border-b-2 border-transparent'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        {!selectedElementId || !element ? (
          <div className="flex flex-col items-center justify-center h-full text-[#858585] gap-2">
            <Settings2 size={32} strokeWidth={1} />
            <p className="text-[12px]">选择一个元素以编辑属性</p>
          </div>
        ) : (
          <>
            {activeTab === 'properties' && (
              <div className="p-3 space-y-3">
                <div>
                  <div className="text-[11px] text-[#bbbbbb] font-semibold uppercase mb-2">
                    基本信息
                  </div>
                  <div className="space-y-2">
                    <PropertyRow label="标签" value={element.tag} readOnly />
                    <EditableRow
                      label="ID"
                      value={element.attributes.id || ''}
                      onChange={(v) => handleAttributeChange('id', v)}
                    />
                    <EditableRow
                      label="Class"
                      value={element.attributes.class || ''}
                      onChange={(v) => handleAttributeChange('class', v)}
                    />
                    {element.textContent !== undefined && (
                      <EditableRow
                        label="文本"
                        value={element.textContent || ''}
                        onChange={handleTextChange}
                      />
                    )}
                    {element.tag === 'a' && (
                      <EditableRow
                        label="Href"
                        value={element.attributes.href || ''}
                        onChange={(v) => handleAttributeChange('href', v)}
                      />
                    )}
                    {element.tag === 'img' && (
                      <EditableRow
                        label="Src"
                        value={element.attributes.src || ''}
                        onChange={(v) => handleAttributeChange('src', v)}
                      />
                    )}
                    {element.tag === 'input' && (
                      <>
                        <EditableRow
                          label="Type"
                          value={element.attributes.type || 'text'}
                          onChange={(v) => handleAttributeChange('type', v)}
                        />
                        <EditableRow
                          label="Placeholder"
                          value={element.attributes.placeholder || ''}
                          onChange={(v) => handleAttributeChange('placeholder', v)}
                        />
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'styles' && (
              <div className="p-3 space-y-2">
                <div className="text-[11px] text-[#bbbbbb] font-semibold uppercase mb-2">
                  内联样式
                </div>
                {COMMON_STYLE_PROPERTIES.map((prop) => (
                  <div key={prop.prop} className="flex items-center gap-2">
                    <label className="text-[11px] text-[#858585] w-16 shrink-0 text-right">
                      {prop.label}
                    </label>
                    {prop.type === 'color' ? (
                      <div className="flex items-center gap-2 flex-1">
                        <input
                          type="color"
                          value={element.styles[prop.prop] || '#000000'}
                          onChange={(e) => handleStyleChange(prop.prop, e.target.value)}
                          className="w-6 h-6 rounded cursor-pointer border border-[#474747] bg-transparent"
                        />
                        <input
                          type="text"
                          value={element.styles[prop.prop] || ''}
                          onChange={(e) => handleStyleChange(prop.prop, e.target.value)}
                          className="flex-1 bg-[#3c3c3c] text-[#cccccc] text-[12px] px-2 py-1 rounded border border-[#474747] outline-none focus:border-[#007acc]"
                        />
                      </div>
                    ) : (
                      <input
                        type="text"
                        value={element.styles[prop.prop] || ''}
                        onChange={(e) => handleStyleChange(prop.prop, e.target.value)}
                        className="flex-1 bg-[#3c3c3c] text-[#cccccc] text-[12px] px-2 py-1 rounded border border-[#474747] outline-none focus:border-[#007acc]"
                      />
                    )}
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'layout' && (
              <div className="p-3 space-y-2">
                <div className="text-[11px] text-[#bbbbbb] font-semibold uppercase mb-2">
                  布局属性
                </div>
                {LAYOUT_PROPERTIES.map((prop) => (
                  <div key={prop.prop} className="flex items-center gap-2">
                    <label className="text-[11px] text-[#858585] w-16 shrink-0 text-right">
                      {prop.label}
                    </label>
                    {prop.type === 'select' ? (
                      <select
                        value={element.styles[prop.prop] || ''}
                        onChange={(e) => handleStyleChange(prop.prop, e.target.value)}
                        className="flex-1 bg-[#3c3c3c] text-[#cccccc] text-[12px] px-2 py-1 rounded border border-[#474747] outline-none focus:border-[#007acc]"
                      >
                        {prop.options?.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt || '(默认)'}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={element.styles[prop.prop] || ''}
                        onChange={(e) => handleStyleChange(prop.prop, e.target.value)}
                        className="flex-1 bg-[#3c3c3c] text-[#cccccc] text-[12px] px-2 py-1 rounded border border-[#474747] outline-none focus:border-[#007acc]"
                      />
                    )}
                  </div>
                ))}

                <div className="border-t border-[#474747] mt-4 pt-3">
                  <div className="text-[11px] text-[#bbbbbb] font-semibold uppercase mb-2">
                    全局 CSS
                  </div>
                  <textarea
                    value={cssContent}
                    onChange={(e) => handleCssChange(e.target.value)}
                    className="w-full h-[120px] bg-[#1e1e1e] text-[#d4d4d4] text-[12px] p-2 rounded border border-[#474747] outline-none focus:border-[#007acc] font-mono resize-none"
                    spellCheck={false}
                  />
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function PropertyRow({
  label,
  value,
  readOnly,
}: {
  label: string;
  value: string;
  readOnly?: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[11px] text-[#858585] w-16 shrink-0 text-right">{label}</span>
      <span className="flex-1 bg-[#3c3c3c] text-[#cccccc] text-[12px] px-2 py-1 rounded border border-[#474747]">
        {value || '(空)'}
      </span>
    </div>
  );
}

function EditableRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-[11px] text-[#858585] w-16 shrink-0 text-right">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 bg-[#3c3c3c] text-[#cccccc] text-[12px] px-2 py-1 rounded border border-[#474747] outline-none focus:border-[#007acc]"
      />
    </div>
  );
}
