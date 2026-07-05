# lfx-duckduckgo — DuckDuckGo 搜索

DuckDuckGo 网页搜索引擎组件，作为独立的 Langflow 扩展包发布。

这是第一个从 `lfx.components.<provider>` 提取为独立分发的试点项目。本包包含单个组件 `DuckDuckGoSearchComponent`，通过 `langchain-community` 执行 DuckDuckGo 网页搜索。

## 安装

```bash
pip install lfx-duckduckgo
```

通过 `langflow.extensions` 入口点自动注册。安装后重启 Langflow 服务，`DuckDuckGoSearchComponent` 将出现在组件面板的 `duckduckgo` 分组中。

## 组件

| 组件 | 说明 |
|------|------|
| `DuckDuckGoSearchComponent` | 执行 DuckDuckGo 网页搜索，返回标题、摘要和链接 |

## 开发

```bash
cd src/bundles/duckduckgo
pip install -e .
lfx extension validate .
```

## 清单文件

扩展清单文件位于 `src/lfx_duckduckgo/extension.json`，指向 `components/duckduckgo` 目录。组件以规范的命名空间 ID 注册：`ext:duckduckgo:DuckDuckGoSearchComponent@official`。

## 迁移

已保存的工作流中引用的旧版类名 `DuckDuckGoSearchComponent` 或旧导入路径 `lfx.components.duckduckgo.duck_duck_go_search_run.DuckDuckGoSearchComponent` 会被迁移表自动重写为新的命名空间 ID。迁移表位于 `src/lfx/src/lfx/extension/migration/migration_table.json`。

## 相关文档

- [Bundle 开发指南](../README.md)
- [扩展包 API 契约](../../BUNDLE_API.md)
