import { useState } from 'react';
import { useProjectStore } from '@/stores/projectStore';
import { useEditorStore } from '@/stores/editorStore';
import { FileNode } from '@/types';
import {
  ChevronRight,
  ChevronDown,
  File,
  Folder,
  FolderOpen,
  Plus,
  FilePlus,
  FolderPlus,
  Trash2,
  Pencil,
} from 'lucide-react';

export default function FileExplorer() {
  const files = useProjectStore((s) => s.files);
  const activeFileId = useProjectStore((s) => s.activeFileId);
  const setActiveFile = useProjectStore((s) => s.setActiveFile);
  const addFile = useProjectStore((s) => s.addFile);
  const addFolder = useProjectStore((s) => s.addFolder);
  const deleteNode = useProjectStore((s) => s.deleteNode);
  const renameNode = useProjectStore((s) => s.renameNode);
  const toggleFolder = useProjectStore((s) => s.toggleFolder);
  const reset = useEditorStore((s) => s.reset);

  const handleFileClick = (node: FileNode) => {
    if (node.type === 'folder') {
      toggleFolder(node.id);
    } else {
      setActiveFile(node.id);
      const content = useProjectStore.getState().getFileContent(node.id);
      const lang = useProjectStore.getState().getFileLanguage(node.id);
      if (content !== undefined && lang === 'html') {
        reset(content, useEditorStore.getState().cssContent);
      }
    }
  };

  const handleAddFile = (parentId: string) => {
    const newFile: FileNode = {
      id: '',
      name: 'new-file.html',
      type: 'file',
      content: '',
      language: 'html',
      parentId,
    };
    addFile(parentId, newFile);
  };

  const handleAddFolder = (parentId: string) => {
    addFolder(parentId, 'new-folder');
  };

  return (
    <div className="flex flex-col h-full text-[13px]">
      <div className="flex items-center justify-between px-2 py-1 text-[11px] font-semibold text-[#bbbbbb] uppercase tracking-wide">
        <span>文件资源管理器</span>
        <div className="flex items-center gap-0.5">
          <button
            onClick={() => handleAddFile('root')}
            className="p-0.5 rounded hover:bg-[#454545] text-[#858585] hover:text-[#cccccc]"
            title="新建文件"
          >
            <FilePlus size={14} />
          </button>
          <button
            onClick={() => handleAddFolder('root')}
            className="p-0.5 rounded hover:bg-[#454545] text-[#858585] hover:text-[#cccccc]"
            title="新建文件夹"
          >
            <FolderPlus size={14} />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {files.map((node) => (
          <FileTreeNode
            key={node.id}
            node={node}
            depth={0}
            activeFileId={activeFileId}
            onFileClick={handleFileClick}
            onAddFile={handleAddFile}
            onAddFolder={handleAddFolder}
            onDelete={deleteNode}
            onRename={renameNode}
          />
        ))}
      </div>
    </div>
  );
}

function FileTreeNode({
  node,
  depth,
  activeFileId,
  onFileClick,
  onAddFile,
  onAddFolder,
  onDelete,
  onRename,
}: {
  node: FileNode;
  depth: number;
  activeFileId: string | null;
  onFileClick: (node: FileNode) => void;
  onAddFile: (parentId: string) => void;
  onAddFolder: (parentId: string) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, name: string) => void;
}) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(node.name);
  const isActive = node.id === activeFileId;

  const handleRename = () => {
    if (renameValue.trim() && renameValue !== node.name) {
      onRename(node.id, renameValue.trim());
    }
    setIsRenaming(false);
  };

  return (
    <div>
      <div
        className={`flex items-center h-7 cursor-pointer group text-[#cccccc] hover:bg-[#2a2d2e] ${
          isActive ? 'bg-[#37373d]' : ''
        }`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={() => onFileClick(node)}
      >
        {node.type === 'folder' ? (
          <>
            <span className="mr-0.5 text-[#858585]">
              {node.isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </span>
            {node.isOpen ? (
              <FolderOpen size={14} className="mr-1 text-[#dcb67a]" />
            ) : (
              <Folder size={14} className="mr-1 text-[#dcb67a]" />
            )}
          </>
        ) : (
          <>
            <span className="w-[14px] mr-0.5" />
            <File size={14} className="mr-1 text-[#75beff]" />
          </>
        )}

        {isRenaming ? (
          <input
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onBlur={handleRename}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleRename();
              if (e.key === 'Escape') setIsRenaming(false);
            }}
            className="bg-[#3c3c3c] text-[#cccccc] text-[13px] px-1 py-0 border border-[#007acc] outline-none flex-1"
            autoFocus
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span className="truncate flex-1">{node.name}</span>
        )}

        {!isRenaming && (
          <div className="hidden group-hover:flex items-center gap-0.5 mr-1">
            {node.type === 'folder' && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddFile(node.id);
                  }}
                  className="p-0.5 rounded hover:bg-[#454545] text-[#858585] hover:text-[#cccccc]"
                  title="新建文件"
                >
                  <FilePlus size={12} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddFolder(node.id);
                  }}
                  className="p-0.5 rounded hover:bg-[#454545] text-[#858585] hover:text-[#cccccc]"
                  title="新建文件夹"
                >
                  <FolderPlus size={12} />
                </button>
              </>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsRenaming(true);
                setRenameValue(node.name);
              }}
              className="p-0.5 rounded hover:bg-[#454545] text-[#858585] hover:text-[#cccccc]"
              title="重命名"
            >
              <Pencil size={12} />
            </button>
            {node.id !== 'root' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(node.id);
                }}
                className="p-0.5 rounded hover:bg-[#454545] text-[#858585] hover:text-[#f44747]"
                title="删除"
              >
                <Trash2 size={12} />
              </button>
            )}
          </div>
        )}
      </div>

      {node.type === 'folder' && node.isOpen && node.children && (
        <div>
          {node.children.map((child) => (
            <FileTreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              activeFileId={activeFileId}
              onFileClick={onFileClick}
              onAddFile={onAddFile}
              onAddFolder={onAddFolder}
              onDelete={onDelete}
              onRename={onRename}
            />
          ))}
        </div>
      )}
    </div>
  );
}
