# langflow-base 核心包

`langflow-base` 是 Langflow 的核心框架包，包含了构建 AI 工作流所需的所有基础设施。

## 模块组成

```
langflow/
├── api/             # FastAPI 路由层（v1 & v2 API）
├── services/        # 可插拔服务抽象层
├── graph/           # DAG 图执行引擎
├── custom/          # 自定义组件框架
├── schema/          # 数据模型与 Schema
├── processing/      # 数据处理管道
├── template/        # 组件模板系统
├── inputs/          # 输入类型定义
├── io/              # I/O 类型系统
├── base/            # 基础组件类型
├── agentic/         # 智能体编排（API + MCP）
├── cli/             # CLI 命令入口
├── alembic/         # 数据库迁移
├── initial_setup/   # 初始数据与 Starter 项目
├── logging/         # 日志系统
├── events/          # 事件系统
├── utils/           # 工具函数
└── helpers/         # 辅助函数
```

## 服务层

所有外部依赖通过可插拔的服务抽象层注入，支持以下服务：

| 服务 | 模块 | 说明 |
|------|------|------|
| 认证 | `services/auth/` | API Key + JWT 认证 |
| 授权 | `services/authorization/` | RBAC 权限控制（基于 Casbin） |
| 数据库 | `services/database/` | SQLAlchemy 异步会话管理 |
| 缓存 | `services/cache/` | Redis / 内存缓存 |
| 存储 | `services/storage/` | 文件上传与管理 |
| 追踪 | `services/tracing/` | OpenTelemetry 链路追踪 |
| 会话 | `services/session/` | 用户会话管理 |
| 配置 | `services/settings/` | 全局配置管理 |
| 遥测 | `services/telemetry/` | 匿名使用统计 |

## 组件框架

自定义组件框架位于 `custom/custom_component/`：

- `Component` — 所有组件的基类
- 声明式 `inputs` 定义参数接口
- 声明式 `outputs` 定义输出接口
- 框架负责实例化、连接和执行

## 快速开始

```bash
# 开发模式（热重载，加载全部组件）
LFX_DEV=1 uv run langflow run

# 仅加载特定模块
LFX_DEV=openai,anthropic uv run langflow run
```

## 相关文档

- [后端架构](../../README.md) — 后端完整文档
- [架构总览](../../../ARCHITECTURE.md) — 项目级架构
