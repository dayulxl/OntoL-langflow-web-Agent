# langflow-stepflow — StepFlow 编排引擎

Langflow 的工作流步骤编排执行引擎，提供步骤化的流程编排能力。

## 目录结构

```
src/langflow-stepflow/
├── README.md                    # 本文档
├── pyproject.toml               # Python 包配置
├── src/langflow_stepflow/       # 引擎源代码
└── tests/                       # 测试
    ├── helpers/                 # 测试辅助
    ├── integration/             # 集成测试
    └── unit/                    # 单元测试
```

## 安装

```bash
pip install langflow-stepflow
```

## 功能概述

StepFlow 提供了原生的步骤级工作流编排能力，与 Langflow 主引擎配合使用：

- **步骤化执行** — 将工作流分解为可追踪的执行步骤
- **状态管理** — 维护每个步骤的执行状态和中间结果
- **错误恢复** — 支持步骤级别的重试和回滚
- **并行执行** — 在独立步骤间支持并行处理

## 开发

```bash
# 安装开发依赖
uv sync --group dev --package langflow-stepflow

# 运行测试
uv run pytest src/langflow-stepflow/tests/
```

## 相关文档

- [架构总览](../../ARCHITECTURE.md)
- [LFX 执行器](../lfx/README.md)
