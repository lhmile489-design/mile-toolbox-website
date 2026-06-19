/**
 * 后端文件类工具配置（PDF 五件套 + image-convert）。
 * 对接文档：前台-PDF文件工具-对接文档.md、前台-后端工具处理-对接文档.md §1.6。
 * 统一为 multipart 上传、同步返回结果文件流，由 PdfToolRunner 通用渲染。
 * 一个 toolKey 可有多个 operation（如 pdf-image 含「PDF→图片」「图片→PDF」两个方向）。
 * field.type: 'file' | 'files' | 'text' | 'password' | 'number' | 'select'
 * field.labelKey / placeholderKey 映射到 translations.pdf.fields.*
 */
export const PDF_TOOLS = {
  'pdf-merge': {
    operations: [
      {
        key: 'merge',
        endpoint: '/pdf/merge',
        download: 'merged.pdf',
        fields: [
          { name: 'files', type: 'files', accept: 'application/pdf,.pdf', min: 2, max: 20, required: true },
        ],
      },
    ],
  },
  'pdf-split': {
    operations: [
      {
        key: 'split',
        endpoint: '/pdf/split',
        download: 'split.pdf',
        fields: [
          { name: 'file', type: 'file', accept: 'application/pdf,.pdf', required: true },
          { name: 'range', type: 'text', required: true, labelKey: 'range', placeholderKey: 'rangePh' },
        ],
      },
    ],
  },
  'pdf-watermark': {
    operations: [
      {
        key: 'watermark',
        endpoint: '/pdf/watermark',
        download: 'watermarked.pdf',
        fields: [
          { name: 'file', type: 'file', accept: 'application/pdf,.pdf', required: true },
          { name: 'text', type: 'text', required: true, labelKey: 'wmText', placeholderKey: 'wmTextPh' },
        ],
      },
    ],
  },
  'pdf-encrypt': {
    operations: [
      {
        key: 'encrypt',
        endpoint: '/pdf/encrypt',
        download: 'encrypted.pdf',
        fields: [
          { name: 'file', type: 'file', accept: 'application/pdf,.pdf', required: true },
          { name: 'password', type: 'password', required: true, labelKey: 'pwd', placeholderKey: 'pwdPh' },
        ],
      },
    ],
  },
  'pdf-image': {
    operations: [
      {
        key: 'to-image',
        endpoint: '/pdf/to-image',
        download: 'pdf-images.zip',
        fields: [
          { name: 'file', type: 'file', accept: 'application/pdf,.pdf', required: true },
          { name: 'dpi', type: 'number', min: 72, max: 300, def: 150, labelKey: 'dpi' },
        ],
      },
      {
        key: 'from-image',
        endpoint: '/pdf/from-image',
        download: 'images.pdf',
        fields: [
          {
            name: 'files',
            type: 'files',
            accept: 'image/png,image/jpeg,.png,.jpg,.jpeg',
            min: 1,
            max: 20,
            required: true,
          },
        ],
      },
    ],
  },
  // 图片格式转换（后端 /image/convert）
  'image-convert': {
    operations: [
      {
        key: 'convert',
        endpoint: '/image/convert',
        download: 'converted',
        fields: [
          { name: 'file', type: 'file', accept: 'image/*', required: true },
          {
            name: 'format',
            type: 'select',
            def: 'png',
            labelKey: 'format',
            options: [
              { value: 'png', label: 'PNG' },
              { value: 'jpg', label: 'JPG' },
              { value: 'jpeg', label: 'JPEG' },
              { value: 'bmp', label: 'BMP' },
              { value: 'gif', label: 'GIF' },
            ],
          },
          { name: 'quality', type: 'number', min: 0.1, max: 1, step: 0.1, def: 0.9, labelKey: 'quality' },
        ],
      },
    ],
  },
  // 文档转换（后端 /doc/convert，Pandoc；→PDF 暂不支持）
  'doc-convert': {
    operations: [
      {
        key: 'convert',
        endpoint: '/doc/convert',
        download: 'converted',
        fields: [
          {
            name: 'file',
            type: 'file',
            accept: '.doc,.docx,.md,.markdown,.html,.htm,.txt,.odt,.rtf,.epub',
            required: true,
          },
          {
            name: 'format',
            type: 'select',
            def: 'md',
            labelKey: 'format',
            options: [
              { value: 'md', label: 'Markdown' },
              { value: 'html', label: 'HTML' },
              { value: 'docx', label: 'Word (docx)' },
              { value: 'txt', label: 'TXT' },
            ],
          },
        ],
      },
    ],
  },
};

export function isPdfTool(toolKey) {
  return Object.prototype.hasOwnProperty.call(PDF_TOOLS, toolKey);
}
