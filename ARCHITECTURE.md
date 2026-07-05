# Langflow 项目架构总览

## 项目简介

Langflow 是一个基于 **Python/FastAPI 后端 + React/TypeScript 前端** 的 AI 智能体可视化工作流构建平台。它提供了拖拽式的工作流编辑器、内置 API 服务、MCP 服务，以及一个轻量级的执行器 CLI（lfx），让开发者能够快速构建、调试和部署基于 LLM 的应用。

## 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| 后端框架 | FastAPI (Python 3.10-3.14) | 高性能异步 Web 框架 |
| 前端框架 | React 19 + TypeScript + Vite | 现代化 SPA 开发 |
| 状态管理 | Zustand | 轻量级 React 状态管理 |
| 图可视化 | @xyflow/react | 工作流画布渲染 |
| 样式方案 | Tailwind CSS | 原子化 CSS 框架 |
| 数据库 | SQLAlchemy + Alembic | ORM 与数据库迁移 |
| 包管理 | uv (>=0.4) / npm | Python 和 Node.js 依赖管理 |
| 图执行引擎 | 自研 graph 模块 | 基于 DAG 的组件执行引擎 |
| CLI 工具 | lfx | 轻量级工作流执行器 |

## 仓库结构总览

```
OntoL-langflow-web-Agent/
├── ARCHITECTURE.md              # 本文档 — 架构总览
├── AGENTS.md                    # AI 编码代理使用指南
├── CLAUDE.md                    # Claude Code 入口
├── DESIGN.md                    # 设计系统规范（颜色、主题）
├── DEVELOPMENT.md               # 本地开发环境搭建
├── BUNDLE_API.md                # 扩展包 API 契约
├── CONTRIBUTING.md              # 贡献指南
├── SECURITY.md                  # 安全策略
├── RELEASE.md                   # 发布流程
├── CODE_OF_CONDUCT.md           # 行为准则
│
├── Makefile                     # 构建协调入口
├── pyproject.toml               # Python 工作区配置（uv）
├── uv.lock                      # Python 依赖锁文件
│
├── src/                         # 核心源代码
│   ├── backend/                 # Python 后端
│   ├── frontend/                # React/TypeScript 前端
│   ├── lfx/                     # 轻量级执行器 CLI
│   ├── sdk/                     # Python SDK
│   ├── langflow-stepflow/       # StepFlow 编排引擎
│   └── bundles/                 # 扩展组件包
│
├── docker/                      # Docker 构建配置
├── docker_example/              # Docker 部署示例
├── deploy/                      # 生产部署配置
├── docs/                        # 文档站点（Docusaurus）
├── scripts/                     # 运维和 CI 脚本
├── .github/                     # GitHub Actions CI/CD
├── .agents/                     # AI 代理技能定义
├── .cursor/                     # Cursor 编辑器配置
├── .devcontainer/               # VS Code Dev Container
└── regressions/                 # 回归测试用例
```

## 核心模块架构

### 1. 后端 (`src/backend/`)

```
src/backend/
├── base/langflow/       # langflow-base 核心包
│   ├── api/             # FastAPI 路由 (v1 API, v2 API)
│   ├── services/        # 服务层：auth, database, cache, storage, tracing...
│   ├── graph/           # DAG 图执行引擎
│   ├── custom/          # 自定义组件框架
│   ├── schema/          # 数据模型与 Schema 定义
│   ├── processing/      # 数据处理管道
│   ├── template/        # 组件模板系统
│   ├── inputs/          # 输入类型定义
│   ├── io/              # I/O 类型系统
│   ├── base/            # 基础组件类（agents, data, models, prompts...）
│   ├── agentic/         # 智能体编排 API 与 MCP
│   ├── cli/             # CLI 命令入口
│   ├── alembic/         # 数据库迁移
│   ├── initial_setup/   # 初始数据与 Starter 项目
│   └── logging/         # 日志系统
│
├── langflow/            # langflow 主包（含所有集成）
│   └── version/         # 版本号
│
├── src/lfx/             # LFX 后端组件（与独立的 lfx 包共享代码）
└── tests/               # 测试目录
    ├── unit/            # 单元测试
    ├── integration/     # 集成测试
    ├── performance/     # 性能测试
    ├── stress/          # 压力测试
    └── locust/          # 负载测试
```

**关键设计模式：**
- **服务层模式**：所有外部依赖（数据库、缓存、存储）通过服务层抽象，支持插件化替换
- **组件模式**：每个 AI 能力封装为独立的 `Component`，通过声明式 IO 定义连接
- **图执行引擎**：基于 DAG 拓扑排序执行组件，支持流式输出

### 2. 前端 (`src/frontend/`)

