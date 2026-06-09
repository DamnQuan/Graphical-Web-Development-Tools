import { useEditorStore } from '@/stores/editorStore';
import { ComponentTemplate } from '@/types';
import {
  Layout,
  Type,
  MousePointer,
  Image,
  List,
  Table,
  FormInput,
} from 'lucide-react';

const categories: { name: string; icon: React.ReactNode; components: ComponentTemplate[] }[] = [
  {
    name: '布局容器',
    icon: <Layout size={14} />,
    components: [
      { tag: 'div', label: 'Div 容器', icon: 'Layout', category: '布局容器' },
      { tag: 'section', label: 'Section', icon: 'Layout', category: '布局容器' },
      { tag: 'header', label: 'Header', icon: 'Layout', category: '布局容器' },
      { tag: 'footer', label: 'Footer', icon: 'Layout', category: '布局容器' },
      { tag: 'nav', label: 'Nav 导航', icon: 'Layout', category: '布局容器' },
      { tag: 'main', label: 'Main 主体', icon: 'Layout', category: '布局容器' },
      { tag: 'article', label: 'Article', icon: 'Layout', category: '布局容器' },
      { tag: 'aside', label: 'Aside 侧栏', icon: 'Layout', category: '布局容器' },
    ],
  },
  {
    name: '文本内容',
    icon: <Type size={14} />,
    components: [
      { tag: 'h1', label: 'H1 标题', icon: 'Type', category: '文本内容' },
      { tag: 'h2', label: 'H2 标题', icon: 'Type', category: '文本内容' },
      { tag: 'h3', label: 'H3 标题', icon: 'Type', category: '文本内容' },
      { tag: 'p', label: 'P 段落', icon: 'Type', category: '文本内容' },
      { tag: 'span', label: 'Span', icon: 'Type', category: '文本内容' },
      { tag: 'a', label: 'A 链接', icon: 'Type', category: '文本内容' },
      { tag: 'strong', label: 'Strong 加粗', icon: 'Type', category: '文本内容' },
      { tag: 'em', label: 'Em 斜体', icon: 'Type', category: '文本内容' },
      { tag: 'blockquote', label: '引用', icon: 'Type', category: '文本内容' },
      { tag: 'code', label: 'Code', icon: 'Type', category: '文本内容' },
      { tag: 'pre', label: 'Pre', icon: 'Type', category: '文本内容' },
    ],
  },
  {
    name: '表单元素',
    icon: <FormInput size={14} />,
    components: [
      { tag: 'form', label: 'Form 表单', icon: 'FormInput', category: '表单元素' },
      { tag: 'input', label: 'Input 输入框', icon: 'FormInput', category: '表单元素' },
      { tag: 'textarea', label: 'Textarea', icon: 'FormInput', category: '表单元素' },
      { tag: 'button', label: 'Button 按钮', icon: 'MousePointer', category: '表单元素' },
      { tag: 'select', label: 'Select', icon: 'FormInput', category: '表单元素' },
      { tag: 'label', label: 'Label', icon: 'FormInput', category: '表单元素' },
    ],
  },
  {
    name: '媒体元素',
    icon: <Image size={14} />,
    components: [
      { tag: 'img', label: 'Img 图片', icon: 'Image', category: '媒体元素' },
      { tag: 'video', label: 'Video 视频', icon: 'Image', category: '媒体元素' },
      { tag: 'figure', label: 'Figure', icon: 'Image', category: '媒体元素' },
      { tag: 'figcaption', label: 'Figcaption', icon: 'Image', category: '媒体元素' },
    ],
  },
  {
    name: '列表元素',
    icon: <List size={14} />,
    components: [
      { tag: 'ul', label: 'UL 无序列表', icon: 'List', category: '列表元素' },
      { tag: 'ol', label: 'OL 有序列表', icon: 'List', category: '列表元素' },
      { tag: 'li', label: 'LI 列表项', icon: 'List', category: '列表元素' },
    ],
  },
  {
    name: '表格元素',
    icon: <Table size={14} />,
    components: [
      { tag: 'table', label: 'Table 表格', icon: 'Table', category: '表格元素' },
      { tag: 'thead', label: 'THead', icon: 'Table', category: '表格元素' },
      { tag: 'tbody', label: 'TBody', icon: 'Table', category: '表格元素' },
      { tag: 'tr', label: 'TR 行', icon: 'Table', category: '表格元素' },
      { tag: 'th', label: 'TH 表头', icon: 'Table', category: '表格元素' },
      { tag: 'td', label: 'TD 单元格', icon: 'Table', category: '表格元素' },
    ],
  },
];

export default function ComponentPalette() {
  const domTree = useEditorStore((s) => s.domTree);

  const handleDragStart = (e: React.DragEvent, tag: string) => {
    e.dataTransfer.setData('text/plain', tag);
    e.dataTransfer.setData('application/ide-component', tag);
    e.dataTransfer.effectAllowed = 'copy';
    window.__ideDragData = { type: 'new-component', componentTag: tag };
  };

  return (
    <div className="flex flex-col h-full text-[13px] overflow-y-auto">
      <div className="px-2 py-1 text-[11px] font-semibold text-[#bbbbbb] uppercase tracking-wide shrink-0">
        组件面板
      </div>

      {categories.map((cat) => (
        <div key={cat.name} className="mb-1">
          <div className="flex items-center gap-1.5 px-2 py-1 text-[11px] text-[#858585] font-semibold">
            {cat.icon}
            <span>{cat.name}</span>
          </div>
          <div className="grid grid-cols-2 gap-0.5 px-1">
            {cat.components.map((comp) => (
              <div
                key={comp.tag}
                draggable
                onDragStart={(e) => handleDragStart(e, comp.tag)}
                className="flex items-center gap-1.5 px-2 py-1.5 rounded cursor-grab hover:bg-[#2a2d2e] text-[#cccccc] active:cursor-grabbing active:bg-[#37373d] transition-colors"
                title={`拖拽 ${comp.label} 到画布`}
              >
                <span className="text-[11px] text-[#569cd6] font-mono">&lt;{comp.tag}&gt;</span>
                <span className="text-[11px] text-[#858585] truncate">{comp.label}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
