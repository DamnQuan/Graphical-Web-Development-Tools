# Web IDE — 图形化 Web 开发工具

一款运行在浏览器中的图形化 Web 开发 IDE，支持可视化拖拽 + 代码编辑双模式，所见即所得地构建 HTML/CSS 页面。

## 功能

- **三种编辑模式** — 可视化 / 代码 / 拆分视图，一键切换
- **拖拽组件面板** — 40+ HTML 元素分 6 大分类，拖拽即用
- **WYSIWYG 可视化画布** — 拖拽移动、8 控制手柄调整大小、右键菜单
- **Monaco 代码编辑器** — VS Code 同款内核，HTML/CSS 语法高亮
- **双向同步** — 可视化编辑自动更新代码，代码编辑自动渲染画布
- **属性面板** — 可视化编辑元素属性、样式、布局（Flex/Grid）
- **文件管理** — 文件树新建/重命名/删除，支持 HTML/CSS 文件
- **导入/导出** — 导入本地 HTML 文件、导出为完整 HTML
- **撤销/重做** — 完整历史栈
- **画布缩放** — 25% ~ 200% 无极缩放

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | React 18 + TypeScript |
| 构建 | Vite 6 |
| 样式 | Tailwind CSS 3 |
| 状态管理 | Zustand |
| 代码编辑器 | Monaco Editor |
| 图标 | Lucide React |

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview

# 类型检查
npm run check
```

启动后访问 **http://localhost:5173**

## 项目结构

```
src/
├── types/index.ts            # 核心类型定义
├── stores/
│   ├── projectStore.ts       # 项目文件系统状态
│   ├── editorStore.ts        # 编辑器状态 + DOM 同步
│   └── uiLayoutStore.ts      # 面板布局状态
├── utils/
│   └── htmlGenerator.ts      # HTML ↔ DOM 树 解析/序列化
└── components/
    ├── MainLayout.tsx         # 主布局（可拖拽面板）
    ├── Toolbar.tsx            # 顶部工具栏
    ├── FileExplorer.tsx       # 文件资源管理器
    ├── ComponentPalette.tsx   # 组件拖拽面板
    ├── VisualEditor.tsx       # WYSIWYG 可视化编辑器
    ├── CodeEditor.tsx         # Monaco 代码编辑器
    ├── PropertyPanel.tsx      # 属性/样式/布局面板
    └── StatusBar.tsx          # 底部状态栏
```
