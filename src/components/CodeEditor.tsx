import { useRef, useCallback, useState } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import { useEditorStore } from '@/stores/editorStore';

export default function CodeEditorPanel() {
  const [codeTab, setCodeTab] = useState<'HTML' | 'CSS'>('HTML');
  const htmlContent = useEditorStore((s) => s.htmlContent);
  const cssContent = useEditorStore((s) => s.cssContent);
  const updateHtmlContent = useEditorStore((s) => s.updateHtmlContent);
  const updateCssContent = useEditorStore((s) => s.updateCssContent);
  const syncDomFromHtml = useEditorStore((s) => s.syncDomFromHtml);
  const updatePreview = useEditorStore((s) => s.updatePreview);

  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const syncAfterEdit = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const state = useEditorStore.getState();
      if (state.mode === 'visual') return;
      state.syncDomFromHtml();
      state.updatePreview();
    }, 400);
  }, []);

  const handleHtmlChange = (value: string | undefined) => {
    if (value === undefined) return;
    updateHtmlContent(value);
    syncAfterEdit();
  };

  const handleCssChange = (value: string | undefined) => {
    if (value === undefined) return;
    updateCssContent(value);
    useEditorStore.getState().updatePreview();
  };

  const handleEditorMount: OnMount = (editor) => {
    editor.addAction({
      id: 'save-and-sync',
      label: 'Save and Sync Preview',
      keybindings: [2048 | 49],
      run: () => {
        const state = useEditorStore.getState();
        state.syncDomFromHtml();
        state.updatePreview();
      },
    });
  };

  return (
    <div className="flex-1 flex flex-col bg-[#1e1e1e] overflow-hidden">
      <div className="flex items-center bg-[#252526] border-b border-[#474747]">
        <button
          onClick={() => setCodeTab('HTML')}
          className={`px-4 py-1.5 text-[12px] transition-colors border-b-2 -mb-[1px] ${
            codeTab === 'HTML'
              ? 'text-white border-[#007acc]'
              : 'text-[#858585] border-transparent hover:text-[#cccccc]'
          }`}
        >
          HTML
        </button>
        <button
          onClick={() => setCodeTab('CSS')}
          className={`px-4 py-1.5 text-[12px] transition-colors border-b-2 -mb-[1px] ${
            codeTab === 'CSS'
              ? 'text-white border-[#007acc]'
              : 'text-[#858585] border-transparent hover:text-[#cccccc]'
          }`}
        >
          CSS
        </button>
      </div>

      <div className="flex-1 relative overflow-hidden">
        {codeTab === 'HTML' && (
          <Editor
            height="100%"
            defaultLanguage="html"
            value={htmlContent}
            onChange={handleHtmlChange}
            onMount={handleEditorMount}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 13,
              fontFamily: "Consolas, 'Courier New', monospace",
              lineNumbers: 'on',
              renderWhitespace: 'selection',
              scrollBeyondLastLine: false,
              wordWrap: 'on',
              tabSize: 2,
              automaticLayout: true,
              padding: { top: 8 },
              suggest: { showWords: false },
              folding: true,
              lineDecorationsWidth: 8,
              lineNumbersMinChars: 3,
              glyphMargin: false,
            }}
          />
        )}
        {codeTab === 'CSS' && (
          <Editor
            height="100%"
            defaultLanguage="css"
            value={cssContent}
            onChange={handleCssChange}
            onMount={handleEditorMount}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 13,
              fontFamily: "Consolas, 'Courier New', monospace",
              lineNumbers: 'on',
              renderWhitespace: 'selection',
              scrollBeyondLastLine: false,
              wordWrap: 'on',
              tabSize: 2,
              automaticLayout: true,
              padding: { top: 8 },
              suggest: { showWords: false },
              folding: true,
              lineDecorationsWidth: 8,
              lineNumbersMinChars: 3,
              glyphMargin: false,
            }}
          />
        )}
      </div>
    </div>
  );
}