```
src/frontend/src/
├── components/          # UI 组件
│   ├── core/            # 核心工作流画布组件
│   ├── common/          # 通用 UI 组件
│   ├── ui/              # 基础 UI 原子组件
│   ├── authorization/   # 权限控制组件
│   ├── extensions/      # 扩展点组件
│   └── examples/        # 示例组件
├── stores/              # Zustand 状态管理
├── hooks/               # 自定义 React Hooks
├── pages/               # 页面级组件
├── modals/              # 模态框组件
├── controllers/         # API 控制器
├── types/               # TypeScript 类型定义
├── constants/           # 常量定义
├── utils/               # 工具函数
├── helpers/             # 辅助函数
├── contexts/            # React Context 定义
├── icons/               # 自定义 SVG 图标
├── style/               # 全局样式
├── locales/             # 国际化文件
├── CustomNodes/         # 自定义节点组件
└── CustomEdges/         # 自定义连线组件
```

**关键设计模式：**
- **Zustand 状态管理**：全局状态（工作流、用户、UI）通过 Zustand store 管理
- **组件注册模式**：节点类型通过 `nodeTypes` 注册表动态渲染
- **API 控制器层**：所有后端 API 调用通过控制器封装

### 3. LFX 执行器 (`src/lfx/`)

独立的 CLI 工具，用于无头运行工作流：

```
src/lfx/src/lfx/
├── components/          # 内置组件库
├── services/            # 服务抽象（无状态实现）
├── extension/           # 扩展系统与 Bundle API
├── graph.py             # 图构建与执行
├── templates/           # CI/CD 模板
│   ├── flows/           # 示例工作流文件
│   ├── github-actions/  # GitHub Actions 模板
│   ├── gitlab-ci/       # GitLab CI 模板
│   └── shell/           # Shell 脚本模板
└── custom/              # 自定义组件框架
```

**核心命令：**
- `lfx serve` — 将工作流作为 FastAPI 端点暴露
- `lfx run` — 本地执行工作流并输出到 stdout
- `lfx-mcp` — 启动 MCP 服务器

### 4. SDK (`src/sdk/`)

Python SDK 包，允许在 Python 代码中程序化调用 Langflow API：

```
src/sdk/src/langflow_sdk/
├── client.py        # API 客户端
└── ...
```

### 5. StepFlow (`src/langflow-stepflow/`)

工作流编排引擎，提供步骤化的流程编排能力。

### 6. 扩展组件包 (`src/bundles/`)

独立发布的组件扩展包：

```
src/bundles/
├── arxiv/           # arXiv 学术搜索组件
├── docling/         # 文档解析组件
├── duckduckgo/      # DuckDuckGo 搜索组件
└── ibm/             # IBM Watsonx 集成组件
```

每个 Bundle 通过 `langflow.extensions` 入口点注册，安装后自动加载。

## 数据流架构

```
用户请求 (HTTP/WebSocket)
  │
  ▼
FastAPI 路由层 (api/v1, api/v2)
  │
  ▼
服务层 (auth → authorization → flow → session → tracing)
  │
  ▼
图执行引擎 (graph/)
  ├── 拓扑排序
  ├── 组件实例化
  ├── 流式执行 (yield per component)
  └── 输出聚合
  │
  ▼
组件层 (custom/custom_component/)
  ├── LLM 调用 (OpenAI, Anthropic, etc.)
  ├── 数据处理 (URL, File, etc.)
  └── 工具调用 (Search, Calculator, etc.)
  │
  ▼
响应 (JSON / SSE / WebSocket)
```

## 安全架构

- **认证**：API Key + JWT Token 双模式
- **授权（RBAC）**：基于 Casbin 的规则引擎，支持资源级别权限控制
- **API Key**：`x-api-key` header 或 `?x-api-key=` query 参数

## 部署架构

Langflow 支持多种部署方式：

| 方式 | 适用场景 | 配置位置 |
|------|----------|----------|
| Python 包 | 本地开发 / 试用 | `uv pip install langflow` |
| Docker 单容器 | 快速部署 | `docker/Dockerfile` |
| Docker Compose | 带依赖服务 | `deploy/docker-compose.yml` |
| 云平台 | 生产环境 | GCP (`scripts/gcp/`), Render (`render.yaml`) |
| Dev Container | 开发环境 | `.devcontainer/` |

## 开发工作流

```bash
# 初始化开发环境
make init

# 后端开发（热重载）
make backend        # FastAPI → localhost:7860

# 前端开发（热重载）
make frontend       # Vite → localhost:3000

# 完整构建运行
make run_cli        # 构建前端 + 启动全部服务

# 代码质量
make format         # 格式化 (ruff + biome)
make lint           # 类型检查 (mypy)
make unit_tests     # 后端单元测试
make tests_frontend # 前端 E2E 测试
```

## 相关文档

- [开发环境搭建](DEVELOPMENT.md) — 如何搭建本地开发环境
- [设计系统](DESIGN.md) — UI 颜色、主题规范
- [扩展包 API](BUNDLE_API.md) — Bundle 开发接口契约
- [贡献指南](CONTRIBUTING.md) — 如何贡献代码
- [发布流程](RELEASE.md) — 版本发布规范
- [LFX 使用指南](src/lfx/README.md) — CLI 执行器文档
