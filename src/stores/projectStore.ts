import { create } from 'zustand';
import { FileNode } from '@/types';

const DEFAULT_HTML = `<div class="container">
  <h1>Hello World</h1>
  <p>Welcome to Web IDE</p>
</div>`;

const DEFAULT_CSS = `.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: system-ui, sans-serif;
}

h1 {
  color: #333;
  font-size: 2rem;
}

p {
  color: #666;
  line-height: 1.6;
}`;

const createDefaultFiles = (): FileNode[] => [
  {
    id: 'root',
    name: 'project',
    type: 'folder',
    parentId: null,
    isOpen: true,
    children: [
      {
        id: 'file-index',
        name: 'index.html',
        type: 'file',
        content: DEFAULT_HTML,
        language: 'html',
        parentId: 'root',
      },
      {
        id: 'file-style',
        name: 'styles.css',
        type: 'file',
        content: DEFAULT_CSS,
        language: 'css',
        parentId: 'root',
      },
    ],
  },
];

interface ProjectStore {
  name: string;
  files: FileNode[];
  activeFileId: string | null;
  setActiveFile: (id: string) => void;
  addFile: (parentId: string, file: FileNode) => void;
  addFolder: (parentId: string, name: string) => void;
  deleteNode: (id: string) => void;
  renameNode: (id: string, name: string) => void;
  updateFileContent: (id: string, content: string) => void;
  toggleFolder: (id: string) => void;
  getFileContent: (id: string) => string | undefined;
  getFileLanguage: (id: string) => 'html' | 'css' | 'javascript' | undefined;
  exportProject: () => string;
  getNodeById: (id: string, nodes?: FileNode[]) => FileNode | null;
  findParentId: (id: string, nodes?: FileNode[]) => string | null;
}

let fileIdCounter = 0;
const nextFileId = () => `file_${Date.now()}_${++fileIdCounter}`;

export const useProjectStore = create<ProjectStore>((set, get) => ({
  name: 'My Web Project',
  files: createDefaultFiles(),
  activeFileId: 'file-index',

  setActiveFile: (id) => set({ activeFileId: id }),

  addFile: (parentId, file) => {
    const newFile = { ...file, id: nextFileId(), parentId };
    set((state) => {
      const updatedFiles = addNodeToTree(state.files, parentId, newFile);
      return { files: updatedFiles };
    });
  },

  addFolder: (parentId, name) => {
    const newFolder: FileNode = {
      id: nextFileId(),
      name,
      type: 'folder',
      parentId,
      children: [],
      isOpen: true,
    };
    set((state) => {
      const updatedFiles = addNodeToTree(state.files, parentId, newFolder);
      return { files: updatedFiles };
    });
  },

  deleteNode: (id) => {
    if (id === 'root') return;
    set((state) => {
      const updatedFiles = removeNodeFromTree(state.files, id);
      const newActiveId = state.activeFileId === id ? 'file-index' : state.activeFileId;
      return { files: updatedFiles, activeFileId: newActiveId };
    });
  },

  renameNode: (id, name) => {
    set((state) => {
      const updatedFiles = renameNodeInTree(state.files, id, name);
      return { files: updatedFiles };
    });
  },

  updateFileContent: (id, content) => {
    set((state) => {
      const updatedFiles = updateNodeContent(state.files, id, content);
      return { files: updatedFiles };
    });
  },

  toggleFolder: (id) => {
    set((state) => {
      const updatedFiles = toggleFolderInTree(state.files, id);
      return { files: updatedFiles };
    });
  },

  getFileContent: (id) => {
    const node = get().getNodeById(id);
    return node?.content;
  },

  getFileLanguage: (id) => {
    const node = get().getNodeById(id);
    return node?.language;
  },

  exportProject: () => {
    const state = get();
    return JSON.stringify({ name: state.name, files: state.files }, null, 2);
  },

  getNodeById: (id, nodes) => {
    const searchNodes = nodes || get().files;
    for (const node of searchNodes) {
      if (node.id === id) return node;
      if (node.children) {
        const found = get().getNodeById(id, node.children);
        if (found) return found;
      }
    }
    return null;
  },

  findParentId: (id, nodes) => {
    const searchNodes = nodes || get().files;
    for (const node of searchNodes) {
      if (node.children?.some((child) => child.id === id)) {
        return node.id;
      }
      if (node.children) {
        const found = get().findParentId(id, node.children);
        if (found) return found;
      }
    }
    return null;
  },
}));

function addNodeToTree(nodes: FileNode[], parentId: string, newNode: FileNode): FileNode[] {
  return nodes.map((node) => {
    if (node.id === parentId) {
      return {
        ...node,
        children: [...(node.children || []), newNode],
      };
    }
    if (node.children) {
      return { ...node, children: addNodeToTree(node.children, parentId, newNode) };
    }
    return node;
  });
}

function removeNodeFromTree(nodes: FileNode[], targetId: string): FileNode[] {
  return nodes
    .filter((node) => node.id !== targetId)
    .map((node) => {
      if (node.children) {
        return { ...node, children: removeNodeFromTree(node.children, targetId) };
      }
      return node;
    });
}

function renameNodeInTree(nodes: FileNode[], targetId: string, newName: string): FileNode[] {
  return nodes.map((node) => {
    if (node.id === targetId) {
      return { ...node, name: newName };
    }
    if (node.children) {
      return { ...node, children: renameNodeInTree(node.children, targetId, newName) };
    }
    return node;
  });
}

function updateNodeContent(nodes: FileNode[], targetId: string, content: string): FileNode[] {
  return nodes.map((node) => {
    if (node.id === targetId) {
      return { ...node, content };
    }
    if (node.children) {
      return { ...node, children: updateNodeContent(node.children, targetId, content) };
    }
    return node;
  });
}

function toggleFolderInTree(nodes: FileNode[], targetId: string): FileNode[] {
  return nodes.map((node) => {
    if (node.id === targetId && node.type === 'folder') {
      return { ...node, isOpen: !node.isOpen };
    }
    if (node.children) {
      return { ...node, children: toggleFolderInTree(node.children, targetId) };
    }
    return node;
  });
}
