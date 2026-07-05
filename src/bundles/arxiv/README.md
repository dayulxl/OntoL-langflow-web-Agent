# lfx-arxiv — arXiv 学术搜索

arXiv 学术论文搜索组件，作为独立的 Langflow 扩展包发布。

这是第二个验证 [`src/bundles/PORTING.md`](../PORTING.md) 的试点移植项目，该文档记录了将内置提供商提取为独立 Bundle 的标准流程。本包包含单个组件 `ArXivComponent`，通过 arXiv 的公开 Atom API 查询论文元数据。

## 安装

```bash
pip install lfx-arxiv
```

通过 `langflow.extensions` 入口点自动注册。安装后重启 Langflow 服务，`ArXivComponent` 将出现在组件面板的 `arxiv` 分组中。

## 组件

| 组件 | 说明 |
|------|------|
| `ArXivComponent` | 查询 arXiv 论文元数据（标题、作者、摘要、链接） |

## 开发

```bash
cd src/bundles/arxiv
pip install -e .
lfx extension validate .
```

## 清单文件

扩展清单文件位于 `src/lfx_arxiv/extension.json`，指向 `components/arxiv` 目录。组件以规范的命名空间 ID 注册：`ext:arxiv:ArXivComponent@official`。

## 迁移

已保存的工作流中引用的旧版类名 `ArXivComponent` 或旧导入路径（`lfx.components.arxiv.arxiv.ArXivComponent` / `lfx.components.arxiv.ArXivComponent`）会被迁移表自动重写为新的命名空间 ID。迁移表位于 `src/lfx/src/lfx/extension/migration/migration_table.json`。

## 相关文档

- [Bundle 开发指南](../README.md)
- [扩展包 API 契约](../../BUNDLE_API.md)
