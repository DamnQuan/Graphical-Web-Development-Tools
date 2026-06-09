import { ElementNode } from '@/types';

export function elementToHtml(element: ElementNode, indent = 0): string {
  const spaces = '  '.repeat(indent);
  const voidElements = ['img', 'input', 'br', 'hr', 'meta', 'link', 'area', 'base', 'col', 'embed', 'source', 'track', 'wbr'];

  const isVoid = voidElements.includes(element.tag);

  let attrs = '';
  for (const [key, value] of Object.entries(element.attributes)) {
    if (value) {
      attrs += ` ${key}="${escapeHtml(value)}"`;
    } else {
      attrs += ` ${key}`;
    }
  }

  if (Object.keys(element.styles).length > 0) {
    const styleStr = Object.entries(element.styles)
      .map(([k, v]) => `${k}: ${v}`)
      .join('; ');
    attrs += ` style="${styleStr}"`;
  }

  if (isVoid) {
    return `${spaces}<${element.tag}${attrs} />`;
  }

  const hasChildren = element.children.length > 0;
  const hasText = element.textContent && element.textContent.trim().length > 0;

  if (!hasChildren && !hasText) {
    return `${spaces}<${element.tag}${attrs}></${element.tag}>`;
  }

  if (hasText && !hasChildren) {
    return `${spaces}<${element.tag}${attrs}>${escapeHtml(element.textContent || '')}</${element.tag}>`;
  }

  if (hasChildren && !hasText) {
    const childrenHtml = element.children.map((child) => elementToHtml(child, indent + 1)).join('\n');
    return `${spaces}<${element.tag}${attrs}>\n${childrenHtml}\n${spaces}</${element.tag}>`;
  }

  const childrenHtml = element.children.map((child) => elementToHtml(child, indent + 1)).join('\n');
  return `${spaces}<${element.tag}${attrs}>\n${spaces}  ${escapeHtml(element.textContent || '')}\n${childrenHtml}\n${spaces}</${element.tag}>`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function generateFullHtml(domTree: ElementNode | null, cssContent: string): string {
  if (!domTree) return '';

  const bodyContent = domTree.children.map((child) => elementToHtml(child, 2)).join('\n');

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Preview</title>
  <style>
${cssContent.split('\n').map((line) => '    ' + line).join('\n')}
  </style>
</head>
<body>
${bodyContent}
</body>
</html>`;
}

export function htmlToTree(html: string): ElementNode {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const body = doc.body;

  function parseElement(el: Element, parentId: string | null = null): ElementNode {
    const id = generateId();
    const tag = el.tagName.toLowerCase();

    const attributes: Record<string, string> = {};
    el.getAttributeNames().forEach((name) => {
      if (name !== 'style' && name !== 'data-element-id') {
        attributes[name] = el.getAttribute(name) || '';
      }
    });

    const styles: Record<string, string> = {};
    const styleAttr = el.getAttribute('style');
    if (styleAttr) {
      styleAttr.split(';').forEach((rule) => {
        const [key, value] = rule.split(':').map((s) => s.trim());
        if (key && value) {
          const camelKey = key.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
          styles[camelKey] = value;
        }
      });
    }

    const children: ElementNode[] = [];
    let textContent: string | undefined;

    el.childNodes.forEach((node) => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        children.push(parseElement(node as Element, id));
      } else if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent?.trim();
        if (text) {
          textContent = text;
        }
      }
    });

    return {
      id,
      tag,
      attributes,
      styles,
      children,
      parentId,
      textContent,
    };
  }

  const tree: ElementNode = {
    id: 'root',
    tag: 'body',
    attributes: {},
    styles: {},
    children: [],
    parentId: null,
  };

  Array.from(body.children).forEach((el) => {
    tree.children.push(parseElement(el, 'root'));
  });

  return tree;
}

let idCounter = 0;

export function generateId(): string {
  return `el_${Date.now()}_${++idCounter}`;
}

export function resetIdCounter(): void {
  idCounter = 0;
}

export function collectStyles(element: ElementNode): string[] {
  const rules: string[] = [];

  for (const [prop, value] of Object.entries(element.styles)) {
    const cssProp = prop.replace(/([A-Z])/g, '-$1').toLowerCase();
    rules.push(`  ${cssProp}: ${value};`);
  }

  return rules;
}
