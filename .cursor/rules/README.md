# Cursor 编辑器配置

本目录包含 Cursor 编辑器的项目级配置和规则。

## 规则文件

### `docs_development.mdc`

文档开发规则，定义了在更新或创建文档时需要遵循的规范：

- 文档使用 Docusaurus 构建
- 文档文件位于 `docs/` 目录
- 遵循 Markdown 最佳实践
- 确保链接有效且格式正确

## 目录结构

```
.cursor/
└── rules/               # Cursor 规则
    ├── README.md        # 本文档
    └── *.mdc            # 规则文件（MDC 格式）
```

## 说明

Cursor 的规则文件（.mdc 格式）会在编辑匹配的文件类型时自动加载，为 AI 编码助手提供项目特定的指令和约束。

## 相关文档

- [开发环境搭建](../../DEVELOPMENT.md)
- [文档贡献指南](../../docs/README.md)
