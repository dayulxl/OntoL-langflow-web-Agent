# AI 代理技能目录

本目录存放 Langflow 项目专用的 AI 编码代理技能（Agent Skills）定义。每个技能提供了特定领域的知识、规则和最佳实践，AI 编码助手在处理相关任务时会自动参考这些技能。

## 可用技能

### 后端代码审查 (`backend-code-review/`)

后端代码审查技能，包含以下参考规则：
- **`architecture-rule.md`** — 后端架构规范，组件分层与依赖方向
- **`db-schema-rule.md`** — 数据库 Schema 设计规范，模型字段与索引
- **`repositories-rule.md`** — 数据访问层规范，Repository 模式使用
- **`sqlalchemy-rule.md`** — SQLAlchemy ORM 使用规范，查询与关系

### 组件重构 (`component-refactoring/`)

Python 组件重构技能，包含以下参考：
- **`complexity-patterns.md`** — 复杂度识别模式，圈复杂度与认知复杂度阈值
- **`component-splitting.md`** — 组件拆分策略，何时拆分以及如何拆分
- **`hook-extraction.md`** — Hook 抽取模式，复用逻辑的提取方法

### 端到端测试 (`e2e-testing/`)

Playwright E2E 测试技能，包含以下参考：
- **`fixtures.md`** — 测试夹具定义与复用
- **`helpers.md`** — 测试辅助函数，等待、断言、页面操作
- **`selectors.md`** — 选择器约定，数据属性优先原则

### 前端代码审查 (`frontend-code-review/`)

React/TypeScript 前端代码审查技能，包含以下参考：
- **`business-logic.md`** — 业务逻辑审查要点，状态管理与副作用
- **`code-quality.md`** — 代码质量审查要点，命名、结构、类型
- **`performance.md`** — 性能审查要点，渲染优化、内存泄漏

### 前端查询与变更 (`frontend-query-mutation/`)

API 查询与变更模式技能，包含以下参考：
- **`query-patterns.md`** — 数据查询模式，React Query 使用规范
- **`runtime-rules.md`** — 运行时规则，错误处理、缓存策略

### 前端测试 (`frontend-testing/`)

Jest + React Testing Library 测试技能，包含以下参考：
- **`async-testing.md`** — 异步测试方法，等待与模拟
- **`checklist.md`** — 测试检查清单，覆盖范围要求

以及测试模板：
- **`assets/component-test.template.tsx`** — 组件测试模板
- **`assets/hook-test.template.ts`** — Hook 测试模板
- **`assets/utility-test.template.ts`** — 工具函数测试模板

## 目录结构

```
.agents/
├── README.md                    # 本文档
└── skills/                      # 技能定义
    ├── backend-code-review/     # 后端代码审查
    │   └── references/          # 规则参考文档
    ├── component-refactoring/   # 组件重构
    │   └── references/
    ├── e2e-testing/            # E2E 测试
    │   └── references/
    ├── frontend-code-review/   # 前端代码审查
    │   └── references/
    ├── frontend-query-mutation/ # 前端查询变更
    │   └── references/
    └── frontend-testing/       # 前端测试
        ├── assets/             # 测试模板文件
        └── references/         # 规则参考文档
```

## 使用方式

这些技能在 AI 编码代理（如 Claude Code）中被自动加载。当开发者执行以下操作时，对应技能会被触发：

- 提交代码审查请求 → `*-code-review` 技能
- 编写或重构组件 → `component-refactoring` 技能
- 编写测试 → `*-testing` 技能
- 修改 API 查询逻辑 → `frontend-query-mutation` 技能

## 相关文档

- [架构总览](../ARCHITECTURE.md)
- [开发指南](../DEVELOPMENT.md)
- [贡献指南](../CONTRIBUTING.md)
