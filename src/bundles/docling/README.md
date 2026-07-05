# lfx-docling — Docling 文档解析

IBM Docling 文档解析与转换组件，作为独立的 Langflow 扩展包发布。

## 组件

| 组件 | 说明 |
|------|------|
| Docling | 文档格式转换（PDF、DOCX、PPTX 等 → Markdown/JSON） |
| Docling Serve | Docling 服务器连接组件 |
| Export DoclingDocument | 导出 Docling 文档对象 |
| Chunk DoclingDocument | 文档分块处理 |

## 安装

本包在 Langflow 1.10 工作区中随主包一起安装。基础包包含 `docling-core` 用于 `DoclingDocument` Schema。如需本地独立文档转换：

```bash
uv pip install "lfx-docling[local]"
```

分块和图片描述功能使用独立的可选依赖。分块功能不安装完整的本地转换器/OCR 栈：

```bash
uv pip install "lfx-docling[chunking]"
uv pip install "lfx-docling[image-description]"
```

## 开发

```bash
uv run lfx extension validate src/bundles/docling/src/lfx_docling
uv run pytest src/bundles/docling/tests
```

## 相关文档

- [Bundle 开发指南](../README.md)
- [扩展包 API 契约](../../BUNDLE_API.md)
