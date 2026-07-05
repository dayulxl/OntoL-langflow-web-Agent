# 后端模块

本模块是 Langflow 的 Python 后端，基于 FastAPI 框架构建。

## 目录结构

```
src/backend/
├── README.md                        # 本文档
│
├── base/langflow/                   # langflow-base 核心包
│   ├── api/                         # FastAPI 路由层
│   │   ├── v1/                      # API v1 路由
│   │   ├── v2/                      # API v2 路由
│   │   └── utils/                   # API 工具函数
│   ├── services/                    # 服务抽象层
│   │   ├── auth/                    # 认证服务
│   │   ├── authorization/           # 授权服务（RBAC）
│   │   ├── database/                # 数据库服务（SQLAlchemy）
│   │   ├── cache/                   # 缓存服务
│   │   ├── storage/                 # 文件存储服务
│   │   ├── tracing/                 # 链路追踪服务
│   │   ├── session/                 # 会话管理服务
│   │   ├── settings/                # 配置管理服务
│   │   ├── telemetry/               # 遥测服务
│   │   ├── flow/                    # 工作流管理服务
│   │   ├── chat/                    # 聊天服务
│   │   ├── task/                    # 任务队列服务
│   │   ├── jobs/                    # 后台任务服务
│   │   ├── state/                   # 状态管理服务
│   │   ├── store/                   # 存储抽象服务
│   │   ├── variable/                # 全局变量服务
│   │   └── ...
│   ├── graph/                       # 图执行引擎
│   ├── custom/                      # 自定义组件框架
│   │   └── custom_component/        # 组件基类与注册
│   ├── schema/                      # 数据模型定义
│   ├── processing/                  # 数据处理管道
│   ├── template/                    # 组件模板系统
│   ├── base/                        # 基础组件类型
│   │   ├── agents/                  # Agent 基类
│   │   ├── data/                    # Data 基类
│   │   ├── embeddings/              # Embedding 基类
│   │   ├── io/                      # I/O 基类
│   │   ├── models/                  # 模型基类
│   │   ├── prompts/                 # Prompt 基类
│   │   ├── tools/                   # 工具基类
│   │   ├── vectorstores/            # 向量存储基类
│   │   └── textsplitters/           # 文本分割器基类
│   ├── agentic/                     # 智能体编排
│   │   ├── api/                     # 智能体 API 路由
│   │   ├── mcp/                     # MCP 服务
│   │   ├── flows/                   # 智能体工作流
│   │   ├── services/                # 智能体服务
│   │   └── helpers/                 # 智能体辅助函数
│   ├── inputs/                      # 输入类型定义
│   ├── io/                          # I/O 类型系统
│   ├── cli/                         # CLI 命令入口
│   ├── alembic/                     # 数据库迁移
│   ├── initial_setup/               # 初始数据与 Starter 项目
│   ├── logging/                     # 日志系统
│   ├── utils/                       # 工具函数
│   ├── helpers/                     # 辅助函数
│   ├── events/                      # 事件系统
│   └── ...
│
├── langflow/                        # langflow 主包
│   └── version/                     # 版本号定义
│
├── src/lfx/                         # LFX 后端组件
└── tests/                           # 测试目录
    ├── unit/                        # 单元测试
    ├── integration/                 # 集成测试
    ├── performance/                 # 性能测试
    ├── stress/                      # 压力测试
    ├── locust/                      # 负载测试
    ├── data/                        # 测试数据
    └── test_migrations/             # 迁移测试
```

## 核心设计原则

### 1. 服务层模式
所有外部依赖（数据库、缓存、存储、追踪）通过服务层抽象。服务接口定义在 `langflow-base` 中，具体实现在 `langflow` 包内，遵循依赖反转原则。

### 2. 声明式组件
每个 AI 能力都是一个 `Component` 子类，通过 `inputs`（声明式参数定义）和 `outputs`（声明式输出定义）描述其接口。框架负责实例化、连接和执行。

### 3. DAG 执行引擎
工作流中的组件形成有向无环图（DAG），执行引擎按拓扑排序依次运行每个组件，支持流式输出和错误隔离。

### 4. 插件化授权
授权层与认证分离，支持通过 `langflow.services.authorization` 插件注册自定义权限策略。

## 技术栈

| 组件 | 技术 | 说明 |
|------|------|------|
| Web 框架 | FastAPI | 异步高性能，自动生成 OpenAPI 文档 |
| ORM | SQLAlchemy 2.x | 异步会话，声明式模型 |
| 数据库迁移 | Alembic | 自动迁移生成 |
| 缓存 | redis / 内存 | 可配置后端 |
| 任务队列 | 自研 | 基于 asyncio 的轻量级队列 |
| 链路追踪 | OpenTelemetry | 可对接多种后端 |
| 配置管理 | pydantic-settings | 环境变量 + .env 文件 |

## 快速开始

```bash
# 安装依赖
make init

# 启动后端（开发模式，热重载）
make backend
# 服务启动于 http://localhost:7860

# API 文档
# Swagger UI: http://localhost:7860/docs
# ReDoc: http://localhost:7860/redoc
```

## 相关文档

- [架构总览](../../ARCHITECTURE.md)
- [LFX 执行器](../lfx/README.md)
- [开发环境搭建](../../DEVELOPMENT.md)
- [扩展包 API](../../BUNDLE_API.md)
