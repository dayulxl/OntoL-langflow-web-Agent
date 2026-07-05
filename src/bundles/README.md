# Langflow 扩展组件包（Extension Bundles）

本目录包含 Langflow 的独立扩展组件包。每个包以单独的 Python 包形式发布，通过 `langflow.extensions` 入口点自动注册到 Langflow。

## 现有 Bundle

| Bundle | 包名 | 组件数 | 说明 |
|--------|------|--------|------|
| [arXiv](arxiv/) | `lfx-arxiv` | 1 | arXiv 学术论文搜索组件 |
| [Docling](docling/) | `lfx-docling` | 1 | IBM Docling 文档解析组件 |
| [DuckDuckGo](duckduckgo/) | `lfx-duckduckgo` | 1 | DuckDuckGo 搜索引擎组件 |
| [IBM](ibm/) | `lfx-ibm` | 3 | IBM Watsonx AI + Db2 向量存储组件 |

## 目录结构

每个 Bundle 遵循统一的结构：

```
src/bundles/{name}/
├── README.md                    # Bundle 说明文档
├── pyproject.toml               # Python 包配置
├── src/{package_name}/          # 包代码
│   ├── __init__.py
│   ├── extension.json           # 扩展清单文件
│   └── components/              # 组件模块
│       └── {category}/          # 按类别组织
└── tests/                       # 测试代码
```

## 安装与使用

```bash
# 安装单个 Bundle
pip install lfx-arxiv

# 重启 Langflow 后，组件自动出现在面板中
```

## 开发 Bundle

```bash
# 创建新 Bundle
cd src/bundles
mkdir my-bundle
cp arxiv/pyproject.toml my-bundle/
# 编辑配置并编写组件代码

# 验证 Bundle
cd my-bundle
pip install -e .
lfx extension validate .
```

## Bundle 注册机制

1. 每个 Bundle 在 `pyproject.toml` 中声明 `langflow.extensions` 入口点
2. `extension.json` 清单文件描述组件的位置和元数据
3. 组件通过命名空间 ID 注册：`ext:{bundle}:{ComponentName}@official`
4. 旧版本的类名和导入路径通过迁移表自动重写

## 相关文档

- [扩展包 API 契约](../../BUNDLE_API.md) — Bundle 开发接口规范
- [组件开发指南](../../AGENTS.md#component-development) — 组件开发规范
- [夜间构建说明](NIGHTLY.md) — 夜间版本发布流程
