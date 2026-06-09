import { create } from 'zustand';
import { ElementNode, EditorMode } from '@/types';
import {
  generateFullHtml,
  htmlToTree,
  elementToHtml,
  generateId,
  resetIdCounter,
} from '@/utils/htmlGenerator';

const INITIAL_HTML = `<div class="container">
  <h1>Hello World</h1>
  <p>Welcome to Web IDE</p>
</div>`;

const INITIAL_CSS = `.container {
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

interface EditorStore {
  mode: EditorMode;
  selectedElementId: string | null;
  htmlContent: string;
  cssContent: string;
  domTree: ElementNode;
  zoom: number;
  undoStack: { html: string; css: string }[];
  redoStack: { html: string; css: string }[];
  isSyncingFromHtml: boolean;
  previewHtml: string;

  setMode: (mode: EditorMode) => void;
  selectElement: (id: string | null) => void;
  getSelectedElement: () => ElementNode | null;
  updateHtmlContent: (content: string) => void;
  updateCssContent: (content: string) => void;
  syncDomFromHtml: () => void;
  syncHtmlFromDom: () => void;
  addElement: (parentId: string, tag: string, index?: number) => void;
  updateElement: (id: string, updates: Partial<ElementNode>) => void;
  updateElementStyle: (id: string, property: string, value: string) => void;
  deleteElement: (id: string) => void;
  moveElement: (id: string, newParentId: string, index: number) => void;
  setZoom: (zoom: number) => void;
  undo: () => void;
  redo: () => void;
  pushUndo: () => void;
  updatePreview: () => void;
  findElementById: (id: string, node?: ElementNode) => ElementNode | null;
  reset: (html?: string, css?: string) => void;
}

export const useEditorStore = create<EditorStore>((set, get) => ({
  mode: 'split',
  selectedElementId: null,
  htmlContent: INITIAL_HTML,
  cssContent: INITIAL_CSS,
  domTree: htmlToTree(INITIAL_HTML),
  zoom: 100,
  undoStack: [],
  redoStack: [],
  isSyncingFromHtml: false,
  previewHtml: generateFullHtml(htmlToTree(INITIAL_HTML), INITIAL_CSS),

  setMode: (mode) => set({ mode }),

  selectElement: (id) => set({ selectedElementId: id }),

  getSelectedElement: () => {
    const state = get();
    if (!state.selectedElementId) return null;
    return state.findElementById(state.selectedElementId);
  },

  updateHtmlContent: (content) => {
    const state = get();
    if (state.isSyncingFromHtml) return;
    set({ htmlContent: content });
  },

  updateCssContent: (content) => {
    set({ cssContent: content });
  },

  syncDomFromHtml: () => {
    const state = get();
    set({ isSyncingFromHtml: true });
    try {
      const tree = htmlToTree(state.htmlContent);
      const previewHtml = generateFullHtml(tree, state.cssContent);
      set({ domTree: tree, previewHtml, isSyncingFromHtml: false });
    } catch {
      set({ isSyncingFromHtml: false });
    }
  },

  syncHtmlFromDom: () => {
    const state = get();
    const html = state.domTree.children
      .map((child) => elementToHtml(child, 0))
      .join('\n');
    const previewHtml = generateFullHtml(state.domTree, state.cssContent);
    set({ htmlContent: html, previewHtml });
  },

  addElement: (parentId, tag, index) => {
    set((state) => {
      const newElement: ElementNode = {
        id: generateId(),
        tag,
        attributes: {},
        styles: {},
        children: [],
        parentId,
      };

      if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'a', 'button', 'label', 'li', 'td', 'th', 'figcaption', 'summary', 'option', 'strong', 'em', 'blockquote', 'code', 'pre'].includes(tag)) {
        newElement.textContent = getPlaceholderText(tag);
      }

      const updatedTree = addElementToTree(state.domTree, parentId, newElement, index);
      const html = updatedTree.children.map((child) => elementToHtml(child, 0)).join('\n');
      const previewHtml = generateFullHtml(updatedTree, state.cssContent);
      return {
        domTree: updatedTree,
        htmlContent: html,
        previewHtml,
        selectedElementId: newElement.id,
      };
    });
  },

  updateElement: (id, updates) => {
    set((state) => {
      const updatedTree = updateElementInTree(state.domTree, id, updates);
      const html = updatedTree.children.map((child) => elementToHtml(child, 0)).join('\n');
      const previewHtml = generateFullHtml(updatedTree, state.cssContent);
      return { domTree: updatedTree, htmlContent: html, previewHtml };
    });
  },

  updateElementStyle: (id, property, value) => {
    set((state) => {
      const updatedTree = updateElementStyleInTree(state.domTree, id, property, value);
      const html = updatedTree.children.map((child) => elementToHtml(child, 0)).join('\n');
      const previewHtml = generateFullHtml(updatedTree, state.cssContent);
      return { domTree: updatedTree, htmlContent: html, previewHtml };
    });
  },

  deleteElement: (id) => {
    if (id === 'root') return;
    set((state) => {
      const updatedTree = removeElementFromTree(state.domTree, id);
      const html = updatedTree.children.map((child) => elementToHtml(child, 0)).join('\n');
      const previewHtml = generateFullHtml(updatedTree, state.cssContent);
      return {
        domTree: updatedTree,
        htmlContent: html,
        previewHtml,
        selectedElementId: null,
      };
    });
  },

  moveElement: (id, newParentId, index) => {
    set((state) => {
      let element: ElementNode | null = null;
      let tempTree = removeElementFromTree(state.domTree, id);
      const found = findAndExtract(state.domTree, id);
      if (found) {
        element = found;
        tempTree = removeElementFromTree(state.domTree, id);
        element = { ...element, parentId: newParentId };
        tempTree = addElementToTree(tempTree, newParentId, element, index);
      }
      const html = tempTree.children.map((child) => elementToHtml(child, 0)).join('\n');
      const previewHtml = generateFullHtml(tempTree, state.cssContent);
      return { domTree: tempTree, htmlContent: html, previewHtml };
    });
  },

  setZoom: (zoom) => set({ zoom }),

  undo: () => {
    set((state) => {
      if (state.undoStack.length === 0) return state;
      const current = { html: state.htmlContent, css: state.cssContent };
      const previous = state.undoStack[state.undoStack.length - 1];
      const newUndoStack = state.undoStack.slice(0, -1);
      const tree = htmlToTree(previous.html);
      const previewHtml = generateFullHtml(tree, previous.css);
      resetIdCounter();
      return {
        htmlContent: previous.html,
        cssContent: previous.css,
        domTree: tree,
        previewHtml,
        undoStack: newUndoStack,
        redoStack: [...state.redoStack, current],
      };
    });
  },

  redo: () => {
    set((state) => {
      if (state.redoStack.length === 0) return state;
      const current = { html: state.htmlContent, css: state.cssContent };
      const next = state.redoStack[state.redoStack.length - 1];
      const newRedoStack = state.redoStack.slice(0, -1);
      const tree = htmlToTree(next.html);
      const previewHtml = generateFullHtml(tree, next.css);
      resetIdCounter();
      return {
        htmlContent: next.html,
        cssContent: next.css,
        domTree: tree,
        previewHtml,
        undoStack: [...state.undoStack, current],
        redoStack: newRedoStack,
      };
    });
  },

  pushUndo: () => {
    set((state) => ({
      undoStack: [...state.undoStack, { html: state.htmlContent, css: state.cssContent }],
      redoStack: [],
    }));
  },

  updatePreview: () => {
    const state = get();
    const previewHtml = generateFullHtml(state.domTree, state.cssContent);
    set({ previewHtml });
  },

  findElementById: (id, node) => {
    const searchNode = node || get().domTree;
    if (searchNode.id === id) return searchNode;
    for (const child of searchNode.children) {
      const found = get().findElementById(id, child);
      if (found) return found;
    }
    return null;
  },

  reset: (html, css) => {
    const h = html || INITIAL_HTML;
    const c = css || INITIAL_CSS;
    const tree = htmlToTree(h);
    const previewHtml = generateFullHtml(tree, c);
    resetIdCounter();
    set({
      htmlContent: h,
      cssContent: c,
      domTree: tree,
      previewHtml,
      undoStack: [],
      redoStack: [],
    });
  },
}));

function addElementToTree(
  node: ElementNode,
  parentId: string,
  newElement: ElementNode,
  index?: number
): ElementNode {
  if (node.id === parentId) {
    const children = [...node.children];
    if (index !== undefined && index >= 0 && index <= children.length) {
      children.splice(index, 0, newElement);
    } else {
      children.push(newElement);
    }
    return { ...node, children };
  }
  return {
    ...node,
    children: node.children.map((child) => addElementToTree(child, parentId, newElement, index)),
  };
}

function updateElementInTree(
  node: ElementNode,
  targetId: string,
  updates: Partial<ElementNode>
): ElementNode {
  if (node.id === targetId) {
    return { ...node, ...updates };
  }
  return {
    ...node,
    children: node.children.map((child) => updateElementInTree(child, targetId, updates)),
  };
}

function updateElementStyleInTree(
  node: ElementNode,
  targetId: string,
  property: string,
  value: string
): ElementNode {
  if (node.id === targetId) {
    if (value === '') {
      const newStyles = { ...node.styles };
      delete newStyles[property];
      return { ...node, styles: newStyles };
    }
    return { ...node, styles: { ...node.styles, [property]: value } };
  }
  return {
    ...node,
    children: node.children.map((child) => updateElementStyleInTree(child, targetId, property, value)),
  };
}

function removeElementFromTree(node: ElementNode, targetId: string): ElementNode {
  return {
    ...node,
    children: node.children
      .filter((child) => child.id !== targetId)
      .map((child) => removeElementFromTree(child, targetId)),
  };
}

function findAndExtract(node: ElementNode, targetId: string): ElementNode | null {
  for (const child of node.children) {
    if (child.id === targetId) return { ...child, children: [...child.children] };
    const found = findAndExtract(child, targetId);
    if (found) return found;
  }
  return null;
}

function getPlaceholderText(tag: string): string {
  const map: Record<string, string> = {
    h1: 'Heading 1',
    h2: 'Heading 2',
    h3: 'Heading 3',
    h4: 'Heading 4',
    h5: 'Heading 5',
    h6: 'Heading 6',
    p: 'Paragraph text',
    span: 'span',
    a: 'Link',
    button: 'Button',
    label: 'Label',
    li: 'List item',
    td: 'Cell',
    th: 'Header',
    strong: 'Bold text',
    em: 'Italic text',
    blockquote: 'Blockquote',
    code: 'code',
    pre: 'Preformatted text',
    figcaption: 'Caption',
    summary: 'Summary',
    option: 'Option',
  };
  return map[tag] || tag;
}
