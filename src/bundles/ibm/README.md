# lfx-ibm — IBM Watsonx 集成

IBM 组件包——包含 Db2 向量存储、watsonx.ai 大语言模型和嵌入模型——作为独立的 Langflow 扩展包发布。

本包包含三个组件，遵循 [`src/bundles/PORTING.md`](../PORTING.md) 中记录的移植指南。

## 组件

| 组件 | 说明 |
|------|------|
| `DB2VectorStoreComponent` | 封装 `DB2VS` LangChain 兼容向量存储，通过 Langflow 标准向量存储面板暴露 Db2 原生向量搜索 |
| `WatsonxAIComponent` | 通过 `langchain-ibm` 的 `ChatWatsonx` 使用 IBM watsonx.ai 基础模型进行对话/文本生成 |
| `WatsonxEmbeddingsComponent` | 通过 watsonx.ai 的 `WatsonxEmbeddings` 模型生成文本嵌入向量 |

## 安装

```bash
pip install lfx-ibm
```

通过 `langflow.extensions` 入口点自动注册。安装后重启 Langflow 服务，三个组件将出现在组件面板的 `ibm` 分组中。

> **平台说明：**
> * `ibm-db` 驱动不提供 `linux/aarch64` 的预编译包；该依赖通过标记条件化，因此 `pip install` 在该架构上可以成功，但 `DB2VectorStoreComponent` 在运行时构建向量存储会失败。如需在 aarch64 上使用 Db2，请使用 x86_64 镜像或从源码安装 `ibm-db`。
> * `ibm-watsonx-ai` (>=1.5.13) 和 `langchain-ibm` (>=1.1.0) 上游新增了 Python 3.14 支持，因此 watsonx 组件在所有支持的 Python 版本（3.10-3.14）上均可导入。

## 开发

```bash
cd src/bundles/ibm
pip install -e .
lfx extension validate src/lfx_ibm
```

## 清单文件

扩展清单文件位于 `src/lfx_ibm/extension.json`，指向 `components/ibm` 目录。组件以规范的命名空间 ID 注册：

* `ext:ibm:DB2VectorStoreComponent@official`
* `ext:ibm:WatsonxAIComponent@official`
* `ext:ibm:WatsonxEmbeddingsComponent@official`

## 迁移

已保存的工作流中引用的旧版裸类名（`DB2VectorStoreComponent`、`WatsonxAIComponent`、`WatsonxEmbeddingsComponent`）或旧导入路径会被迁移表自动重写为新的命名空间 ID。迁移表位于 `src/lfx/src/lfx/extension/migration/migration_table.json`。

## 相关文档

- [Bundle 开发指南](../README.md)
- [扩展包 API 契约](../../BUNDLE_API.md)
