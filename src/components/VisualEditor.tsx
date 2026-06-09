import { useRef, useState, useCallback, useEffect } from 'react';
import { useEditorStore } from '@/stores/editorStore';
import { ElementNode } from '@/types';
import { generateId } from '@/utils/htmlGenerator';
import { Trash2, Copy } from 'lucide-react';

interface ResizeState {
  elementId: string;
  width: string;
  height: string;
}

export default function VisualEditor() {
  const domTree = useEditorStore((s) => s.domTree);
  const selectedElementId = useEditorStore((s) => s.selectedElementId);
  const selectElement = useEditorStore((s) => s.selectElement);
  const addElement = useEditorStore((s) => s.addElement);
  const deleteElement = useEditorStore((s) => s.deleteElement);
  const moveElement = useEditorStore((s) => s.moveElement);
  const updateElement = useEditorStore((s) => s.updateElement);
  const updateElementStyle = useEditorStore((s) => s.updateElementStyle);
  const pushUndo = useEditorStore((s) => s.pushUndo);
  const zoom = useEditorStore((s) => s.zoom);

  const canvasRef = useRef<HTMLDivElement>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [dragOverParentId, setDragOverParentId] = useState<string | null>(null);
  const [resizeState, setResizeState] = useState<ResizeState | null>(null);

  useEffect(() => {
    const handleClickOutside = () => setContextMenu(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      selectElement(null);
    }
  };

  const handleElementClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    selectElement(id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const target = e.currentTarget as HTMLElement;
    const elId = target.getAttribute('data-element-id');
    if (!elId) return;
    setDragOverParentId(elId);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.stopPropagation();
    setDragOverParentId(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setDragOverParentId(null);

    const componentTag = e.dataTransfer.getData('application/ide-component');
    const moveElementId = e.dataTransfer.getData('application/ide-move-element');

    const target = e.currentTarget as HTMLElement;
    const parentId = target.getAttribute('data-element-id');

    if (!parentId) return;

    if (componentTag) {
      pushUndo();
      const rect = target.getBoundingClientRect();
      const y = e.clientY - rect.top;
      const height = rect.height;
      let index: number | undefined;
      if (y < height / 3) {
        index = 0;
      } else if (y > (height * 2) / 3) {
        index = undefined;
      } else {
        index = 1;
      }
      addElement(parentId, componentTag, index);
    } else if (moveElementId && moveElementId !== parentId) {
      pushUndo();
      moveElement(moveElementId, parentId, 999);
    }
  };

  const handleCanvasDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const componentTag = e.dataTransfer.getData('application/ide-component');
    if (componentTag) {
      pushUndo();
      addElement('root', componentTag);
    }
  };

  const handleCanvasDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleElementDragStart = (e: React.DragEvent, id: string) => {
    e.stopPropagation();
    e.dataTransfer.setData('application/ide-move-element', id);
    e.dataTransfer.effectAllowed = 'move';
    window.__ideDragData = { type: 'move-element', elementId: id };
  };

  const handleContextMenu = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    selectElement(id);
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  const handleDuplicate = () => {
    if (!selectedElementId) return;
    pushUndo();
    const store = useEditorStore.getState();
    const el = store.findElementById(selectedElementId);
    if (!el || !el.parentId) return;

    const newEl: ElementNode = {
      ...el,
      id: generateId(),
      attributes: { ...el.attributes },
      styles: { ...el.styles },
      children: el.children.map((c) => ({
        ...c,
        id: generateId(),
        parentId: generateId(),
      })),
      parentId: el.parentId,
    };
    if (el.parentId === 'root') {
      addElement('root', el.tag);
    }
    selectElement(newEl.id);
    setContextMenu(null);
  };

  const handleDelete = () => {
    if (!selectedElementId) return;
    pushUndo();
    deleteElement(selectedElementId);
    setContextMenu(null);
  };

  const handleResizeStart = (e: React.MouseEvent, direction: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!selectedElementId) return;

    const store = useEditorStore.getState();
    const el = store.findElementById(selectedElementId);
    if (!el) return;

    pushUndo();

    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = parseInt(el.styles.width || '200') || 200;
    const startHeight = parseInt(el.styles.height || '100') || 100;

    setResizeState({
      elementId: selectedElementId,
      width: `${startWidth}px`,
      height: `${startHeight}px`,
    });

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const dx = (moveEvent.clientX - startX) / (zoom / 100);
      const dy = (moveEvent.clientY - startY) / (zoom / 100);

      let newWidth = startWidth;
      let newHeight = startHeight;

      if (direction.includes('e')) newWidth = Math.max(20, startWidth + dx);
      if (direction.includes('w')) newWidth = Math.max(20, startWidth - dx);
      if (direction.includes('s')) newHeight = Math.max(20, startHeight + dy);
      if (direction.includes('n')) newHeight = Math.max(20, startHeight - dy);

      setResizeState({
        elementId: selectedElementId,
        width: `${newWidth}px`,
        height: `${newHeight}px`,
      });
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);

      const final = resizeStateRef.current;
      if (final) {
        updateElementStyle(selectedElementId, 'width', final.width);
        updateElementStyle(selectedElementId, 'height', final.height);
      }
      setResizeState(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const resizeStateRef = useRef<ResizeState | null>(null);
  resizeStateRef.current = resizeState;

  const renderElement = (element: ElementNode): React.ReactNode => {
    const isSelected = element.id === selectedElementId;
    const style: React.CSSProperties = {};

    if (element.styles.width) style.width = element.styles.width;
    if (element.styles.height) style.height = element.styles.height;
    if (element.styles.minHeight) style.minHeight = element.styles.minHeight;
    if (element.styles.backgroundColor) style.backgroundColor = element.styles.backgroundColor;
    if (element.styles.color) style.color = element.styles.color;
    if (element.styles.fontSize) style.fontSize = element.styles.fontSize;
    if (element.styles.margin) style.margin = element.styles.margin;
    if (element.styles.padding) style.padding = element.styles.padding;
    if (element.styles.border) style.border = element.styles.border;
    if (element.styles.borderRadius) style.borderRadius = element.styles.borderRadius;
    if (element.styles.display) style.display = element.styles.display;
    if (element.styles.flexDirection) style.flexDirection = element.styles.flexDirection as React.CSSProperties['flexDirection'];
    if (element.styles.justifyContent) style.justifyContent = element.styles.justifyContent as React.CSSProperties['justifyContent'];
    if (element.styles.alignItems) style.alignItems = element.styles.alignItems as React.CSSProperties['alignItems'];
    if (element.styles.flexWrap) style.flexWrap = element.styles.flexWrap as React.CSSProperties['flexWrap'];
    if (element.styles.gap) style.gap = element.styles.gap;

    const isDropTarget = dragOverParentId === element.id;
    const isResizing = resizeState && resizeState.elementId === element.id;

    return (
      <div
        key={element.id}
        data-element-id={element.id}
        onClick={(e) => handleElementClick(e, element.id)}
        onContextMenu={(e) => handleContextMenu(e, element.id)}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        draggable
        onDragStart={(e) => handleElementDragStart(e, element.id)}
        className={`relative group ${isSelected ? 'ring-2 ring-[#007acc]' : 'ring-1 ring-transparent'} ${isDropTarget ? 'ring-1 ring-[#4ec9b0]' : ''}`}
        style={{
          ...style,
          ...(isResizing ? { width: resizeState!.width, height: resizeState!.height } : {}),
          minHeight: element.children.length === 0 && !element.textContent ? '24px' : undefined,
          position: 'relative',
          cursor: 'pointer',
        }}
      >
        {isSelected && (
          <>
            {['nw', 'n', 'ne', 'w', 'e', 'sw', 's', 'se'].map((dir) => (
              <div
                key={dir}
                className="absolute w-2 h-2 bg-white border border-[#007acc] z-10"
                style={{
                  top: dir.includes('n') ? '-4px' : dir.includes('s') ? 'auto' : '50%',
                  bottom: dir.includes('s') ? '-4px' : 'auto',
                  left: dir.includes('w') ? '-4px' : dir.includes('e') ? 'auto' : '50%',
                  right: dir.includes('e') ? '-4px' : 'auto',
                  transform: (!dir.includes('n') && !dir.includes('s')) || (!dir.includes('e') && !dir.includes('w')) ? 'translate(-50%, -50%)' : undefined,
                  cursor: dir === 'nw' || dir === 'se' ? 'nwse-resize' :
                          dir === 'ne' || dir === 'sw' ? 'nesw-resize' :
                          dir === 'n' || dir === 's' ? 'ns-resize' : 'ew-resize',
                }}
                onMouseDown={(e) => handleResizeStart(e, dir)}
              />
            ))}
            <div className="absolute -top-5 left-0 bg-[#007acc] text-white text-[10px] px-1.5 py-0.5 rounded-t whitespace-nowrap z-10">
              &lt;{element.tag}&gt;
            </div>
          </>
        )}

        {element.textContent && element.children.length === 0 ? (
          element.tag === 'img' ? (
            <div className="flex items-center justify-center bg-[#f0f0f0] text-[#999] text-[11px] min-h-[40px]">
              [Image: {element.attributes.src || 'no src'}]
            </div>
          ) : (
            element.textContent
          )
        ) : element.tag === 'input' ? (
          <input
            type={element.attributes.type || 'text'}
            placeholder={element.attributes.placeholder || ''}
            className="border border-[#ccc] px-2 py-1 text-[13px] outline-none w-full"
            readOnly
          />
        ) : element.tag === 'textarea' ? (
          <textarea
            placeholder={element.attributes.placeholder || ''}
            className="border border-[#ccc] px-2 py-1 text-[13px] outline-none w-full resize-none"
            rows={3}
            readOnly
          />
        ) : element.tag === 'button' ? (
          <button className="px-3 py-1.5 bg-[#007acc] text-white rounded text-[13px] cursor-default">
            {element.children.length === 0 ? (element.textContent || 'Button') : null}
          </button>
        ) : null}

        {element.children.map((child) => renderElement(child))}
        {element.children.length > 0 && element.textContent && (
          <span>{element.textContent}</span>
        )}

        {element.children.length === 0 && !element.textContent && !['img', 'input', 'textarea', 'button'].includes(element.tag) && (
          <div className="text-[#bbb] text-[10px] italic min-h-[20px] flex items-center">
            &lt;{element.tag}&gt;
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col bg-[#1e1e1e] overflow-hidden">
      <div className="flex-1 overflow-auto flex justify-center p-4">
        <div
          ref={canvasRef}
          className="bg-white min-h-full shadow-lg relative"
          style={{
            width: '100%',
            maxWidth: '1200px',
            transform: `scale(${zoom / 100})`,
            transformOrigin: 'top center',
            minHeight: `${Math.max(400, 100 / (zoom / 100))}px`,
          }}
          onClick={handleCanvasClick}
          onDragOver={handleCanvasDragOver}
          onDrop={handleCanvasDrop}
        >
          {domTree.children.map((child) => renderElement(child))}
        </div>
      </div>

      {contextMenu && (
        <div
          className="fixed z-50 bg-[#252526] border border-[#454545] rounded shadow-xl py-1 min-w-[160px]"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          <button
            onClick={handleDuplicate}
            className="flex items-center gap-2 w-full px-3 py-1.5 text-[12px] text-[#cccccc] hover:bg-[#37373d] transition-colors"
          >
            <Copy size={13} /> 复制元素
          </button>
          <div className="border-t border-[#454545] my-0.5" />
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 w-full px-3 py-1.5 text-[12px] text-[#f44747] hover:bg-[#37373d] transition-colors"
          >
            <Trash2 size={13} /> 删除元素
          </button>
        </div>
      )}
    </div>
  );
}
