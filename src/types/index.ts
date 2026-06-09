export interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  content?: string;
  language?: 'html' | 'css' | 'javascript';
  children?: FileNode[];
  parentId: string | null;
  isOpen?: boolean;
}

export interface ElementNode {
  id: string;
  tag: string;
  attributes: Record<string, string>;
  styles: Record<string, string>;
  children: ElementNode[];
  parentId: string | null;
  textContent?: string;
}

export type EditorMode = 'visual' | 'code' | 'split';

export interface ComponentTemplate {
  tag: string;
  label: string;
  icon: string;
  category: string;
  defaultContent?: string;
  defaultStyles?: Record<string, string>;
  defaultAttributes?: Record<string, string>;
}

export interface PanelSize {
  left: number;
  right: number;
  bottom: number;
}

export interface DragData {
  type: 'new-component' | 'move-element';
  componentTag?: string;
  elementId?: string;
}

declare global {
  interface Window {
    __ideDragData: DragData | null;
  }
}
