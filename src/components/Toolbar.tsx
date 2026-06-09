import { useRef } from 'react';
import { useEditorStore } from '@/stores/editorStore';
import { useProjectStore } from '@/stores/projectStore';
import { EditorMode } from '@/types';
import {
  Eye,
  Code2,
  Columns2,
  Undo2,
  Redo2,
  Download,
  Save,
  Upload,
} from 'lucide-react';

const modes: { mode: EditorMode; label: string; icon: React.ReactNode }[] = [
  { mode: 'visual', label: '可视化', icon: <Eye size={14} /> },
  { mode: 'code', label: '代码', icon: <Code2 size={14} /> },
  { mode: 'split', label: '拆分', icon: <Columns2 size={14} /> },
];

export default function Toolbar() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mode = useEditorStore((s) => s.mode);
  const setMode = useEditorStore((s) => s.setMode);
  const undo = useEditorStore((s) => s.undo);
  const redo = useEditorStore((s) => s.redo);
  const undoStack = useEditorStore((s) => s.undoStack);
  const redoStack = useEditorStore((s) => s.redoStack);
  const htmlContent = useEditorStore((s) => s.htmlContent);
  const cssContent = useEditorStore((s) => s.cssContent);
  const reset = useEditorStore((s) => s.reset);
  const projectName = useProjectStore((s) => s.name);

  const handleExport = () => {
    const fullHtml = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${projectName}</title>
  <style>
${cssContent}
  </style>
</head>
<body>
${htmlContent}
</body>
</html>`;

    const blob = new Blob([fullHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'index.html';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSave = () => {
    const data = useProjectStore.getState().exportProject();
    localStorage.setItem('web-ide-project-data', data);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileName = file.name.replace(/\.html?$/i, '');

    const reader = new FileReader();
    reader.onload = (event) => {
      const rawContent = event.target?.result as string;
      if (!rawContent) return;

      const parser = new DOMParser();
      const doc = parser.parseFromString(rawContent, 'text/html');

      const title = doc.querySelector('title')?.textContent?.trim() || fileName;
      const bodyHTML = doc.body?.innerHTML?.trim() || rawContent;
      const styleEl = doc.querySelector('style');
      const cssText = styleEl ? styleEl.textContent?.trim() || '' : '';
      const existingCss = useEditorStore.getState().cssContent;
      const finalCss = cssText || existingCss;

      const projectStore = useProjectStore.getState();
      projectStore.updateFileContent('file-index', bodyHTML);
      projectStore.updateFileContent('file-style', finalCss);
      projectStore.renameNode('file-index', `${fileName}.html`);
      useProjectStore.setState({ name: title });

      reset(bodyHTML, finalCss);
    };
    reader.onerror = () => {
      console.error('读取文件失败');
    };
    reader.readAsText(file);

    e.target.value = '';
  };

  return (
    <div className="flex items-center h-9 bg-[#333] border-b border-[#474747] px-2 select-none shrink-0">
      <div className="flex items-center gap-2 mr-4">
        <div className="w-5 h-5 rounded bg-[#007acc] flex items-center justify-center">
          <span className="text-white text-[10px] font-bold">W</span>
        </div>
        <span className="text-[#cccccc] text-[13px]">{projectName}</span>
      </div>

      <div className="flex items-center bg-[#252526] rounded">
        {modes.map((m) => (
          <button
            key={m.mode}
            onClick={() => setMode(m.mode)}
            className={`flex items-center gap-1 px-3 py-1 text-[12px] transition-colors rounded ${
              mode === m.mode
                ? 'bg-[#007acc] text-white'
                : 'text-[#858585] hover:text-[#cccccc]'
            }`}
          >
            {m.icon}
            <span className="hidden sm:inline">{m.label}</span>
          </button>
        ))}
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-1">
        <button
          onClick={undo}
          disabled={undoStack.length === 0}
          className="p-1 rounded text-[#cccccc] hover:bg-[#454545] disabled:opacity-30 disabled:cursor-not-allowed"
          title="撤销"
        >
          <Undo2 size={15} />
        </button>
        <button
          onClick={redo}
          disabled={redoStack.length === 0}
          className="p-1 rounded text-[#cccccc] hover:bg-[#454545] disabled:opacity-30 disabled:cursor-not-allowed"
          title="重做"
        >
          <Redo2 size={15} />
        </button>
      </div>

      <div className="flex items-center gap-1 ml-2">
        <button
          onClick={handleImportClick}
          className="flex items-center gap-1 px-2 py-1 text-[12px] text-[#cccccc] hover:bg-[#454545] rounded transition-colors"
          title="导入本地HTML文件"
        >
          <Download size={14} />
          <span className="hidden sm:inline">导入</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".html,.htm"
          onChange={handleFileChange}
          className="absolute w-0 h-0 opacity-0 pointer-events-none"
        />
        <button
          onClick={handleSave}
          className="flex items-center gap-1 px-2 py-1 text-[12px] text-[#cccccc] hover:bg-[#454545] rounded transition-colors"
          title="保存到本地"
        >
          <Save size={14} />
          <span className="hidden sm:inline">保存</span>
        </button>
        <button
          onClick={handleExport}
          className="flex items-center gap-1 px-2 py-1 text-[12px] text-[#cccccc] hover:bg-[#454545] rounded transition-colors"
          title="导出为HTML文件"
        >
          <Upload size={14} />
          <span className="hidden sm:inline">导出</span>
        </button>
      </div>
    </div>
  );
}
