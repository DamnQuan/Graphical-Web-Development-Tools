import { useEditorStore } from '@/stores/editorStore';
import { Minus, Plus, RotateCcw } from 'lucide-react';

export default function StatusBar() {
  const selectedElementId = useEditorStore((s) => s.selectedElementId);
  const zoom = useEditorStore((s) => s.zoom);
  const setZoom = useEditorStore((s) => s.setZoom);
  const mode = useEditorStore((s) => s.mode);
  const getSelectedElement = useEditorStore((s) => s.getSelectedElement);
  const element = getSelectedElement();

  return (
    <div className="flex items-center h-6 bg-[#007acc] text-white text-[11px] px-3 select-none shrink-0">
      <div className="flex items-center gap-3">
        <span>
          {element
            ? `&lt;${element.tag}${element.attributes.id ? ` #${element.attributes.id}` : ''}${element.attributes.class ? ` .${element.attributes.class.split(' ')[0]}` : ''}&gt;`
            : '未选中元素'}
        </span>
        <span className="text-white/60">|</span>
        <span>模式: {mode === 'visual' ? '可视化' : mode === 'code' ? '代码' : '拆分'}</span>
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-1">
        <button
          onClick={() => setZoom(Math.max(25, zoom - 10))}
          className="p-0.5 rounded hover:bg-white/20 transition-colors"
        >
          <Minus size={12} />
        </button>
        <button
          onClick={() => setZoom(100)}
          className="px-1 rounded hover:bg-white/20 transition-colors min-w-[36px] text-center"
        >
          {zoom}%
        </button>
        <button
          onClick={() => setZoom(Math.min(200, zoom + 10))}
          className="p-0.5 rounded hover:bg-white/20 transition-colors"
        >
          <Plus size={12} />
        </button>
        <button
          onClick={() => setZoom(100)}
          className="p-0.5 rounded hover:bg-white/20 transition-colors ml-1"
          title="重置缩放"
        >
          <RotateCcw size={12} />
        </button>
      </div>
    </div>
  );
}
