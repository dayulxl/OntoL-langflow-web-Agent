# 源代码目录

本目录包含 Langflow 的所有源代码，按照模块化架构组织。

## 模块总览

| 模块 | 路径 | 类型 | 说明 |
|------|------|------|------|
| [后端 (langflow-base)](backend/base/) | Python 包 | 框架 | FastAPI 后端核心，服务层 + API |
| [后端 (langflow)](backend/langflow/) | Python 包 | 应用 | 主应用包，包含所有集成 |
| [前端](frontend/) | React 19 + TS | Web UI | 可视化工作流编辑器 |
| [LFX 执行器](lfx/) | Python CLI | 工具 | 轻量级工作流执行器 |
| [Python SDK](sdk/) | Python 包 | 工具 | 编程式 API 客户端 |
| [StepFlow](langflow-stepflow/) | Python 包 | 引擎 | 步骤化工作流编排引擎 |
| [扩展包](bundles/) | Python 包 × N | 插件 | 独立发布的组件扩展包 |
| [图数据库](neo4j/) | Python 模块 | 工具 | Memgraph / Neo4j 连接客户端 |

## 模块依赖关系

```
langflow-stepflow (编排引擎)
  ↑
langflow-base (核心框架)
  ↑
langflow (完整应用，含所有集成)
  ↑ bundle 注册
bundles/* (独立扩展包，通过入口点注入)
  ↑
langflow-sdk (API 客户端，可独立使用)
  ↑
lfx (CLI 执行器，可独立安装)

src/neo4j/ (独立模块 — pyproject.toml 直接依赖)
  → 使用 neo4j Python driver + langchain_community.graphs.Neo4jGraph
```

## 各个模块详细说明

### [langflow-base (`backend/base/`)](backend/base/)
核心框架包，包含：
- FastAPI API 路由（v1 & v2）
- 可插拔服务层（auth, database, cache, storage, tracing...）
- DAG 图执行引擎
- 自定义组件框架
- 数据库迁移（Alembic）

### [langflow (`backend/langflow/`)](backend/langflow/)
主应用包，包含所有提供商集成和完整功能。

### [前端 (`frontend/`)](frontend/)
基于 React 19 + TypeScript + Vite 构建：
- 可视化工作流画布（@xyflow/react）
- Zustand 状态管理
- Tailwind CSS 样式
- Storybook 组件开发

### [LFX (`lfx/`)](lfx/)
独立的 CLI 工具：
- `lfx serve` — 将 Flow 作为 API 暴露
- `lfx run` — 本地执行 Flow
- `lfx-mcp` — MCP 服务器
- Flow DevOps 工具包（init, create, validate, push, pull...）

### [SDK (`sdk/`)](sdk/)
Python API 客户端，用于编程式调用 Langflow：
- 工作流管理
- 工作流执行
- 组件元数据查询

### [StepFlow (`langflow-stepflow/`)](langflow-stepflow/)
步骤化编排引擎，提供：
- 步骤级执行
- 状态管理
- 错误恢复与回滚

### [扩展包 (`bundles/`)](bundles/)
独立发布的组件包：
- arXiv — 学术搜索
- Docling — 文档解析
- DuckDuckGo — 网页搜索
- IBM Watsonx — AI 模型 + 向量存储
- **Memgraph/Neo4j** — 图数据库 Cypher 查询组件 ([memgraph/](bundles/memgraph/))
  - `MemgraphCypherComponent` — 执行 Cypher 并返回 DataFrame
  - 兼容 Memgraph 零认证 + Neo4j 认证模式

### [图数据库 (`neo4j/`)](neo4j/)

Memgraph / Neo4j 图数据库连接客户端，基于 `neo4j` 原生驱动：

- 兼容 Memgraph 零认证模式
- Cypher 查询 / 写入 / 批量操作
- 图 Schema 探索
- 本体模型批量导入：`import_model()` / `import_attrs()`
- 全局单例：`get_graph_db()`

```python
from client import get_graph_db
db = get_graph_db()
db.query("MATCH (n) RETURN n LIMIT 10")
```

## 文件存储

上传文件（图片、文档等）默认存储在：

```
Windows:  C:\Users\<用户名>\AppData\Local\langflow\langflow\
Linux:    ~/.langflow/langflow/
```

可通过 `LANGFLOW_CONFIG_DIR` 环境变量自定义路径。详见 [数据库文档](../docs/backend/DATABASE.md#九文件存储)。

## 开发

```bash
# 安装所有依赖
make init

# 后端开发（热重载）
make backend

# 前端开发（热重载）
make frontend

# 运行测试
make unit_tests          # 后端单元测试
make test_frontend       # 前端单元测试
make tests_frontend      # 前端 E2E 测试
```

## 相关文档

- [架构总览](../ARCHITECTURE.md) — 项目级架构文档
- [开发环境搭建](../DEVELOPMENT.md) — 开发环境配置
- [设计系统](../DESIGN.md) — UI 设计规范
