# Langflow 前端

React 19 + TypeScript + Vite 构建的 Langflow 前端应用。

## 目录结构

```
src/frontend/
├── README.md                    # 本文档
├── package.json                 # Node.js 依赖配置
├── vite.config.ts               # Vite 构建配置
├── tsconfig.json                # TypeScript 配置
├── tailwind.config.js           # Tailwind CSS 配置
│
├── src/
│   ├── components/              # UI 组件
│   │   ├── core/                # 核心画布组件（节点、连线、工具栏）
│   │   ├── common/              # 通用 UI 组件
│   │   ├── ui/                  # 基础原子组件（按钮、输入框等）
│   │   ├── authorization/       # 权限控制组件
│   │   ├── extensions/          # 扩展点组件
│   │   └── examples/            # 示例展示组件
│   ├── stores/                  # Zustand 状态管理
│   ├── hooks/                   # 自定义 React Hooks
│   ├── pages/                   # 页面级组件
│   ├── modals/                  # 模态框组件
│   ├── controllers/             # API 调用控制器
│   ├── types/                   # TypeScript 类型定义
│   ├── constants/               # 常量定义
│   ├── utils/                   # 工具函数
│   ├── helpers/                 # 辅助函数
│   ├── contexts/                # React Context 定义
│   ├── icons/                   # 自定义 SVG 图标组件
│   ├── locales/                 # 国际化翻译文件
│   ├── style/                   # 全局样式
│   ├── CustomNodes/             # 自定义节点渲染组件
│   └── CustomEdges/             # 自定义连线渲染组件
│
├── tests/                       # 测试
│   ├── core/                    # 核心功能测试
│   ├── extended/                # 扩展测试
│   └── utils/                   # 测试工具
│
├── public/                      # 静态资源
├── .storybook/                  # Storybook 配置
└── biome-plugins/               # Biome 格式化插件
```

## 技术栈

| 库/工具 | 版本 | 用途 |
|----------|------|------|
| React | 19 | UI 框架 |
| TypeScript | ~5.x | 类型系统 |
| Vite | ~6.x | 构建工具 |
| @xyflow/react | ~12.x | 工作流画布 |
| Zustand | ~5.x | 状态管理 |
| Tailwind CSS | ~4.x | 样式方案 |
| Biome | latest | 代码质量（替代 ESLint + Prettier） |
| Vitest | latest | 单元测试 |
| Playwright | latest | E2E 测试 |
| Storybook | latest | 组件开发与文档 |

## 开发命令

```bash
# 启动开发服务器（热重载）
npm run dev
# 或通过项目根目录
make frontend

# 构建生产版本
npm run build

# 运行单元测试
npm run test
# 或通过项目根目录
make test_frontend

# 运行 E2E 测试
make tests_frontend

# 代码格式化
npm run format
# 或通过项目根目录
make format_frontend

# 启动 Storybook
npm run storybook
```

## 核心设计

### 状态管理

使用 Zustand 进行全局状态管理，核心 Store 包括：
- **Flow Store** — 工作流节点、连线、执行状态
- **UI Store** — 界面布局、面板状态、主题
- **Auth Store** — 用户认证信息
- **Settings Store** — 应用配置

### 画布渲染

基于 `@xyflow/react` 的工作流画布：
- `CustomNodes/` — 自定义节点组件，每种组件类型对应不同的渲染逻辑
- `CustomEdges/` — 自定义连线组件，用于数据流可视化
- 支持拖拽添加、连线、缩放、平移等交互

### 组件注册

节点类型通过注册表动态渲染，添加新组件只需：
1. 在 `CustomNodes/` 下创建节点组件
2. 在注册表中注册节点类型
3. Python 组件自动映射到对应的前端节点

### API 通信

通过 Controllers 层封装所有后端 API 调用：
- 统一错误处理
- 请求缓存与去重
- 流式响应处理（Server-Sent Events）

## 相关文档

- [架构总览](../../ARCHITECTURE.md)
- [设计系统](../../DESIGN.md) — 颜色、主题规范
- [开发环境搭建](../../DEVELOPMENT.md)
