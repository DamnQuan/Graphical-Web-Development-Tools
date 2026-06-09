import { useRef, useCallback } from 'react';
import { useUILayoutStore } from '@/stores/uiLayoutStore';
import { useEditorStore } from '@/stores/editorStore';
import Toolbar from './Toolbar';
import StatusBar from './StatusBar';
import FileExplorer from './FileExplorer';
import ComponentPalette from './ComponentPalette';
import VisualEditor from './VisualEditor';
import CodeEditorPanel from './CodeEditor';
import PropertyPanel from './PropertyPanel';
import {
  Files,
  Puzzle,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
} from 'lucide-react';

export default function MainLayout() {
  const leftPanelWidth = useUILayoutStore((s) => s.leftPanelWidth);
  const rightPanelWidth = useUILayoutStore((s) => s.rightPanelWidth);
  const leftCollapsed = useUILayoutStore((s) => s.leftPanelCollapsed);
  const rightCollapsed = useUILayoutStore((s) => s.rightPanelCollapsed);
  const leftActiveTab = useUILayoutStore((s) => s.leftActiveTab);
  const setLeftPanelWidth = useUILayoutStore((s) => s.setLeftPanelWidth);
  const setRightPanelWidth = useUILayoutStore((s) => s.setRightPanelWidth);
  const toggleLeftPanel = useUILayoutStore((s) => s.toggleLeftPanel);
  const toggleRightPanel = useUILayoutStore((s) => s.toggleRightPanel);
  const setLeftActiveTab = useUILayoutStore((s) => s.setLeftActiveTab);
  const mode = useEditorStore((s) => s.mode);

  const isResizingLeft = useRef(false);
  const isResizingRight = useRef(false);

  const handleLeftResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isResizingLeft.current = true;
    const startX = e.clientX;
    const startWidth = useUILayoutStore.getState().leftPanelWidth;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isResizingLeft.current) return;
      const dx = moveEvent.clientX - startX;
      useUILayoutStore.getState().setLeftPanelWidth(startWidth + dx);
    };

    const handleMouseUp = () => {
      isResizingLeft.current = false;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, []);

  const handleRightResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isResizingRight.current = true;
    const startX = e.clientX;
    const startWidth = useUILayoutStore.getState().rightPanelWidth;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isResizingRight.current) return;
      const dx = startX - moveEvent.clientX;
      useUILayoutStore.getState().setRightPanelWidth(startWidth + dx);
    };

    const handleMouseUp = () => {
      isResizingRight.current = false;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, []);

  const renderCenter = () => {
    switch (mode) {
      case 'visual':
        return <VisualEditor />;
      case 'code':
        return <CodeEditorPanel />;
      case 'split':
        return (
          <div className="flex-1 flex flex-col bg-[#1e1e1e]">
            <div className="flex-1 min-h-0 border-b border-[#474747]">
              <VisualEditor />
            </div>
            <div className="h-[40%] min-h-[100px]">
              <CodeEditorPanel />
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#1e1e1e] text-[#cccccc] overflow-hidden">
      <Toolbar />

      <div className="flex flex-1 min-h-0">
        {leftCollapsed ? (
          <div className="w-12 bg-[#252526] border-r border-[#474747] flex flex-col items-center pt-2 gap-1 shrink-0">
            <button
              onClick={toggleLeftPanel}
              className="p-1.5 rounded text-[#858585] hover:text-[#cccccc] hover:bg-[#37373d]"
              title="展开面板"
            >
              <PanelLeftOpen size={16} />
            </button>
            <button
              onClick={() => setLeftActiveTab('files')}
              className={`p-1.5 rounded ${
                leftActiveTab === 'files'
                  ? 'text-[#ffffff]'
                  : 'text-[#858585] hover:text-[#cccccc]'
              } hover:bg-[#37373d]`}
              title="文件"
            >
              <Files size={16} />
            </button>
            <button
              onClick={() => setLeftActiveTab('components')}
              className={`p-1.5 rounded ${
                leftActiveTab === 'components'
                  ? 'text-[#ffffff]'
                  : 'text-[#858585] hover:text-[#cccccc]'
              } hover:bg-[#37373d]`}
              title="组件"
            >
              <Puzzle size={16} />
            </button>
          </div>
        ) : (
          <div
            className="bg-[#252526] border-r border-[#474747] flex flex-col shrink-0 overflow-hidden"
            style={{ width: leftPanelWidth }}
          >
            <div className="flex items-center border-b border-[#474747]">
              <button
                onClick={() => setLeftActiveTab('files')}
                className={`flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-[12px] transition-colors ${
                  leftActiveTab === 'files'
                    ? 'text-white border-b border-[#007acc] -mb-[1px]'
                    : 'text-[#858585] hover:text-[#cccccc]'
                }`}
              >
                <Files size={13} />
                <span>文件</span>
              </button>
              <button
                onClick={() => setLeftActiveTab('components')}
                className={`flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-[12px] transition-colors ${
                  leftActiveTab === 'components'
                    ? 'text-white border-b border-[#007acc] -mb-[1px]'
                    : 'text-[#858585] hover:text-[#cccccc]'
                }`}
              >
                <Puzzle size={13} />
                <span>组件</span>
              </button>
              <button
                onClick={toggleLeftPanel}
                className="p-1.5 text-[#858585] hover:text-[#cccccc] hover:bg-[#37373d]"
                title="折叠面板"
              >
                <PanelLeftClose size={14} />
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              {leftActiveTab === 'files' ? <FileExplorer /> : <ComponentPalette />}
            </div>
          </div>
        )}

        <div
          className="w-1 hover:w-1 bg-[#474747] hover:bg-[#007acc] cursor-col-resize shrink-0 transition-colors"
          onMouseDown={handleLeftResizeStart}
        />

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {renderCenter()}
        </div>

        {rightCollapsed ? (
          <div className="w-10 bg-[#252526] border-l border-[#474747] flex flex-col items-center pt-2 shrink-0">
            <button
              onClick={toggleRightPanel}
              className="p-1.5 rounded text-[#858585] hover:text-[#cccccc] hover:bg-[#37373d]"
              title="展开属性面板"
            >
              <PanelRightOpen size={16} />
            </button>
          </div>
        ) : (
          <>
            <div
              className="w-1 hover:w-1 bg-[#474747] hover:bg-[#007acc] cursor-col-resize shrink-0 transition-colors"
              onMouseDown={handleRightResizeStart}
            />
            <div
              className="bg-[#252526] border-l border-[#474747] flex flex-col shrink-0 overflow-hidden"
              style={{ width: rightPanelWidth }}
            >
              <div className="flex items-center border-b border-[#474747] px-2">
                <span className="text-[11px] text-[#bbbbbb] font-semibold uppercase tracking-wide flex-1">
                  属性
                </span>
                <button
                  onClick={toggleRightPanel}
                  className="p-1.5 text-[#858585] hover:text-[#cccccc] hover:bg-[#37373d]"
                  title="折叠面板"
                >
                  <PanelRightClose size={14} />
                </button>
              </div>
              <div className="flex-1 overflow-hidden">
                <PropertyPanel />
              </div>
            </div>
          </>
        )}
      </div>

      <StatusBar />
    </div>
  );
}
